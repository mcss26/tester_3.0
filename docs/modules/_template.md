# [Nombre del Módulo]

> **Rol**: [Admin / Encargado / Staff / Operativo / Logística]
> **Ruta**: `pages/[categoria]/[archivo].html`
> **JS**: `assets/js/modules/[categoria]/[archivo].js`
> **Estado**: [Borrador / Verificado / Actualizado]
> **Última Actualización**: YYYY-MM-DD

---

## 1. Información General

### 1.1 ¿Quién lo usa?

[Perfil del usuario que accede a este módulo. Describir el rol y contexto de uso]

### 1.2 ¿Qué hace?

[Objetivo principal del módulo y el valor que aporta al negocio. ¿Qué problema resuelve?]

### 1.3 ¿Cómo lo hace?

[Resumen del proceso que sigue para cumplir su función]

---

## 2. Experiencia de Usuario (UX)

### 2.1 Punto de Entrada

[¿Cómo accede el usuario? Ruta de navegación desde el landing/dashboard]

### 2.2 Flujo Principal

1. Usuario accede a la pantalla
2. Sistema verifica autenticación con `Auth.guardOrRedirect()`
3. Sistema carga datos desde `[tabla/vista]`
4. Usuario realiza acción principal
5. Sistema procesa y guarda cambios
6. Sistema muestra feedback

### 2.3 Inputs y Acciones Clave

- **Campos principales**: [Lista de campos críticos o filtros]
- **Acción principal**: [Botón o disparador principal]
- **Feedback inmediato**: [Toast, loading, actualización de UI]

---

## 3. Aspectos Técnicos

### 3.1 Modelo de Datos

| Operación     | Tablas/Vistas           | Campos Clave               |
| :------------ | :---------------------- | :------------------------- |
| **Lectura**   | `tabla_a`, `vw_vista_b` | id, name, status           |
| **Escritura** | `tabla_c`               | id, created_at, created_by |

### 3.2 Lógica de Negocio

[Descripción de la lógica principal: cálculos, validaciones, transformaciones]

**Casos especiales**:

- [Caso borde 1 y cómo se maneja]
- [Caso borde 2 y cómo se maneja]

### 3.3 Endpoints/API

[Si aplica, describir endpoints de Supabase o externos utilizados]

---

## 4. Componentes UI

### 4.1 Estructura

- **Layout**: `app-shell` + `page-shell`
- **Componente principal**: [nombre del componente]
- **Overlay/Modal**: [si aplica]
- **Feedback**: `Toast`, `loading-spinner`

### 4.2 Estados del Sistema

| Estado      | Trigger            | UI                     |
| :---------- | :----------------- | :--------------------- |
| **Loading** | Carga inicial      | `.loading-spinner`     |
| **Empty**   | Sin datos          | `.empty-state` con CTA |
| **Error**   | Fallo de operación | `Toast.error()`        |
| **Success** | Operación exitosa  | `Toast.success()`      |

### 4.3 Accesibilidad

- [ ] Navegación por teclado funcional
- [ ] Labels y roles ARIA presentes
- [ ] Contraste de colores cumple WCAG AA
- [ ] Mensajes de error descriptivos

---

## 5. Dependencias

### 5.1 Scripts Core

- `core/config.js`
- `core/supabase-client.js`
- `core/auth.js`
- `core/utils.js`
- `core/toast.js`

### 5.2 Módulos Externos

[Ninguno / Chart.js / Bibliotecas de terceros]

### 5.3 Dependencias entre Módulos

[¿Este módulo consume datos de otros módulos? ¿Otros módulos dependen de este?]

---

## 6. Validaciones y Seguridad

### 6.1 Control de Acceso

- [ ] Solo roles `[X, Y]` pueden acceder
- [ ] Validación con `Auth.guardOrRedirect()`
- [ ] Permisos a nivel de Supabase RLS

### 6.2 Validaciones de Datos

- [ ] Campos requeridos: `[campo1, campo2]`
- [ ] Rangos numéricos: `[campo >= 0]`
- [ ] Formatos específicos: [emails, fechas, etc.]
- [ ] Prevención de duplicados

### 6.3 Manejo de Errores

[Describir estrategia de error handling: qué errores se capturan, cómo se muestran al usuario]

---

## 7. Decisiones Arquitectónicas

### 7.1 ¿Por qué se diseñó así?

[Explicar las decisiones de diseño principales, trade-offs considerados]

### 7.2 Patrones Utilizados

[Ej: Uso de vistas para cálculos complejos, normalización de datos, etc.]

### 7.3 Consideraciones de Performance

[Optimizaciones implementadas, índices de BD, lazy loading, etc.]

---

## 8. Preguntas Frecuentes (FAQ)

**P: [Pregunta común de usuario]**
R: [Respuesta]

**P: [Otra pregunta común]**
R: [Respuesta]

---

## 9. Testing y Verificación

### 9.1 Escenarios de Prueba

- [ ] Flujo feliz: [Descripción del caso exitoso]
- [ ] Error de validación: [Cómo probar campos inválidos]
- [ ] Estado vacío: [Cómo probar sin datos]
- [ ] Permisos: [Cómo verificar control de acceso]

### 9.2 Datos de Prueba

[¿Qué datos se necesitan para probar este módulo?]

---

## 10. Historial de Cambios

| Fecha      | Autor    | Descripción del Cambio |
| :--------- | :------- | :--------------------- |
| YYYY-MM-DD | [Nombre] | Creación inicial       |

---

## 11. Referencias y Links

- [Link a diseño en Figma]
- [Link a ticket/issue relacionado]
- [Link a documentación de API externa]
- [Link a módulos relacionados](../[categoria]/[archivo].md)
