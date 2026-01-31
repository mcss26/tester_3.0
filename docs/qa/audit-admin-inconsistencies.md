# Task: Auditoria UI/UX - Inconsistencias Admin

> Fecha: 2026-01-29  
> Fuente: cuadro de inconsistencias (auditoria admin)

## Admin Pagos
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Visual | Tipografia distinta (Inter importada solo aqui). | Media | `pages/admin/admin-pagos.html:8` |
| Visual/Funcional | Sistema de botones/tabs propio (`btn`, `tab`) distinto al estandar (`btn-ghost`, `tab-chip`). | Media | `pages/admin/admin-pagos.html:68` |
| Funcional | No hay `page-card-loading`/`page-card-empty` globales; se usan placeholders dentro de tablas. | Media | `pages/admin/admin-pagos.html:41` |
| Funcional | Overlay/panel con id `panelOverlay` y manejo custom; no usa `panel.js` estandar. | Media | `pages/admin/admin-pagos.html:305` |
| Visual | Estilos inline en JS para el mini calendario. | Baja | `assets/js/modules/admin/admin-pagos.js:293` |
| Funcional | Uso de `confirm()`/`alert()` en acciones criticas (flujo inconsistente). | Media | `assets/js/modules/admin/admin-pagos.js:437` |

## Admin Cierre ✅ (Mayormente Completo)
| Status | Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- | --- |
| [ ] | Visual | Falta `admin-scroll` en `<body>` (estandar lo exige). | Media | `pages/admin/admin-cierre.html:10` |
| [x] | Funcional | ~~Wrapper de contenido es `cierre-content`~~ — Aceptado como variante. | Baja | `pages/admin/admin-cierre.html:44` |
| [ ] | Visual | Uso de utilidades no estandar (`text-xs`, `mb-4`, `whitespace-pre-wrap`). | Baja | `pages/admin/admin-cierre.html:174` |
| [ ] | Accesibilidad | Boton de cierre del modal sin `aria-label`. | Media | `pages/admin/admin-cierre.html:210` |
| [x] | Nomenclatura | ~~"Cierre de Caja" vs "Cajas (Admin)"~~ — Documentado. | Baja | `pages/admin/admin-cierre.html:48` |

## Admin Stock
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Funcional | `initSlidePanel` espera `#slide-panel`, pero el HTML usa `#stockPanel` (panel puede no abrir/cerrar). | Alta | `pages/admin/admin-stock.html:90` |
| Nomenclatura/Acceso | Rol `logistico` vs `logistica` en el indice. | Alta | `pages/admin/admin-stock.html:9` |
| Accesibilidad | Boton refresh icon-only sin `aria-label`. | Media | `pages/admin/admin-stock.html:62` |
| Visual | `onclick` inline en empty state. | Baja | `pages/admin/admin-stock.html:52` |
| Visual | Estilo inline para opacidad en filas inactivas. | Baja | `assets/js/modules/admin/admin-stock.js:105` |

## Admin Solicitudes
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Funcional | Overlay anidado dentro del panel; estructura distinta a `panel.js`. | Media | `pages/admin/admin-solicitudes.html:110` |
| Nomenclatura | "PEDIDOS" (topbar) vs "Solicitudes" (nav) vs "Pedidos a Proveedores" (titulo). | Media | `pages/admin/admin-solicitudes.html:14` |
| Accesibilidad | Boton refresh icon-only sin `aria-label`. | Media | `pages/admin/admin-solicitudes.html:62` |
| Visual | `onclick` inline en empty state. | Baja | `pages/admin/admin-solicitudes.html:52` |
| Funcional | `confirm()` + estilo inline en boton de rechazo. | Media | `assets/js/modules/admin/admin-solicitudes.js:452` |

## Admin Workdays
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Funcional | Falta `#module-content`, no se oculta contenido con loading/empty. | Media | `pages/admin/admin-workdays.html:49` |
| Visual | Utilidades no estandar (`mt-3`, `flex`, `justify-between`, `text-sm`, `w-full`). | Baja | `pages/admin/admin-workdays.html:103` |
| Accesibilidad | Boton de cierre del panel sin `aria-label`. | Media | `pages/admin/admin-workdays.html:83` |
| Visual | Estilos inline en render de tabla. | Baja | `assets/js/modules/admin/admin-workdays.js:166` |
| Nomenclatura | Uso intensivo de mayusculas (JORNADAS/PLANIFICAR) vs sentence case en otros modulos. | Baja | `pages/admin/admin-workdays.html:53` |

