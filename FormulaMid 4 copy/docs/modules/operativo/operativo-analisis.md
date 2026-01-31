# Operativo Análisis

> **Rol**: Operativo, Logístico
> **Ruta**: `pages/operativo/operativo-analisis.html`
> **JS**: `assets/js/modules/operativo/operativo-analisis.js`
> **Estado**: Verificado
> **Última Actualización**: 2026-01-29

---

## 1. Información General

### 1.1 ¿Quién lo usa?
Usuarios con rol **Operativo** (`operativo`) o **Logístico** (`logistico`) que procesan datos de consumo y planifican necesidades de reposición.

### 1.2 ¿Qué hace?
Es la herramienta central para el procesamiento de datos de consumo masivo. Su objetivo es convertir planillas de Excel externas (como reportes de ventas de boliches o proveedores) en datos estructurados dentro del sistema para calcular el "Stock Ideal" y proyectar necesidades de compra. Permite al personal de logística cargar los consumos del día y visualizar tendencias históricas para la planificación de pedidos.

### 1.3 ¿Cómo lo hace?
El módulo se divide en tres capacidades principales:
1. **Importación Inteligente**: Permite subir un archivo `.xlsx`. El sistema escanea las primeras 20 filas buscando cabeceras como "Producto" y "Cantidad". Normaliza los nombres para intentar coincidir por nombre o `external_id` con la tabla `inventory_skus`
2. **Cálculo de Ideales**: Basándose en un rango de fechas, promedia el consumo histórico y aplica fórmulas para determinar el stock ideal en diferentes escenarios (ej: "Evento 500 personas" vs "Evento 900 personas")
3. **Visualización Histórica**: Genera gráficos (`Chart.js`) de los 5 productos más consumidos en los últimos 30 días para detectar tendencias de consumo

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada
ERP > Operativo > Análisis

### 2.2 Flujo Principal

