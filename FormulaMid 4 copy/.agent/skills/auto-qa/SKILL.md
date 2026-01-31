---
name: Auto Q&A Generator
description: Detecta y genera automáticamente documentación Q&A para módulos web.
---

# Skill: Auto Q&A Generator

Esta skill permite al agente asumir el rol de "Tracking Agent" y generar documentación Q&A de manera autónoma cuando se invoca o se detecta la necesidad.

## Disparadores (Triggers)

- Frase exacta: "dejame verificar @[docs/QA_TEMPLATE.md]"
- Comandos: "Analiza el módulo X", "Genera documentación para X".
- Detección de código: Al trabajar en archivos HTML/JS que no tienen documentación en `docs/modules/`.

## Instrucciones de Ejecución

1.  **Contexto Silencioso**
    - Esta skill está diseñada para operar con mínima fricción para no "ensuciar" el contexto de otros agentes.
    - Ejecuta el análisis y la creación de archivos de forma directa.

2.  **Identificación de Recursos**
    - Localiza los archivos del módulo (ej: `login.html` + `login.js`).
    - Localiza la plantilla: `docs/modules/_template.md`.
    - Localiza el destino: `docs/modules/[categoria]/[nombre_modulo].md`.

3.  **Proceso de Análisis (El "9-Point Check")**
    Utiliza `view_file` en el código fuente y extrae:
    1.  **Objetivo**: ¿Qué hace este módulo?
    2.  **Entrada**: URL o ruta.
    3.  **Inputs**: Campos del formulario.
    4.  **Acción**: Botón principal.
    5.  **Feedback**: ¿Qué ve el usuario al hacer click?
    6.  **Lógica**: ¿Qué API/Supabase function se llama?
    7.  **Datos**: ¿Qué se guarda en DB?
    8.  **Navegación**: ¿A dónde va después?
    9.  **Visual Final**: ¿Qué ve al terminar?

4.  **Generación de Artefacto**
    - Crea el archivo Markdown en `docs/modules/[categoria]/`.
    - Usa estrictamente el idioma **Español**.
    - Mantén el formato de la plantilla unificada.

5.  **Cierre**
    - Notifica brevemente: "Documentación Q&A generada en @[ruta]".
