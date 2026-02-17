CREATE OR REPLACE FUNCTION rpc_declare_terminal_amounts(
    p_cash_closing_id uuid,
    p_terminal_id uuid,
    p_declared_cash numeric,
    p_declared_zoco numeric,
    p_declared_by uuid,
    p_notes text DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workday_status text;
    v_terminal_active boolean;
    v_existing_record public.closing_terminals%ROWTYPE;
    v_final_record public.closing_terminals%ROWTYPE;
BEGIN
    -- Guard 1: Verify that the cash closing is associated with an ACTIVE workday.
    SELECT wd.status INTO v_workday_status
    FROM public.cash_closings cc
    JOIN public.work_days wd ON cc.work_day_id = wd.id
    WHERE cc.id = p_cash_closing_id;

    IF NOT FOUND OR v_workday_status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'No hay cierre activo para esta jornada';
    END IF;

    -- Guard 2: Verify that the POS terminal is valid and active.
    SELECT pt.is_active INTO v_terminal_active
    FROM public.pos_terminals pt
    WHERE pt.id = p_terminal_id;

    IF NOT FOUND OR v_terminal_active = false THEN
        RAISE EXCEPTION 'Terminal inválida o inactiva';
    END IF;

    -- Guard 3: Check if already submitted (anti-manipulation)
    SELECT * INTO v_existing_record
    FROM public.closing_terminals ct
    WHERE ct.cash_closing_id = p_cash_closing_id AND ct.terminal_id = p_terminal_id;

    IF FOUND AND v_existing_record.status = 'submitted' THEN
        RAISE EXCEPTION 'La declaración para esta terminal ya fue finalizada y no puede ser modificada.';
    END IF;

    -- UPSERT the declaration using real closing_terminals columns
    IF FOUND THEN
        UPDATE public.closing_terminals
        SET
            declared_cash = p_declared_cash,
            declared_zoco = p_declared_zoco,
            staff_id = p_declared_by,
            submitted_at = NOW(),
            status = 'submitted'
        WHERE cash_closing_id = p_cash_closing_id AND terminal_id = p_terminal_id;
    ELSE
        INSERT INTO public.closing_terminals (
            cash_closing_id,
            terminal_id,
            declared_cash,
            declared_zoco,
            system_cash,
            system_zoco,
            staff_id,
            status,
            submitted_at
        )
        VALUES (
            p_cash_closing_id,
            p_terminal_id,
            p_declared_cash,
            p_declared_zoco,
            0,
            0,
            p_declared_by,
            'submitted',
            NOW()
        );
    END IF;

    -- Retrieve final state and return JSONB
    SELECT * INTO v_final_record
    FROM public.closing_terminals
    WHERE cash_closing_id = p_cash_closing_id AND terminal_id = p_terminal_id;

    RETURN jsonb_build_object(
        'terminal_id', v_final_record.terminal_id,
        'declared_cash', v_final_record.declared_cash,
        'declared_zoco', v_final_record.declared_zoco,
        'system_cash', v_final_record.system_cash,
        'system_zoco', v_final_record.system_zoco,
        'diff_cash', v_final_record.declared_cash - v_final_record.system_cash,
        'diff_zoco', v_final_record.declared_zoco - v_final_record.system_zoco,
        'status', v_final_record.status
    );
END;
$$;
