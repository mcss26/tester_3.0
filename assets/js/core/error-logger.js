/**
 * error-logger.js — Centralized Error Logging Utility
 * 
 * Provides structured error capture with module context,
 * severity levels, and optional Supabase audit trail.
 * 
 * Usage:
 *   const log = window.ErrorLogger.create('admin-pagos');
 *   log.error('Error loading data', err);
 *   log.warn('Stale cache detected');
 *   log.info('Loaded 42 records');
 * 
 * Or standalone:
 *   window.ErrorLogger.capture('module', 'message', error, 'error');
 */
(function () {
  'use strict';

  const SEVERITY = { INFO: 'info', WARN: 'warn', ERROR: 'error' };
  const MAX_BUFFER = 50;

  /** @type {{ ts: string, module: string, severity: string, message: string, detail?: string }[]} */
  const buffer = [];

  /**
   * Core capture function.
   * @param {string} module  — Source module identifier
   * @param {string} message — Human-readable description
   * @param {*}      [detail] — Error object or arbitrary data
   * @param {string} [severity='error'] — 'info' | 'warn' | 'error'
   */
  function capture(module, message, detail, severity) {
    severity = severity || SEVERITY.ERROR;

    const entry = {
      ts: new Date().toISOString(),
      module,
      severity,
      message,
      detail: detail instanceof Error
        ? detail.message + (detail.stack ? '\n' + detail.stack : '')
        : detail != null ? String(detail) : undefined
    };

    // Console output (preserves existing dev workflow)
    const prefix = `[${module}]`;
    const consoleFn = severity === SEVERITY.WARN ? console.warn
      : severity === SEVERITY.INFO ? console.info
      : console.error;
    consoleFn(prefix, message, detail || '');

    // Ring buffer (latest 50)
    if (buffer.length >= MAX_BUFFER) buffer.shift();
    buffer.push(entry);

    // Async persist (fire-and-forget, never blocks UI)
    persistEntry(entry);
  }

  /**
   * Persist to Supabase if available (best-effort, non-blocking).
   * @param {{ ts: string, module: string, severity: string, message: string, detail?: string }} entry
   */
  async function persistEntry(entry) {
    try {
      const sb = window.sb;
      if (!sb) return; // No DB client — skip silently

      await sb.from('error_log').insert({
        created_at: entry.ts,
        module: entry.module,
        severity: entry.severity,
        message: entry.message.substring(0, 500),
        detail: entry.detail ? entry.detail.substring(0, 2000) : null
      });
    } catch (_ignored) {
      // Never let logging itself crash the app
    }
  }

  /**
   * Create a scoped logger bound to a module name.
   * @param {string} module
   * @returns {{ error: Function, warn: Function, info: Function }}
   */
  function create(module) {
    return {
      error: (msg, detail) => capture(module, msg, detail, SEVERITY.ERROR),
      warn:  (msg, detail) => capture(module, msg, detail, SEVERITY.WARN),
      info:  (msg, detail) => capture(module, msg, detail, SEVERITY.INFO)
    };
  }

  /**
   * Retrieve the in-memory error buffer (for debugging / admin panels).
   * @returns {ReadonlyArray<object>}
   */
  function getBuffer() {
    return Object.freeze([...buffer]);
  }

  // Public API
  window.ErrorLogger = Object.freeze({ capture, create, getBuffer, SEVERITY });
})();
