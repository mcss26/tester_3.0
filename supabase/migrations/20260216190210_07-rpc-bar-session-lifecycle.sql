CREATE OR REPLACE FUNCTION rpc_open_bar_session(
    p_work_day_id uuid,
    p_location text,
    p_opened_by uuid,
    p_opening_stock jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_work_day_status text;
    v_active_session_id uuid;
    v_new_session_id uuid;
    v_stock_item jsonb;
BEGIN
    -- Guard 1: Verify work_day is active
    SELECT status INTO v_work_day_status
    FROM public.work_days
    WHERE id = p_work_day_id;

    IF NOT FOUND OR v_work_day_status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'Work day with ID % is not active or does not exist.', p_work_day_id;
    END IF;

    -- Guard 2: Verify no active session for the same location and work day
    SELECT id INTO v_active_session_id
    FROM public.bar_sessions
    WHERE work_day_id = p_work_day_id
      AND location = p_location
      AND status = 'active';

    IF v_active_session_id IS NOT NULL THEN
        RAISE EXCEPTION 'An active bar session already exists for location % on this work day.', p_location;
    END IF;

    -- Create the new bar session
    INSERT INTO public.bar_sessions (work_day_id, location, status, opened_by, opened_at)
    VALUES (p_work_day_id, p_location, 'active', p_opened_by, NOW())
    RETURNING id INTO v_new_session_id;

    -- Insert opening stock snapshot
    IF jsonb_array_length(p_opening_stock) > 0 THEN
        FOR v_stock_item IN SELECT * FROM jsonb_array_elements(p_opening_stock)
        LOOP
            INSERT INTO public.bar_stock_snapshots (session_id, sku_id, quantity, type)
            VALUES (
                v_new_session_id,
                (v_stock_item->>'sku_id')::uuid,
                (v_stock_item->>'quantity')::numeric,
                'opening'
            );
        END LOOP;
    END IF;

    -- Return the new session ID
    RETURN jsonb_build_object('session_id', v_new_session_id);
END;
$$;

CREATE OR REPLACE FUNCTION rpc_close_bar_session(
    p_session_id uuid,
    p_closed_by uuid,
    p_closing_stock jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session public.bar_sessions;
    v_work_day_status text;
    v_stock_item jsonb;
    v_closed_at timestamptz;
BEGIN
    -- Guard 1: Verify session exists and is active
    SELECT * INTO v_session
    FROM public.bar_sessions
    WHERE id = p_session_id;

    IF NOT FOUND OR v_session.status <> 'active' THEN
        RAISE EXCEPTION 'Bar session with ID % not found or is not active.', p_session_id;
    END IF;

    -- Guard 2: Verify the associated workday is still active
    SELECT status INTO v_work_day_status
    FROM public.work_days
    WHERE id = v_session.work_day_id;

    IF v_work_day_status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'Associated work day ID % is no longer active.', v_session.work_day_id;
    END IF;

    -- Insert closing stock snapshot
    IF jsonb_array_length(p_closing_stock) > 0 THEN
        FOR v_stock_item IN SELECT * FROM jsonb_array_elements(p_closing_stock)
        LOOP
            INSERT INTO public.bar_stock_snapshots (session_id, sku_id, quantity, type)
            VALUES (
                p_session_id,
                (v_stock_item->>'sku_id')::uuid,
                (v_stock_item->>'quantity')::numeric,
                'closing'
            );
        END LOOP;
    END IF;

    -- Update the session to closed
    v_closed_at := NOW();
    UPDATE public.bar_sessions
    SET
        status = 'closed',
        closed_at = v_closed_at,
        closed_by = p_closed_by
    WHERE id = p_session_id;

    -- Return summary
    RETURN jsonb_build_object(
        'session_id', v_session.id,
        'skus_count', jsonb_array_length(p_closing_stock),
        'opened_at', v_session.opened_at,
        'closed_at', v_closed_at
    );
END;
$$;

