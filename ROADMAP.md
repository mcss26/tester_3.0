# ✦ Roadmap Técnico: Rediseño UI & Seguridad

> **Última actualización:** 2026-02-20
> **Fuente de verdad:** Este documento — basado en auditoría de codebase real
> **Método:** Secuencia por dependencias técnicas (cada capa consume la anterior)

---

## Principio Ordenador

> **Cada capa es consumidora de la anterior y proveedora de la siguiente.**
> Tocar una capa fuera de orden genera retrabajo en cascada.

```text
CAPA 0 → CAPA 1 → CAPA 2 → CAPA 3 → CAPA 4 → CAPA 5
Seguridad   Tokens   Layout   Componentes   Integración   Polish
```

---

## Capa 0 — Seguridad Core 🔒

> Bloqueante. Sin esto, la ANON_KEY pública expone toda la data vía API directo.

### Objetivos

1. **`index.html`** — Verificar sesión antes de redirigir (usar `Auth.getMyProfile()` + `Auth.roleLanding()`)
2. **RLS masivo** — Habilitar en todas las tablas con policies por rol (no genéricas `authenticated`)
3. **CSP** — Meta tag alineado al stack: `jsdelivr.net`, `supabase.co`, `api.emailjs.com`
4. **Guard faltante** — Descomentar `guardOrRedirect` en `scanner.js`

### Decisiones Pendientes

- **RLS por rol**: ¿Custom claims (eficiente, requiere función `set_claim`) o sub-select a `profiles` (simple, overhead por query)?
- **Body hide**: ¿Centralizar `display:none` → `block` post-auth en `auth.js` o por módulo?

### Verificación

- [ ] `index.html` redirige a login sin sesión
- [ ] Tablas core tienen RLS con filtro por rol
- [ ] Navegador muestra CSP activo en DevTools > Network
- [ ] `scanner.js` redirige sin sesión

### Evidencia

- [Seguridad_Arquitectura.md](docs/operaciones/testing/observations/Seguridad_Arquitectura.md) — 7 hallazgos
- [Plan_Blindaje_Review.md](docs/operaciones/testing/observations/Plan_Blindaje_Review.md) — 5 correcciones al plan propuesto

---

## Capa 1 — Tokens (Base Visual) 🎨

> `tokens.css` existe y funciona parcialmente. Encargados ya lo consumen correctamente.

### Objetivos

1. **Auditar Design Drift** — Eliminar redefiniciones locales de `:root` en módulos admin
2. **Consolidar** — Spacing 8pt, Zinc Palette WCAG, Shadows SaaS, Z-Index scale
3. **Blindar** — `tokens.css` debe ser la única fuente de variables CSS

### Por qué antes de Layout

Layout consume `--space-*`, `--z-*`, `--shadow-*`, `--topbar-h` de tokens. Si los tokens cambian después, hay que re-tocar todo el layout.

### Verificación

- [ ] 0 redefiniciones de `:root` fuera de `tokens.css`
- [ ] Todas las variables de spacing usan múltiplos de 8
- [ ] `ds-verify.ps1` muestra 0 regresiones Tier0

---

## Capa 2 — Layout / Shell 📐

> Estructura que contiene todo. Topbar, sidebar, grids, navigation.

### Objetivos

1. **`swiss-shell.css`** — Topbar, sidebar, grid system (reemplaza `swiss-style.css`)
2. **`navigation.css`** — Menús, breadcrumbs, tabs
3. **Responsive** — Breakpoints del token system

### Por qué antes de Componentes

Los componentes se posicionan DENTRO del layout. Sin shell definido, cada componente inventa su propio posicionamiento (lo que pasa hoy en encargados).

### Sandbox

**Encargados** = zona de bajo riesgo para prototipar layout:

- 0 selectores `#id`, 0 `!important`
- Solo 1 CSS propio (76 líneas, ya usa tokens)
- Nunca fueron diseñados — ideal para diseñar desde cero

### Verificación

- [ ] Shell funciona en las 8 páginas Tier0
- [ ] Encargados usan el nuevo shell
- [ ] `ds-verify.ps1 -SaveBaseline` → cambios → `ds-verify.ps1` = 0 regresiones

---

## Capa 3 — Componentes 🧱

> Átomos: buttons, forms, cards, data-viz, feedback.

### Objetivos

1. **Migrar** estilos de `admin-*.css` → `components/` (buttons, forms, cards, data-viz, feedback)
2. **Resolver acoplamiento JS-CSS** — Inyectar hooks `js-` en los 312 selectores de presentación antes de renombrar clases
3. **Aplanar especificidad** — Solo donde sea necesario (2 selectores `#id` reales: `#payModal`, `#btn-view-all-requests`)

### Dato clave descubierto

El script de aplanamiento masivo es innecesario: solo existen **2 selectores `#id`** en los 9 archivos `admin-*.css`. Las 142 ocurrencias de `!important` sí necesitan tratamiento pero en esta fase, no antes.

### Verificación

- [ ] `components/` contiene buttons, forms, cards, data-viz, feedback
- [ ] 0 clases de presentación usadas como selectores JS
- [ ] `audit-links.js` retorna 0 errores 404

---

## Capa 4 — Integración 🔗

### Objetivos

1. **Re-mapeo HTML** — Actualizar `<link>` en todos los HTML hacia la nueva estructura
2. **Limpieza** — Mover archivos consolidados a `.archive/`
3. **Validación** — `audit-links.js` + `ds-verify.ps1` en todas las páginas

---

## Capa 5 — Polish ✨

### Objetivos

1. **Profundidad** — Sombras multinivel SaaS
2. **Tipografía** — Jerarquía visual refinada
3. **Micro-animaciones** — Transitions, hover states
4. **Validación final** — `components_catalog.html` + `layout_patterns.html` como golden standard

---

## Protocolo de Cambios (Estándar)

Cada cambio sigue este flujo:

```text
1. ds-verify.ps1 -SaveBaseline     → fijar estado actual
2. Ejecutar transformación          → una capa a la vez
3. ds-verify.ps1                    → comparar contra baseline
4. Si regresión Tier0 → revertir   → no avanzar
5. Si ok → nuevo baseline          → siguiente cambio
```

---

## Herramientas Disponibles

| Script                     | Uso                                                 |
| -------------------------- | --------------------------------------------------- |
| `ui-component-scanner.ps1` | Escanea páginas y genera `summary.json` con scores  |
| `ds-verify.ps1`            | Compara scores pre/post y detecta regresiones Tier0 |
| `audit-links.js`           | Verifica 0 errores 404 en rutas CSS/JS              |
| `audit-css.js`             | Audita especificidad y patrones tóxicos             |
| `security-watchdog.ps1`    | Monitoreo de seguridad                              |

---

## Planes Relacionados (Otros Dominios)

| Plan                  | Dominio                        | Ubicación                                        |
| --------------------- | ------------------------------ | ------------------------------------------------ |
| PLAN_PRODUCTION_READY | Security, CI/CD, Deploy        | `docs/codex/PLAN_PRODUCTION_READY.md`            |
| Workdays Roadmap      | Backend + Frontend (8 sprints) | `docs/migration/artifacts/roadmap_production.md` |

> [!NOTE]
> Estos planes cubren dominios **fuera del scope** de este ROADMAP (que es UI/CSS + Seguridad Core).
