---
description: Crear o actualizar un archivo de documentación Q&A para un módulo específico.
---

# Workflow: Rastrear Módulo (Track Module)

1.  **Identificar Módulo Objetivo**
    - Determinar los archivos `html` y `js` que componen el módulo.
    - Ejemplo: `pages/login.html` y `assets/js/login.js`.

2.  **Verificar Documentación Existente**
    - Buscar en `docs/qa/[nombre_modulo].md`.
    - Si existe, leerlo para entender el estado actual documentado.
    - Si no existe, crearlo usando `docs/QA_TEMPLATE.md`.

3.  **Analizar Código Base**
    - **Leer Archivos**: Usar `view_file` en los archivos `.html` y `.js` objetivo.
    - **Extraer Respuestas**: Responder las 9 preguntas de la Tarjeta de Identidad del Módulo:
      1.  Objetivo
      2.  Punto de Entrada
      3.  Inputs
      4.  Acción Principal
      5.  Feedback Inmediato
      6.  Lógica del Sistema (Rastrear llamadas API/interacciones Supabase)
      7.  Estado de Datos
      8.  Navegación
      9.  Resultado Visual

4.  **Crear/Actualizar Archivo Q&A**
    - **Ruta del Archivo**: `docs/qa/[nombre_modulo].md`
    - **Contenido**:
      - Si es nuevo: Copiar `docs/QA_TEMPLATE.md` y completar los detalles (en español).
      - Si es actualización: Actualizar las secciones relevantes y agregar una fila al "Historial de Revisiones".
    - **Formato**: Asegurar Markdown claro, verificar enlaces a archivos relacionados.

5.  **Validación**
    - Verificar que todas las preguntas tengan respuestas claras y no ambiguas.
    - Si la lógica es confusa, marcarlo como "REQUIERE ACLARACIÓN" en la sección de Notas del Agente.

6.  **Notificar al Usuario**
    - Informar al usuario que el módulo ha sido rastreado/actualizado.
    - Compatir la ruta al nuevo artefacto.