## Admin Reportes
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Visual/Funcional | Falta `admin-scroll` y no hay estados globales de loading/empty. | Media | `pages/admin/admin-reportes.html:9` |
| Visual | Layout con utilidades tipo Tailwind (`flex`, `text-white/40`, `grid`) fuera del diccionario de clases. | Media | `pages/admin/admin-reportes.html:38` |
| Accesibilidad | Boton refresh con emoji sin `aria-label`. | Media | `pages/admin/admin-reportes.html:47` |
| Funcional | Logout usa `window.Auth.logout()` (distinto al patron compartido). | Baja | `assets/js/modules/admin/admin-reportes.js:60` |

## Admin Stock Ajustes
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Visual | Topbar/back/brand distinto al estandar (no `topbar-back`, no status pill). | Media | `pages/admin/admin-stock-ajustes.html:11` |
| Funcional | Sin `page-card-loading`/`page-card-empty` ni estados globales. | Media | `pages/admin/admin-stock-ajustes.html:26` |
| Visual/Nomenclatura | Utilidades no estandar + mezcla ES/EN ("Correccion (Audit)"). | Media | `pages/admin/admin-stock-ajustes.html:55` |
| Funcional | Usa `auth:ready` en vez de `guardOrRedirect`. | Media | `assets/js/modules/admin/admin-stock-ajustes.js:6` |
| Funcional | `confirm()` para accion critica. | Media | `assets/js/modules/admin/admin-stock-ajustes.js:120` |

## Admin Master SKU
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Funcional | Falta `#module-content` (estandar). | Media | `pages/admin/admin-master-sku.html:40` |
| Visual | Utilidades `tabs-row mb-4`, `text-sm`, `pl-2` fuera del estandar. | Baja | `pages/admin/admin-master-sku.html:71` |
| Nomenclatura | `sku-search` vs `search-input` del estandar. | Baja | `pages/admin/admin-master-sku.html:84` |
| Funcional | JS referencia `providers-*` inexistentes en HTML. | Baja/Media | `assets/js/modules/admin/admin-master-sku.js:38` |

## Admin Master Proveedores
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Funcional | Falta `#module-content` (estandar). | Media | `pages/admin/admin-master-proveedores.html:38` |
| Funcional | Doble patron de empty state (HTML + inyeccion JS). | Media | `assets/js/modules/admin/admin-master-proveedores.js:83` |
| Nomenclatura | "Nombre (Fantasia)" sin acento vs "Nombre Fantasia". | Baja | `assets/js/modules/admin/admin-master-proveedores.js:122` |

## Admin Master Categorias
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Funcional | Falta `#module-content` (estandar). | Media | `pages/admin/admin-master-categorias.html:41` |
| Funcional | Doble patron de empty state (HTML + inyeccion JS). | Media | `assets/js/modules/admin/admin-master-categorias.js:78` |
| Nomenclatura | `categories-search` vs `search-input` estandar. | Baja | `pages/admin/admin-master-categorias.html:77` |

## Admin Master POS
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Funcional | Falta `#module-content` (estandar). | Media | `pages/admin/admin-master-pos.html:38` |
| Visual | `onclick` inline en empty state. | Baja | `pages/admin/admin-master-pos.html:52` |
| Nomenclatura | Mezcla ES/EN y faltan acentos ("Gestion", "Friendly Name", "External ID"). | Baja/Media | `pages/admin/admin-master-pos.html:63` |

## Admin Master Tarifario
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Funcional | Falta `#module-content` (estandar). | Media | `pages/admin/admin-master-tarifario.html:38` |
| Visual | `onclick` inline en empty state. | Baja | `pages/admin/admin-master-tarifario.html:52` |
| Visual | Utilidad `text-sm` en filtros fuera del estandar. | Baja | `pages/admin/admin-master-tarifario.html:70` |

## Admin Index
| Tipo | Inconsistencia | Severidad | Referencia |
| --- | --- | --- | --- |
| Visual | Estilo inline en segmented control. | Baja | `pages/admin/admin-index.html:45` |
| Nomenclatura | Etiquetas en EN/ES mezcladas (Work Days, Master SKUs, QR Generator). | Media | `pages/admin/admin-index.html:66` |
| Visual | JS aplica estilos inline para display y color de KPI. | Baja | `assets/js/pages/admin/admin-index.js:78` |
