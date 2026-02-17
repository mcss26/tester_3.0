/**
 * FormulaMid 4 - System Constants
 * Centralized strings and configuration tokens
 */
(function () {
  if (window.Constants) return;

  window.Constants = {
    LABELS: {
      UNKNOWN: 'Desconocido',
      UNKNOWN_SKU: 'Producto Desconocido',
      UNKNOWN_SUPPLIER: 'Proveedor Desconocido',
      NO_SUPPLIER: 'Sin Proveedor',
      UNASSIGNED: 'Sin Asignar',
      NO_DATA: 'Sin datos'
    },

    STATUS: {
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      DRAFT: 'DRAFT',
      READY_FOR_APPROVAL: 'ready_for_approval',
      ENVIADO: 'enviado',
      RECIBIDO: 'recibido',
      ACTIVE: 'ACTIVE',
      OPEN: 'open',
      CLOSED: 'CLOSED',
      PLANNED: 'PLANNED'
    },

    MESSAGES: {
      LOADING: 'Cargando...',
      NO_ITEMS: 'No hay items para mostrar',
      ERROR_GENERIC: 'Ha ocurrido un error',
      ERROR_LOAD: 'Error al cargar los datos',
      CONFIRM_ACTION: '¿Confirmar acción?',
      NOT_AUTHORIZED: 'No tienes permisos para esta acción'
    },

    STYLING: {
      STATUS_CLASSES: {
        pendiente: "status-warning",
        enviado: "status-info",
        aprobado: "status-success",
        recibido: "status-success",
        ready_for_approval: "status-warning",
        DRAFT: "status-info",
        ACTIVE: "status-success",
        open: "status-success",
        CLOSED: "status-neutral",
        PLANNED: "status-info"
      }
    }
  };
})();
