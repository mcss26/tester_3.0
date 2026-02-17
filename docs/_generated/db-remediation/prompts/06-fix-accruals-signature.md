Eres un Experto en PostgreSQL y Supabase. Tu única tarea es escribir un archivo de migración SQL.

**Objetivo:** Crear un wrapper o alias de la función `admin_export_accruals_to_payments` para alinear la firma documentada con la firma real en producción.

**Contexto de Arquitectura:**
Existe una discrepancia de firma:

- **Firma documentada en `scheme.md`:** `admin_export_accruals_to_payments(id)` — recibe un solo UUID de workday
- **Firma REAL en producción:** `admin_export_accruals_to_payments(p_user_id uuid, p_from date, p_to date)` — recibe usuario + rango de fechas

El frontend (`admin-workdays.js`) puede estar invocando la función con los argumentos incorrectos. La firma real es la correcta porque permite exportar devenciones por usuario en un rango de fechas.

**Tu tarea:**

1. Crear una función de conveniencia `admin_export_workday_accruals(p_work_day_id uuid)` que:
   - Recibe un solo UUID de workday
   - Busca la `work_date` del workday en la tabla `work_days`
   - Obtiene todos los `user_id` DISTINCT de `staff_accruals` WHERE `work_day_id` = p_work_day_id AND `status` = 'accrued'
   - Para cada usuario, llama a la función real `admin_export_accruals_to_payments(user_id, work_date, work_date)` con la fecha del workday como rango de un solo día
   - Retorna un JSONB con resumen: `{"exported": N, "work_day_id": "...", "work_date": "..."}`
2. Usar `CREATE OR REPLACE FUNCTION` con `LANGUAGE plpgsql` y `SECURITY DEFINER`

Tablas de referencia:

- `work_days`: tiene `id` (uuid PK), `work_date` (date), `status` (text)
- `staff_accruals`: tiene `work_day_id` (uuid FK), `user_id` (uuid FK), `status` (text: 'accrued','exported','paid','cancelled')

**Regla Estricta:** Devuelve ÚNICAMENTE código SQL válido. No uses markdown `sql`, no agregues explicaciones, no saludes. El output de este comando se guardará directamente en un archivo .sql.
