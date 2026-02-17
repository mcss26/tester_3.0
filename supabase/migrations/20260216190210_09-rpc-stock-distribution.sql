CREATE OR REPLACE FUNCTION rpc_distribute_stock(
    p_request_id uuid,
    p_items jsonb,
    p_distributed_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request_status text;
    v_workday_count integer;
    v_item jsonb;
    v_sku_id uuid;
    v_distributed_packs numeric;
    v_sku_active boolean;
    v_units_per_pack numeric;
    v_current_stock numeric;
    v_distributed_units numeric;
    v_items_distributed_count integer := 0;
    v_total_units_distributed numeric := 0;
    v_sku_name text;
BEGIN
    SELECT status INTO v_request_status
    FROM public.replenishment_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud de reposicion con ID % no existe', p_request_id;
    END IF;

    IF v_request_status NOT IN ('pending', 'approved') THEN
        RAISE EXCEPTION 'La solicitud % no esta en estado pendiente o aprobada (estado actual: %)', p_request_id, v_request_status;
    END IF;

    SELECT count(*) INTO v_workday_count
    FROM public.work_days
    WHERE status IN ('ACTIVE', 'PLANNED');

    IF v_workday_count = 0 THEN
        RAISE EXCEPTION 'No hay jornada activa para distribuir stock';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_sku_id := (v_item->>'sku_id')::uuid;
        v_distributed_packs := (v_item->>'distributed_packs')::numeric;

        SELECT nombre, pack_qty, active INTO v_sku_name, v_units_per_pack, v_sku_active
        FROM public.master_sku
        WHERE id = v_sku_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'SKU con ID % no encontrado en master_sku', v_sku_id;
        END IF;

        IF NOT v_sku_active THEN
            RAISE EXCEPTION 'SKU % (ID: %) no esta activo.', v_sku_name, v_sku_id;
        END IF;
        
        v_distributed_units := v_distributed_packs * COALESCE(v_units_per_pack, 1);

        SELECT stock_actual INTO v_current_stock
        FROM public.inventory_stock
        WHERE sku_id = v_sku_id
        FOR UPDATE;

        IF NOT FOUND OR v_current_stock < v_distributed_units THEN
            RAISE EXCEPTION 'Stock insuficiente para SKU %. Requerido: % unidades, Disponible: % unidades.', v_sku_name, v_distributed_units, COALESCE(v_current_stock, 0);
        END IF;

        UPDATE public.inventory_stock
        SET stock_actual = stock_actual - v_distributed_units
        WHERE sku_id = v_sku_id;

        INSERT INTO public.inventory_movements (sku_id, qty_delta, movement_type, ref_table, ref_id, created_by)
        VALUES (v_sku_id, -v_distributed_units, 'SALIDA', 'replenishment_requests', p_request_id, p_distributed_by);

        UPDATE public.replenishment_items
        SET status = 'received'
        WHERE request_id = p_request_id AND sku_id = v_sku_id;

        v_items_distributed_count := v_items_distributed_count + 1;
        v_total_units_distributed := v_total_units_distributed + v_distributed_units;
    END LOOP;

    UPDATE public.replenishment_requests
    SET status = 'distributed'
    WHERE id = p_request_id;

    RETURN jsonb_build_object(
        'request_id', p_request_id,
        'items_distributed', v_items_distributed_count,
        'total_units', v_total_units_distributed,
        'distributed_by', p_distributed_by,
        'timestamp', now()
    );
END;
$$;
