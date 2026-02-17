CREATE OR REPLACE FUNCTION admin_export_workday_accruals(p_work_day_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_work_date date;
    v_user_id uuid;
    v_exported_count integer := 0;
BEGIN
    SELECT work_date INTO v_work_date
    FROM public.work_days
    WHERE id = p_work_day_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Workday not found', 'work_day_id', p_work_day_id);
    END IF;

    FOR v_user_id IN
        SELECT DISTINCT user_id
        FROM public.staff_accruals
        WHERE work_day_id = p_work_day_id
          AND status = 'accrued'
    LOOP
        PERFORM admin_export_accruals_to_payments(v_user_id, v_work_date, v_work_date);
        v_exported_count := v_exported_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'exported', v_exported_count,
        'work_day_id', p_work_day_id,
        'work_date', v_work_date
    );
END;
$$;
