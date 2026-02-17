# Doc Mapper -- Acciones Recomendadas

> Generado por Gemini CLI: 2026-02-17 07:43

---

(node:32884) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:4240) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Loaded cached credentials.
Hook registry initialized with 0 hook entries
Aqu├¡ est├í el reporte de acci├│n como Agente de QA para FormulaMid 4.

---

### **Resumen Ejecutivo**

El an├ílisis del mapa de documentaci├│n revela serios problemas de mantenimiento, integridad y accesibilidad. La gran mayor├¡a de los documentos (68%) est├ín "hu├®rfanos", sin referencias entrantes, lo que los hace imposibles de descubrir a trav├®s de la navegaci├│n normal. Se han detectado dependencias rotas cr├¡ticas (links incorrectos) y documentos de alto nivel desactualizados.

La documentaci├│n, en su estado actual, es poco fiable como fuente de verdad. Se requiere una intervenci├│n inmediata para restaurar la coherencia y la confianza en el sistema documental.

**Documentation Health Score: 15/100**

---

### **Reporte de Acci├│n por Prioridad**

#### ­ƒÜ¿ CR├ìTICO

1.  **Prioridad:** CR├ìTICO
    **Documento:** `docs/business-logic/flows/workday-management.md` y otros 4 flujos de negocio.
    **Problema:** Documentos que describen la l├│gica de negocio fundamental est├ín hu├®rfanos. No est├ín vinculados desde ning├║n otro documento.
    **Acci├│n Recomendada:** Integrar estos flujos en la documentaci├│n principal. A├▒adir referencias en `docs/estado-presente.md` y `docs/backend-architecture-map.md`.

2.  **Prioridad:** CR├ìTICO
    **Documento:** `docs/codex/PLAN_PRODUCTION_READY.md`
    **Problema:** El plan de producci├│n, un documento estrat├®gico, est├í hu├®rfano y es imposible de encontrar.
    **Acci├│n Recomendada:** Enlazar este plan desde `docs/INDEX.md` y `docs/estado-presente.md`.

3.  **Prioridad:** CR├ìTICO
    **Documento:** `docs/modules/encargados/encargado-recepcion.md` (y otros 3-4 documentos de m├│dulos)
    **Problema:** Contiene links con rutas relativas incorrectas (ej. `./admin/admin-solicitudes.md`). Estos enlaces est├ín rotos y llevan a rutas inexistentes.
    **Acci├│n Recomendada:** Corregir todas las rutas relativas en los `Links MD` para que apunten a la ubicaci├│n correcta (ej. `../admin/admin-solicitudes.md`).

4.  **Prioridad:** CR├ìTICO
    **Documento:** `docs/testing/tickets/TK-005-base-salary-column-missing.md`
    **Problema:** El ticket confirma una dependencia rota entre el c├│digo y la base de datos (columna `base_salary` faltante). Esto indica que la documentaci├│n del schema (`docs/scheme.md`) podr├¡a estar desactualizada.
    **Acci├│n Recomendada:** Verificar `docs/scheme.md` contra la base de datos real. Actualizar el documento para reflejar el esquema actual y resolver el ticket de inmediato.

#### ­ƒƒº ALTO

1.  **Prioridad:** ALTO
    **Documento:** `docs/INDEX.md` (Modificado: 2026-02-16)
    **Problema:** El ├¡ndice principal est├í desactualizado. Documentos clave como `docs/estado-presente.md` (Modificado: 2026-02-17) y `docs/audits/audit-solicitudes-reposicion.md` (2026-02-17) han sido modificados m├ís recientemente.
    **Acci├│n Recomendada:** Revisar y actualizar `docs/INDEX.md` para reflejar los cambios en sus dependencias. Implementar un script de pre-commit que alerte sobre ├¡ndices desactualizados.

2.  **Prioridad:** ALTO
    **Documento:** 39 documentos en `docs/modules/*`
    **Problema:** La gran mayor├¡a de los documentos de m├│dulos est├ín hu├®rfanos. No hay un ├¡ndice de m├│dulos que los conecte, haciendo la documentaci├│n a nivel de componente casi in├║til.
    **Acci├│n Recomendada:** Crear un `docs/modules/README.md` que act├║e como un ├¡ndice, listando y enlazando a todos los m├│dulos. Vincular este nuevo ├¡ndice desde `docs/INDEX.md` y `docs/screen-map.md`.

3.  **Prioridad:** ALTO
    **Documento:** `docs/backend-architecture-map.md` (Modificado: 2026-02-16)
    **Problema:** Aunque es el documento m├ís conectado, no ha sido actualizado junto con `docs/estado-presente.md` (Modificado: 2026-02-17), que es su par conceptual. Es probable que est├® desactualizado.
    **Acci├│n Recomendada:** Realizar una revisi├│n cruzada de `backend-architecture-map.md` contra `estado-presente.md` y `scheme.md` para asegurar consistencia.

#### ­ƒƒ¿ MEDIO

1.  **Prioridad:** MEDIO
    **Documento:** Documentos en `docs/migration/artifacts/`
    **Problema:** Todos los artefactos de migraci├│n est├ín hu├®rfanos. Aunque son hist├│ricos, su falta de conexi├│n indica un registro deficiente.
    **Acci├│n Recomendada:** Editar `docs/migration/README.md` y a├▒adir enlaces a todos los artefactos relevantes para preservar el contexto hist├│rico del proyecto.

2.  **Prioridad:** MEDIO
    **Documento:** `reporte_comparativo_ui_scan.md`
    **Problema:** El documento no tiene t├¡tulo en la metadata y est├í hu├®rfano. Su contenido es desconocido y no est├í conectado con ning├║n otro reporte.
    **Acci├│n Recomendada:** Identificar el prop├│sito del reporte, asignarle un t├¡tulo adecuado, y vincularlo desde `docs/testing/README.md` o un documento de auditor├¡a relevante.

#### ­ƒƒ® BAJO

1.  **Prioridad:** BAJO
    **Documento:** `test-data/README.md`, `scripts/README.md`
    **Problema:** Son documentos hu├®rfanos.
    **Acci├│n Recomendada:** Evaluar si necesitan ser enlazados desde `docs/testing/README.md` o `docs/INDEX.md` para mayor visibilidad. Si su ├║nico prop├│sito es explicar los archivos en su directorio, se puede ignorar.
