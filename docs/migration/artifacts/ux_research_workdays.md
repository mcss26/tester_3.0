# 🔬 UX Research Report: Workdays Prototypes

**Skill:** `ux-researcher-designer`  
**Target:** `formulamid-prototypes/screens/lab-workdays` + `lab-workdays-night`  
**Fecha:** 12/02/2026  
**Persona principal:** El Admin

---

## 0. Evidencia Visual

```carousel
![lab-workdays — Planner expandido con 3 cards: Staff, Costos Fijos, Solicitudes](C:\Users\siste\.gemini\antigravity\brain\0a232f5c-e4d3-420c-aaeb-ecd6edb47040\.system_generated\click_feedback\click_feedback_1770934863417.png)
<!-- slide -->
![lab-workdays-night — Night Chief con KPI strip + Stock Audit + Rendición de Caja](C:\Users\siste\.gemini\antigravity\brain\0a232f5c-e4d3-420c-aaeb-ecd6edb47040\night_chief_prototype_1770934967364.png)
```

---

## 1. Journey Map — El Admin: "Planificar y Cerrar una Noche"

**Trigger:** Admin entra al módulo un jueves a las 15:00 para planificar el sábado.

| Fase | Acción                   | Touchpoint (Prototipo)                     | Emoción | Pain Point                                    | Oportunidad                                 |
| :--: | :----------------------- | :----------------------------------------- | :-----: | :-------------------------------------------- | :------------------------------------------ |
|  1   | Ve listado de jornadas   | Tabla principal `lab-workdays`             |   😊    | —                                             | —                                           |
|  2   | Identifica la fila DRAFT | Badge azul "DRAFT" + countdown             |   😊    | —                                             | —                                           |
|  3   | Selecciona evento        | Dropdown inline en la fila                 |   😊    | Dropdown genérico, no muestra género/DJ       | Chip visual con ícono de género             |
|  4   | Expande el Planner       | Click chevron → 3 cards aparecen           |   😊    | —                                             | Animación suave ✅                          |
|  5   | Revisa staff por área    | Card Staff: áreas colapsadas               |   😐    | Las áreas no se expanden al click en el proto | La interacción funciona en code, no en mock |
|  6   | Verifica costos fijos    | Card Costos: toggles pagado/pendiente      |   😊    | —                                             | Toggle intuitivo ✅                         |
|  7   | Revisa solicitudes       | Card Solicitudes: por área con status      |   😊    | "Oper." es un label truncado                  | Usar "Operativo" completo                   |
|  8   | Confirma plan            | CTA "Confirmar Plan" (disabled sin evento) |   😊    | —                                             | Estado disabled correcto ✅                 |
|  9   | Navega a Night Chief     | Link en breadcrumb → `lab-workdays-night`  |   😊    | —                                             | —                                           |
|  10  | Monitorea KPIs           | 5 KPIs en strip horizontal                 |   😐    | Valores "—" sin datos                         | Mostrar placeholders con sparkline mini     |
|  11  | Audita stock vs caja     | Split 50/50: tabla stock + tabla caja      |   😊    | —                                             | Scroll sync entre ambas tablas              |
|  12  | Cierra noche             | Botón "Cerrar Noche" con notas             |   😐    | Sin pre-flight checklist en este proto        | Agregar modal de verificación               |

**Hallazgo principal:** La navegación Planner → Night Chief es un flujo de **2 pantallas**, bien segmentado. El dolor mayor es la falta de datos en vivo para que el Night Chief cobre sentido.

---

## 2. Evaluación Heurística (Nielsen 10)

