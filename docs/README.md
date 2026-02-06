# tester_3.0

> Sistema de gestión integral para operaciones de club nocturno.
> **Última Actualización**: 2026-02-01

---

## 📋 Descripción

tester_3.0 es un sistema web para gestionar las operaciones diarias de un club/venue:

- **Jornadas operativas** (apertura/cierre de días)
- **Control de caja** (terminales, arqueos, movimientos)
- **Gestión de stock** (inventario, reposición, proveedores)
- **Control de acceso** (QR codes, check-ins)
- **Gestión de personal** (convocatorias, funciones, planning)
- **Reportes** (ventas, P&L, eficiencia de barra)

---

## 🛠️ Stack Tecnológico

| Capa         | Tecnología                               |
| ------------ | ---------------------------------------- |
| **Frontend** | HTML5 + CSS3 + JavaScript (Vanilla)      |
| **Backend**  | Supabase (PostgreSQL + Auth + Realtime)  |
| **Estilos**  | CSS con tokens (`assets/css/tokens.css`) |
| **Charts**   | Chart.js                                 |

---

## 📁 Estructura del Proyecto

```
tester_3.0/
├── .agent/
│   ├── skills/              # Skills técnicos (FUENTE DE VERDAD)
│   │   ├── frontend-developer/
│   │   ├── logic-engineer/
│   │   ├── db-architect/
│   │   └── ...
│   ├── workflows/           # Workflows automatizados
│   └── data/                # Datos para ETL/testing
├── assets/
│   ├── css/
│   │   ├── main.css         # Entry point (imports)
│   │   ├── tokens.css       # Design tokens
│   │   └── components.css   # Componentes UI
│   └── js/
│       ├── core/            # Utilidades core (auth, utils, toast)
│       └── modules/         # JS por módulo
├── docs/
│   ├── INDEX.md             # Índice maestro de documentación
│   ├── estado-presente.md   # Estado actual del proyecto
│   ├── roadmap.md           # Plan estratégico
│   ├── screen-map.md        # Mapa de pantallas
│   ├── scheme.md            # Esquema de BD
│   ├── architecture/        # Arquitectura y estándares UI
│   ├── guides/              # Guías de usuario
│   └── modules/             # Documentación por módulo
├── pages/
│   ├── admin/               # Páginas administrativas
│   ├── encargados/          # Páginas de encargados
│   ├── operativo/           # Páginas operativas
│   ├── logistica/           # Páginas de logística
│   └── staff/               # Páginas de staff
└── login.html               # Punto de entrada
```

---

## � Jerarquía de Documentación

| Tipo          | Ubicación                           | Propósito           |
| :------------ | :---------------------------------- | :------------------ |
| **Estado**    | `docs/estado-presente.md`           | Métricas actuales   |
| **Roadmap**   | `docs/roadmap.md`                   | Plan estratégico    |
| **Pantallas** | `docs/screen-map.md`                | Arquitectura de UI  |
| **BD**        | `docs/scheme.md`                    | Esquema de datos    |
| **Frontend**  | `.agent/skills/frontend-developer/` | Reglas de UI/CSS    |
| **Backend**   | `.agent/skills/logic-engineer/`     | Reglas de JS/lógica |
| **Database**  | `.agent/skills/db-architect/`       | Reglas de datos     |

---

## � Roles del Sistema

| Rol           | Acceso               | Landing              |
| ------------- | -------------------- | -------------------- |
| **admin**     | Completo             | `/pages/admin/`      |
| **gerencia**  | Reportes, KPIs       | `/pages/gerencia/`   |
| **encargado** | Operaciones, cierres | `/pages/encargados/` |
| **logistica** | Stock, recepciones   | `/pages/logistica/`  |
| **staff**     | Funciones asignadas  | `/pages/staff/`      |
| **operativo** | Scanner, check-in    | `/pages/operativo/`  |

---

## � Inicio Rápido

```bash
# Servir localmente
npx serve .
# o
python -m http.server 8000
```

Acceder a `http://localhost:8000/login.html`

---

## � Estado Actual

Ver [`docs/estado-presente.md`](./estado-presente.md) para métricas y progreso.

Ver [`docs/roadmap.md`](./roadmap.md) para el plan estratégico v4.0.

---

## 🔗 Referencias Técnicas

- **Skills**: `.agent/skills/` — Reglas técnicas por dominio
- **Esquema BD**: [`docs/scheme.md`](./scheme.md)
- **Mapa de pantallas**: [`docs/screen-map.md`](./screen-map.md)

---

## 🔄 Mantenimiento

> [!IMPORTANT]
> **Regla de Fuente Única**: Cada tipo de documento tiene UNA sola ubicación canónica.

### Cuándo Actualizar

| Evento                  | Documento a Actualizar                                         |
| :---------------------- | :------------------------------------------------------------- |
| Nueva pantalla creada   | `docs/screen-map.md`                                           |
| Nueva tabla/vista en BD | `docs/scheme.md` + `db-architect/SKILL.md`                     |
| Cambio de métricas      | `docs/estado-presente.md`                                      |
| Nuevo patrón de código  | Skill correspondiente (`frontend-developer`, `logic-engineer`) |
| Cambio de prioridades   | `docs/roadmap.md`                                              |

### Prohibiciones

- ❌ Crear archivos `.md` en la raíz del proyecto
- ❌ Crear carpetas `*_backup/`, `*_archive/`, `*_old/`
- ❌ Duplicar contenido entre skills y docs
- ❌ Crear "resúmenes" temporales en `.agent/` (excepto skills)

### Checklist Semanal

```
- [ ] docs/estado-presente.md tiene fecha actual
- [ ] docs/roadmap.md refleja prioridades vigentes
- [ ] docs/screen-map.md tiene conteo correcto de pantallas
- [ ] No hay archivos duplicados (`find . -name "*old*" -o -name "*backup*"`)
```