**Importación de Consumos:**
1. Usuario ingresa a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()` (roles: operativo, logistico)
3. Usuario selecciona archivo Excel (.xlsx / .xls) para importar
4. Usuario define la "Fecha Operativa" del reporte
5. Sistema parsea el archivo, buscando columnas de producto y cantidad
6. Sistema muestra tabla de previsualización con mapeo de SKUs:
   - Verde: SKU encontrado en sistema
   - Rojo: SKU no encontrado (requiere revisión manual)
7. Sistema valida que no exista duplicado de fecha operativa
8. Usuario confirma importación
9. Sistema guarda en `consumption_reports` (header) y `consumption_details` (líneas)
10. Sistema muestra feedback con resumen de items importados

**Análisis y Cálculo de Ideales:**
1. Usuario selecciona rango de fechas para análisis
2. Sistema ejecuta agregación SQL sobre `consumption_details`
3. Sistema calcula promedios de consumo por SKU
4. Sistema aplica fórmulas para proyectar stock ideal por escenario
5. Sistema muestra tabla comparativa: Consumo Real vs Stock Ideal vs Diferencia
6. Usuario puede exportar resultados o usar datos para crear pedidos

**Visualización Histórica:**
1. Sistema carga automáticamente consumos de últimos 30 días
2. Sistema identifica los 5 productos de mayor rotación
3. Sistema genera gráfico de líneas (`Chart.js`) mostrando tendencia temporal
4. Usuario puede ajustar rango de fechas para análisis personalizado

### 2.3 Inputs y Acciones Clave
- **Campos principales**: Archivo Excel (.xlsx / .xls), Fecha Operativa del reporte, Rango de fechas para análisis (Start / End)
- **Acción principal**: "Confirmar Importación" (guarda datos), "Calcular Ideales" (ejecuta análisis)
- **Feedback inmediato**: Tabla de previsualización con indicadores de matching (Verde/Rojo), avisos de duplicidad, Toast notifications, gráficos interactivos

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación | Tablas/Vistas | Campos Clave |
|:----------|:--------------|:-------------|
| **Lectura** | `inventory_skus` (master_sku), `consumption_reports`, `consumption_details` | id, name, external_id, report_date, sku_id, quantity, matched_sku_id |
| **Escritura** | `consumption_reports`, `consumption_details` | id, report_date, uploaded_by, total_items, sku_id, quantity, report_id |

### 3.2 Lógica de Negocio
El módulo implementa procesamiento inteligente de datos no estructurados:

**Importación y Normalización**:
- Parseo robusto de Excel que busca cabeceras en las primeras 20 filas
- Normalización de strings (quitar acentos, espacios extra, lowercase) para mejorar el matching
- Matching por nombre de producto o external_id contra `inventory_skus`
- Parseo robusto de números (maneja comas y puntos decimales)
- Detección de columnas flexibles (tolera variaciones en nombres de cabecera)

**Prevención de Duplicados**:
- No permite importar dos reportes para la misma "Fecha Operativa"
- Valida antes de guardar y muestra advertencia si existe conflicto
- Opción de reemplazar reporte existente (elimina anterior y guarda nuevo)

**Cálculo de Ideales**:
- Agregación SQL sobre rango de fechas seleccionado
- Promedio de consumo por SKU en el período
- Aplicación de multiplicadores por escenario (configurable)
- Comparación contra stock actual para calcular necesidad de reposición

**Casos especiales**:
- Si un producto en el Excel no se encuentra en `inventory_skus`, se marca en rojo pero se permite importar con `matched_sku_id = null` para auditoría
- Si el archivo no tiene columnas válidas, se muestra error descriptivo
- Cantidades inválidas (texto, negativos) se convierten a 0 automáticamente

### 3.3 Endpoints/API
Operaciones Supabase:
- `inventory_skus`: SELECT (para matching durante importación)
- `consumption_reports`: SELECT (verificar duplicados), INSERT
- `consumption_details`: INSERT (bulk), SELECT con agregaciones (para análisis)

---

## 4. Componentes UI

### 4.1 Estructura
- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: Multi-pestaña con tres vistas (Importar / Análisis / Histórico)
- **Tabla de previsualización**: Muestra mapeo de productos antes de confirmar
- **Tabla de análisis**: Comparativa de consumos vs ideales
- **Gráfico**: Chart.js para visualización de tendencias temporales
- **Feedback**: `Toast`, indicadores de matching (badges verde/rojo), progress indicators

### 4.2 Estados del Sistema

| Estado | Trigger | UI |
|:-------|:--------|:---|
| **Loading** | Parsing de Excel o carga de datos | `.loading-spinner` con mensaje contextual |
| **Preview** | Archivo parseado | Tabla con indicadores de matching |
| **Import Success** | Confirmación guardada | `Toast.success()` con resumen de items |
| **Error** | Fallo de parsing o validación | `Toast.error()` con mensaje descriptivo |
| **Duplicate Warning** | Fecha operativa ya existe | Modal de confirmación para reemplazar |
| **Empty Analysis** | Sin datos en rango seleccionado | Mensaje informativo en tabla de análisis |
| **Chart Loaded** | Datos históricos renderizados | Gráfico interactivo con tooltips |

### 4.3 Accesibilidad
- [x] Navegación por teclado funcional en tabs y formularios
- [x] Labels descriptivos en inputs de archivo y fecha
- [x] Contraste de colores para indicadores de matching cumple WCAG AA
- [x] Mensajes de error descriptivos y contextuales
- [x] Gráficos con tooltips accesibles

---

## 5. Dependencias

### 5.1 Scripts Core
- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js` (guard para roles operativo/logistico)
- `core/utils.js` (normalización de strings, parsing de números)
- `core/toast.js`

### 5.2 Módulos Externos
- **Chart.js**: Para visualización de tendencias históricas
- **SheetJS / XLSX**: Para parsing de archivos Excel
- **Normalización de strings**: Librería para quitar acentos y normalizar texto

### 5.3 Dependencias entre Módulos
- **Consume**:
  - `inventory_skus` / `master_sku` (matching de productos)
  - `consumption_reports` / `consumption_details` (datos históricos)
- **Es consumido por**:
  - `operativo-solicitudes.md` (puede usar análisis para generar pedidos)
  - Módulos de admin que auditan consumos vs ventas reales
- **Relacionado con**: `operativo-stock.md` (compara stock ideal vs actual)

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso
- [x] Solo roles `operativo` y `logistico` pueden acceder
- [x] Validación con `Auth.guardOrRedirect()`
- [x] Permisos a nivel de Supabase RLS para escritura en tablas de consumo

### 6.2 Validaciones de Datos
- [x] Archivo debe ser formato válido (.xlsx, .xls)
- [x] Fecha operativa requerida y formato válido
- [x] Prevención de duplicados por fecha operativa
- [x] Validación de estructura de Excel (columnas producto y cantidad presentes)
- [x] Parsing robusto de cantidades (convierte valores inválidos a 0)
- [x] Rango de fechas válido para análisis (start <= end)