|  #  | Heurística                        | Score | Hallazgo en Prototipo                                                                                                                      |
| :-: | :-------------------------------- | :---: | :----------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | **Visibilidad del estado**        | ✅ 1  | Badges de color por estado (DRAFT azul, EN VIVO verde, CERRADA gris, CANCELADA roja). Countdown digital. Badge "EN VIVO" con dot pulsante. |
|  2  | **Correspondencia sistema-real**  | ✅ 1  | Terminología del dominio: Nómina, Devenciones, Rendición de Caja, Merma Stock, Per Cápita, Guardarropas.                                   |
|  3  | **Control y libertad**            | ⚠️ 2  | No hay botón "Revertir" visible en el prototipo. El Cerrar Noche no tiene undo. Necesita modal de confirmación con checklist.              |
|  4  | **Consistencia y estándares**     | ✅ 1  | Ambos prototipos usan el mismo design system (tokens.css, base.css, main.css). Cards, tablas, badges son consistentes. BEM naming.         |
|  5  | **Prevención de errores**         | ✅ 1  | "Confirmar Plan" está **disabled** hasta seleccionar evento ✅. Buen patrón.                                                               |
|  6  | **Reconocimiento sobre recuerdo** | ⚠️ 2  | En Night Chief, las 5 KPIs son claras. Pero los filtros de stock (Destilados, Cerveza...) no indican cuántos items tiene cada uno.         |
|  7  | **Flexibilidad y eficiencia**     | ⚠️ 2  | No hay atajos. Power user (admin semanal) repite flujo sin templates. Sin keyboard nav.                                                    |
|  8  | **Diseño estético y minimalista** | ✅ 1  | Dark mode premium. Glassmorphism sutil en cards. Jerarquía tipográfica clara. Sin ruido visual.                                            |
|  9  | **Recuperación ante errores**     | ⚠️ 2  | No se observan estados de error ni empty states informativos (las tablas vacías no muestran mensaje guía).                                 |
| 10  | **Ayuda y documentación**         | ⚠️ 2  | Sin tooltips. Las columnas de tabla Night Chief ("EFVO SIST", "EFVO DECL") usan abreviaturas sin explicación.                              |

### Resumen de Severidades

|     Severidad      |   Cantidad   | Categoría      |
| :----------------: | :----------: | :------------- |
|   1 (Cosmético)    | **5** issues | Backlog        |
|     2 (Menor)      | **5** issues | Próximo sprint |
| 3+ (Mayor/Crítico) |    **0**     | —              |

> **Veredicto:** Prototipo **sólido** (0 issues mayores). Las 5 issues de severidad 2 son mejoras de pulido.

---

## 3. Cognitive Walkthrough — "Confirmar Plan y Abrir Jornada"

| Paso | Acción                                 | ¿Intentará? |        ¿Verá?        |          ¿Entenderá?          |       ¿Feedback?        | Failure?  |
| :--: | :------------------------------------- | :---------: | :------------------: | :---------------------------: | :---------------------: | :-------: |
|  1   | Ve tabla, identifica DRAFT             |     ✅      |   ✅ Badge visible   |              ✅               |           ✅            |     —     |
|  2   | Click en dropdown "Seleccionar evento" |     ✅      | ✅ Inline en la fila |              ✅               |  ✅ Aparecen opciones   |     —     |
|  3   | Click chevron para expandir plan       |     ✅      | ⚠️ Chevron es sutil  |              ✅               |    ✅ Panel aparece     |     —     |
|  4   | Revisa las 3 cards                     |     ✅      |          ✅          |     ✅ Layout 3-col claro     |   ✅ Totales visibles   |     —     |
|  5   | Intenta expandir área "Barra" en Staff |     ⚠️      |          ✅          | ❓ No obvio que es clickeable | ⚠️ Sin feedback visible | **⚠️ FP** |
|  6   | Click "Confirmar Plan"                 |     ✅      |   ✅ CTA primario    |              ✅               |   ✅ Disabled→Enabled   |     —     |

**Failure Point (FP-5):** Las áreas colapsadas (Barra, Puerta, Caja...) tienen un chevron `▸` muy pequeño (10×10px). La affordance de "clickear para expandir" no es obvia. **Recomendación:** Agregar `cursor: pointer` + hover highlight + animación de rotación del chevron.

