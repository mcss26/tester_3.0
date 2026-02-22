# Code Review — 2026-02-21

> Revisión de cambios recientes: commit `4dcb56e` (gs) + cambios sin commitear

## Resumen

| Scope         | Archivos | Añadidas  | Eliminadas |
| ------------- | -------- | --------- | ---------- |
| Commit `gs`   | 26       | ~700      | ~240       |
| Sin commitear | 4        | ~300      | ~20        |
| **Total**     | **~30**  | **~1000** | **~260**   |

**Archivos modificados:**

- `scripts/ui-component-scanner.ps1` — 10+ reglas de relevancia contextual
- `scripts/audit-jsdoc.js` — nuevo script de auditoría JSDoc
- `pages/**/*.html` — 20+ páginas (GS class additions)
- `README.md` — reescritura completa
- `state.md`, `ROADMAP.md` — metadata updates

---

## 🔴 Críticos (0)

No se encontraron issues de seguridad críticos.

---

## 🟡 Advertencias (4)

### 1. DRY — Detección de launcher repetida 6 veces

**Archivo:** `scripts/ui-component-scanner.ps1` (L264, L284, L320, L325, L351)

```powershell
$isLauncher = 'launcher-center' -in $uniqueClasses -or 'launcher-page' -in $uniqueClasses
```

Esta línea se repite en Layout, Navigation, Header, Forms, Buttons y FilterBar. Debería calcularse **una sola vez** antes del switch:

```diff
+$isLauncherPage = 'launcher-center' -in $uniqueClasses -or 'launcher-page' -in $uniqueClasses
+
 switch ($catName) {
     'Layout' {
         $hasContextualRule = $true
-        $isLauncher = 'launcher-center' -in $uniqueClasses -or 'launcher-page' -in $uniqueClasses
-        $isRelevant = -not $isLauncher
+        $isRelevant = -not $isLauncherPage
     }
```

**Severidad:** Media — Viola principio DRY explícito de `GEMINI.md`.

### 2. Rendimiento — `walkDir` recursivo sin protección

**Archivo:** `scripts/audit-jsdoc.js` (L23)

```javascript
function walkDir(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.resolve(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      results.push(...walkDir(full));
```

- `readdirSync` + `statSync` por cada entrada = IO síncrono costoso en directorios grandes.
- Sin protección contra symlinks circulares.
- `push(...walkDir())` puede causar stack overflow en árboles profundos.

**Fix sugerido:** Agregar `maxDepth` guard y manejo de symlinks:

```javascript
function walkDir(dir, depth = 0) {
  if (depth > 10) return [];
  // ...
  if (fs.statSync(full).isDirectory() && !fs.lstatSync(full).isSymbolicLink()) {
    results.push(...walkDir(full, depth + 1));
  }
```

**Severidad:** Baja — Los dirs escaneados son conocidos y poco profundos, pero es buena práctica.

### 3. Regex `^stat[-s]` puede dar falso positivo

**Archivo:** `scripts/ui-component-scanner.ps1` (L338)

```powershell
$hasStatsClasses = @($uniqueClasses | Where-Object { $_ -match '^stat[-s]' })
```

El regex `^stat[-s]` matchea con `stats-*`, `stat-*`, pero también matchearía `stats` a secas o algo como `static-*` si empezara con `stats`. Mejor usar:

```powershell
$_ -match '^stats?-'
```

**Severidad:** Baja — En la práctica las clases son conocidas, pero el regex es impreciso.

### 4. JSDoc script no registrado en package.json

**Archivo:** `scripts/audit-jsdoc.js`

El script se ejecuta con `node scripts/audit-jsdoc.js` pero no tiene un `npm run` script en `package.json`. Para consistencia con los otros audit scripts:

```json
"audit:jsdoc": "node scripts/audit-jsdoc.js"
```

**Severidad:** Baja — Conveniencia, no un bug.

---

## 🟢 Sugerencias (3)

### 1. Nombres genéricos en variables temporales

Algunas variables como `$cat`, `$present`, `$missing` en el scanner podrían ser más descriptivas:

```diff
-$present = @($uniqueClasses | Where-Object { $_ -in $cat.Classes })
+$matchingGsClasses = @($uniqueClasses | Where-Object { $_ -in $cat.Classes })
```

### 2. Console output en audit-jsdoc.js usa padding fijo

```javascript
console.log(`  Files scanned:     ${allFiles.length}`);
```

Si los valores crecen a 4+ dígitos, el alineamiento se rompe. Considerar `padStart()`.

### 3. `analyzeFile` no distingue público vs privado

El script cuenta TODAS las funciones como candidatas a JSDoc, incluyendo funciones internas de closures. Eso infla el total y baja artificialmente el %. Podría filtrar por funciones que están en el `window.X = {}` export block.

---

## ✅ Lo que está bien

1. **Contextual rules bien diseñadas** — Cada regla del scanner sigue el patrón `$hasContextualRule = $true` → condición → `$isRelevant = ...`. Consistente y extensible.

2. **Launcher exclusion pattern** — Detectar `launcher-page`/`launcher-center` para excluir categorías irrelevantes es correcto y evita false positives en dashboards de navegación.

3. **CustomDropdowns runtime detection** — La regla que marca como "fully compliant" cuando `custom-dropdown.js` está linkeado es inteligente — reconoce que el JS auto-enhances `<select>` elements.

4. **Sidebar exact-match upgrade** — Cambiar de `$elements.aside -gt 0` a buscar clases `sidebar-*` específicas elimina falsos positivos de `<aside>` genéricos.

5. **Panels exact-match** — Usar un array fijo de clases GS (`slide-panel`, `panel-overlay`, etc.) en vez de `^panel-` regex previene colisiones con clases que empiezan con "panel" pero no son del design system.

6. **Zero-denominator handling** — Scanner N/A para páginas sin categorías relevantes (launchers) en vez de dividir por cero.

7. **audit-jsdoc.js** — Limpio, bien documentado con JSDoc, CommonJS correcto, output dual (console + markdown), manejo de `fs.existsSync`.

8. **HTML cambios** — Solo adiciones de clases GS (non-breaking), sin lógica nueva, sin inline styles.
