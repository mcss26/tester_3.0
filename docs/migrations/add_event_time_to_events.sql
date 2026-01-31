-- Migration: Add event_time to events
-- Description: Agregar hora del evento para countdown preciso

ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time time DEFAULT '23:59:00';
COMMENT ON COLUMN events.event_time IS 'Hora del evento para countdown';
