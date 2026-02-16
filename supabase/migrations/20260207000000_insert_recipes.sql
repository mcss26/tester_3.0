-- SQL para insertar recetas con external_id
-- Ejecutar en Supabase SQL Editor

-- Opción 1: Actualizar external_id de recetas existentes (si ya existen con nombres similares)
-- Opción 2: Insertar como nuevas recetas

INSERT INTO master_recipes (name, external_id) VALUES ('ABSOLUT RASPBERRY + SPEED', '80') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('AGUA CON GAS', '199') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('AGUA SIN GAS', '198') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT ABSOLUT RASPBERRY + 4 SPEED', '120') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT BRIGHTON + 4 SCHWEPPES TONICA LATA', '127') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY CLASICO + 4 CEPITA DURAZNO', '165') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY CLASICO + 4 SPEED', '114') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY CLASICO + 4 SPRITE LATA', '166') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY COSMIC + 4 SPEED', '309') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY COSMIC + 4 SPRITE LATA', '310') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY RASPBERRY + 4 CEPITA DURAZNO', '169') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY RASPBERRY + 4 CEPITA NARANJA', '168') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY RASPBERRY + 4 SPEED', '116') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('BOT SKY RASPBERRY + 4 SPRITE LATA', '167') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('CEPITA DURAZNO', '161') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('CEPITA NARANJA', '160') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('COCA COLA LATA', '151') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('Descuento Efectivo', 'D001') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('FERNET BRANCA + COCA COLA', '94') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('FERNET BRANCA + COCA ZERO', '178') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('GIN BRIGHTON + SCHWEPPES TONICA', '88') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY CLASICO + CEPITA DURAZNO', '187') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY CLASICO + CEPITA NARANJA', '186') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY CLASICO + SPEED', '74') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY CLASICO + SPRITE LATA', '188') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY COSMIC + CEPITA DURAZNO', '315') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY COSMIC + CEPITA NARANJA', '316') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY COSMIC + SPEED', '313') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY COSMIC + SPRITE LATA', '314') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY RASPBERRY + SPEED', '76') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SKY RASPBERRY + SPRITE LATA', '194') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SPEED LATA', '18') ON CONFLICT DO NOTHING;
INSERT INTO master_recipes (name, external_id) VALUES ('SPRITE LATA', '154') ON CONFLICT DO NOTHING;
