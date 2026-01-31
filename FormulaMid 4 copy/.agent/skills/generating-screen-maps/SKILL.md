---
name: generating-screen-maps
description: Genera y actualiza mapas de pantallas y diagramas de flujo arquitectónicos usando Mermaid de forma estética y estructurada. Usar cuando el usuario mencione visualizar la arquitectura, ver el mapa del sitio o entender los flujos de usuario.
---

# Generating Screen Maps

Habilidad para crear representaciones visuales de la arquitectura de software, flujos de usuario y mapas de pantallas utilizando **Mermaid.js**. Enfocada en la estética premium, la claridad estructural y la interactividad.

## Cuándo usar este skill

- Cuando se necesite un mapa visual de las pantallas existentes (Legacy o Actuales).
- Para documentar flujos de navegación complejos entre roles.
- Al actualizar la documentación de arquitectura para reflejar cambios en la estructura de archivos.
- Cuando el usuario solicite un diagrama "robusto", "estético" o "intuitivo".

## Flujo de trabajo

1.  **Exploración de Entidades**: Escanear los directorios de código (ej. `pages/`) y documentación (ej. `docs/modules/`) para listar todas las pantallas y sus metadatos (roles, propósito).
2.  **Identificación de Conexiones**: Analizar de forma lógica los enlaces entre pantallas basándose en el código fuente o la lógica de negocio documentada.
3.  **Aplicación de Estilos (Branding)**: Utilizar `classDef` de Mermaid para diferenciar roles y estados (ej. Admin en Azul, Staff en Naranja, Legacy en Gris).
4.  **Generación de Documento**: Crear o actualizar un archivo MD con la estructura: Propósito, Diagrama, Conclusión y Notas Técnicas.
5.  **Refinado Estético**: Añadir iconos (emojis) y descripciones breves en los nodos del diagrama para mejorar la intuición.

## Instrucciones y Estética Mermaid

### Tematización Premium
Para que el diagrama sea "Wown" y premium, usa siempre el siguiente bloque de estilos al final de cada `graph TD`:

```mermaid
classDef default fill:#1a1b1e,stroke:#333,color:#a9b1d6,stroke-width:1px;
classDef admin fill:#1e293b,stroke:#3b82f6,color:#eff6ff,stroke-width:2px;
classDef operative fill:#1e293b,stroke:#10b981,color:#ecfdf5,stroke-width:2px;
classDef staff fill:#1e293b,stroke:#f59e0b,color:#fffbeb,stroke-width:2px;
classDef legacy fill:#1a1b1e,stroke:#4b5563,color:#9ca3af,stroke-dasharray: 5 5;
classDef critical fill:#450a0a,stroke:#dc2626,color:#fef2f2,stroke-width:2px;
```

### Estructura de Nodos
Los nodos deben ser informativos:
- `ID[Nombre de Pantalla <br/> <small><i>Acción Principal</i></small>]`
- Usa subgrafos para agrupar pantallas por contexto o carpeta.

### Interactividad
Aprovecha que Markdown en VSCode soporta enlaces en Mermaid:
- `click NodeID "url_al_modulo.md" "Ver Detalles"`

## Estructura Robusta de Salida (Archivo final)

El archivo generado debe seguir este orden:

1.  **# Título del Documento**: Claro y conciso.
2.  **## 🎯 Propósito**: Objetivo del mapa/flujo y quién debería leerlo.
3.  **## 🗺️ Visualización**: El lenguaje Mermaid con los estilos aplicados.
4.  **## 💡 Conclusión**: Análisis ejecutivo de lo que muestra el mapa (cuellos de botella, separación de roles, etc.).
5.  **## 🛠️ Notas Técnicas**: Detalles para desarrolladores (librerías, persistencia, APIs involucradas).

## Recursos

- Ver `examples/aesthetic-map.md` para referencia visual.
- Usa `resources/mermaid-themes.md` para paletas de colores adicionales.
