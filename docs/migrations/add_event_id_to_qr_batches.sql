-- Migration: Add event_id to qr_batches
-- Description: Vincular lotes de QR con eventos específicos

ALTER TABLE qr_batches 
ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_qr_batches_event_id ON qr_batches(event_id);

COMMENT ON COLUMN qr_batches.event_id IS 'Evento al que pertenece este lote de QRs';