### 6.3 Manejo de Errores
- Errores de parsing de Excel muestran mensaje descriptivo del problema
- Productos no encontrados se marcan visualmente pero permiten continuar
- Duplicados de fecha muestran modal de confirmación
- Errores de guardado en BD se capturan y muestran con Toast.error()
- Si falla el análisis, mantiene datos anteriores y notifica al usuario

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?
La decisión de usar importación de Excel en lugar de entrada manual permite:
- **Velocidad operativa**: Procesamiento de cientos de productos en segundos
- **Integración flexible**: Acepta reportes de sistemas externos sin adaptadores complejos
- **Reducción de errores**: Elimina transcripción manual de datos
- **Auditoría completa**: Mantiene registro del archivo original y fecha de importación

### 7.2 Patrones Utilizados
- **Normalización fuzzy**: Mejora tasa de matching entre nombres similares
- **Tabla de previsualización**: Usuario valida antes de confirmar guardado
- **Importación idempotente**: Mismo archivo + misma fecha = mismo resultado
- **Agregación SQL**: Cálculos complejos se resuelven en BD, no en cliente
- **Parsing progresivo**: Busca cabeceras en múltiples filas para tolerar formatos diversos

### 7.3 Consideraciones de Performance
- Parsing de Excel se ejecuta client-side para no sobrecargar servidor
- Bulk insert para detalles de consumo (una transacción por reporte)
- Índices en `consumption_details.report_id` y `consumption_details.sku_id`
- Chart.js con lazy loading (solo se carga en pestaña Histórico)
- Agregaciones SQL optimizadas con filtros de fecha

---

## 8. Preguntas Frecuentes (FAQ)

**P: ¿Por qué algunos productos aparecen en rojo en la previsualización?**
R: Los productos en rojo no se encontraron en el catálogo del sistema. Verifica que el nombre coincida exactamente o que el external_id esté correcto. Puedes importarlos de todos modos para auditoría.

**P: ¿Qué pasa si importo dos veces el mismo reporte?**
R: El sistema detecta duplicados por fecha operativa y muestra una advertencia. Puedes elegir cancelar o reemplazar el reporte anterior.

**P: ¿Qué formato debe tener el Excel?**
R: El sistema es flexible y busca columnas con nombres como "Producto", "Item", "SKU" para productos y "Cantidad", "Qty", "Consumo" para cantidades. Las primeras 20 filas se escanean buscando cabeceras.

**P: ¿Los cálculos de stock ideal se actualizan automáticamente?**
R: No, debes ejecutar el análisis manualmente seleccionando el rango de fechas deseado. Esto permite ajustar el período según la estacionalidad de tu operación.

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba
- [x] Flujo feliz: Importar Excel con productos válidos y confirmar guardado
- [x] Matching: Verificar que productos con nombres similares se emparejan correctamente
- [x] Productos no encontrados: Verificar indicador rojo en previsualización
- [x] Duplicados: Intentar importar misma fecha operativa dos veces
- [x] Excel inválido: Subir archivo sin columnas de producto o cantidad
- [x] Cálculo de ideales: Ejecutar análisis sobre rango de fechas con datos
- [x] Gráfico histórico: Verificar visualización de tendencias en pestaña Histórico
- [x] Permisos: Intentar acceder con rol no autorizado (debe redirigir)

### 9.2 Datos de Prueba
- Archivo Excel con al menos 10 productos, algunos con nombres exactos y otros con variaciones
- Al menos 5 SKUs en `inventory_skus` con external_id definidos
- Reportes históricos en `consumption_reports` de los últimos 30 días
- Datos de consumo variados en `consumption_details` para probar agregaciones

---

## 10. Historial de Cambios

| Fecha | Autor | Descripción del Cambio |
|:------|:------|:-----------------------|
| 2026-01-29 | Claude Code | Consolidación de documentación (modules + qa) en formato unificado |
| 2026-01-28 | Antigravity AI | Creación inicial V2 incorporando detalles de normalización de Excel y lógica de cálculo de ideales |

---

## 11. Referencias y Links

- [Operativo Stock](operativo-stock.md) - Visualización de niveles actuales de inventario
- [Operativo Solicitudes](operativo-solicitudes.md) - Generación de pedidos basados en análisis
- [Master SKU](operativo-master-sku.md) - Catálogo de productos referenciados en importación
- [Screen Map](../../screen-map.md#operativo-analisis) - Ubicación en arquitectura de pantallas
