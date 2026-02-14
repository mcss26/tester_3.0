# Admin: Test Devenciones

> **Rol**: Admin (Internal Resource)
> **Ruta**: `pages/admin/test-devenciones.html`
> **Tipo**: Test Suite (Jasmine-like runner)
> **Estado**: Verificado
> **Última Actualización**: 2026-02-08

> [!CAUTION]
> Esta herramienta es de uso interno para desarrollo y debugging del motor de nómina. No debe ser utilizada en producción durante horarios pico.

---

## 1. Información General

### 1.1 ¿Quién lo usa?

**Desarrolladores** y **Administradores de Sistema** para validar la integridad del motor de devengados (Staff Accruals).

### 1.2 ¿Qué hace?

Ejecuta una batería de pruebas automatizadas en el navegador para verificar que la base de datos, las funciones RPC y las políticas de seguridad (RLS) del módulo de sueldos estén funcionando correctamente.

### 1.3 ¿Cómo lo hace?

Utiliza un ejecutor de pruebas ligero (sin dependencias externas salvo Supabase Client) que corre secuencialmente validaciones contra la DB en vivo.

---

## 2. Cobertura de Pruebas

La suite valida 7 áreas críticas:

### 2.1 Conexión & Auth

- Verifica inicialización de `window.sb`.
- Confirma sesión activa y roles permitidos (`admin`, `contable`).

### 2.2 Schema Verification

- Existencia de tabla `staff_accruals`.
- Integridad referencial (Foreign Keys).
- Constraints únicos (prevención de duplicados por jornada/usuario).
- Columnas calculadas (Generated Columns).

### 2.3 Vistas

- Accesibilidad de `vw_staff_accruals_summary`.

### 2.4 RPC Functions (Core Logic)

- **`admin_generate_workday_accruals`**: Prueba la generación de sueldos basada en convocatorias.
  - Test de Idempotencia (correrlo 2 veces no duplica deuda).
  - Test de Ajuste Manual (verificar que se respeten edits manuales).
- **`admin_export_accruals_to_payments`**: Verifica la función de exportación a pagos.

### 2.5 RLS Policies

- Verifica que Admin pueda leer/escribir.
- Confirma que las reglas de seguridad no bloqueen operaciones legítimas.

---

## 3. Uso

1. Navegar a `/pages/admin/test-devenciones.html`.
2. La suite arranca automáticamente.
3. Observar la barra de resumen:
   - ✅ **Green**: Todo OK.
   - ❌ **Red**: Fallo crítico (revisar consola para stack trace).
   - ⏩ **Yellow**: Skipped (normal si no hay datos de prueba vivos).

---

## 4. Notas Técnicas

- **Performance**: Las pruebas corren en serie para no saturar la conexión. Tiempo típico: < 500ms.
- **Datos de Prueba**: Intenta usar una jornada "real" (`staff_convocations` confirmadas). Si no encuentra datos, salta (SKIP) las pruebas lógicas pero ejecuta las estructurales.

---

## 5. Referencias

- [Módulo Workdays](workdays.md)