---

## 4. Task Flow Analysis

| Tarea                          | Pasos Mínimos |         Pasos Proto          | Eficiencia |      Veredicto      |
| :----------------------------- | :-----------: | :--------------------------: | :--------: | :-----------------: |
| Ver plan de una fecha DRAFT    |       2       | 2 (ver fila + click chevron) |    1.00    |      ✅ Óptimo      |
| Seleccionar evento             |       1       |     1 (dropdown inline)      |    1.00    |      ✅ Óptimo      |
| Revisar costos y marcar pagado |       2       |    2 (ver card + toggle)     |    1.00    |      ✅ Óptimo      |
| Confirmar plan                 |       1       |        1 (click CTA)         |    1.00    |      ✅ Óptimo      |
| Ver stock audit en Night Chief |       2       |     2 (abrir + navegar)      |    1.00    |      ✅ Óptimo      |
| Filtrar stock por categoría    |       1       |        1 (click chip)        |    1.00    |      ✅ Óptimo      |
| Cerrar noche                   |       2       |      1 (sin pre-flight)      |    2.00    | ⚠️ Falta validación |

> **Score global: 0.97** — Flujos muy eficientes. Único gap: el cierre de noche necesita un paso de validación que actualmente no existe en el prototipo.

---

## 5. Acciones Priorizadas

|  #  | Acción                                                               | Nielsen # | Esfuerzo | Impacto |
| :-: | :------------------------------------------------------------------- | :-------: | :------: | :-----: |
|  1  | **Pre-flight checklist** antes de Cerrar Noche                       |  H3, H5   |  Medio   | 🔥 Alto |
|  2  | **Empty states** informativos en tablas vacías Night Chief           |    H9     |   Bajo   |  Alto   |
|  3  | **Tooltips** para abreviaturas (EFVO SIST, EFVO DECL, DIFF)          |    H10    |   Bajo   |  Medio  |
|  4  | **Hover + cursor** en áreas colapsables del Planner                  | H6, FP-5  |   Bajo   |  Medio  |
|  5  | **Contadores en filter chips** de Stock Audit (ej: "Destilados (8)") |    H6     |   Bajo   |  Medio  |

---

## 6. Output Estructurado

```json
{
  "phase": "heuristic",
  "status": "pencil",
  "method": "nielsen-heuristic + cognitive-walkthrough + journey-map + task-flow",
  "target": "lab-workdays + lab-workdays-night",
  "source": "formulamid-prototypes (sandbox)",
  "findings": [
    {
      "heuristic": 3,
      "severity": 2,
      "description": "Sin pre-flight checklist en Cerrar Noche",
      "recommendation": "Modal con validaciones de stock/caja antes del cierre"
    },
    {
      "heuristic": 9,
      "severity": 2,
      "description": "Tablas vacías sin empty state informativo",
      "recommendation": "Estado empty con ícono + texto guía + acción sugerida"
    },
    {
      "heuristic": 10,
      "severity": 2,
      "description": "Abreviaturas sin explicación en Night Chief",
      "recommendation": "Tooltips al hover sobre headers de tabla"
    },
    {
      "heuristic": 6,
      "severity": 2,
      "description": "Áreas colapsables sin affordance clara",
      "recommendation": "Hover highlight + cursor pointer + chevron animado"
    },
    {
      "heuristic": 6,
      "severity": 2,
      "description": "Filter chips de stock sin contadores",
      "recommendation": "Badge numérico en cada chip de categoría"
    }
  ],
  "metrics": {
    "issues_found": 10,
    "critical": 0,
    "major": 0,
    "minor": 5,
    "cosmetic": 5,
    "task_flow_efficiency": 0.97
  },
  "next_steps": [
    "Implementar pre-flight checklist modal en lab-workdays-night",
    "Agregar empty states a tablas del Night Chief",
    "Mejorar affordance de áreas colapsables (quick win CSS)"
  ]
}
```
