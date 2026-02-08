/**
 * Chart Helper — Design System wrapper for Chart.js
 * Provides pre-configured chart creation with Midnight dark theme.
 * Requires Chart.js 4.x loaded via CDN before this script.
 */

window.ChartHelper = (() => {
    'use strict';

    // ── Brand Palette ──────────────────────────────────────────
    const COLORS = {
        accent:      'rgba(139, 92, 246, 1)',    // --clr-accent
        accentSoft:  'rgba(139, 92, 246, 0.3)',
        success:     'rgba(52, 211, 153, 1)',     // --clr-success
        successSoft: 'rgba(52, 211, 153, 0.2)',
        error:       'rgba(248, 113, 113, 1)',    // --clr-error
        errorSoft:   'rgba(248, 113, 113, 0.2)',
        warning:     'rgba(251, 191, 36, 1)',     // --clr-warning
        warningSoft: 'rgba(251, 191, 36, 0.2)',
        info:        'rgba(96, 165, 250, 1)',
        infoSoft:    'rgba(96, 165, 250, 0.2)',
        white:       'rgba(255, 255, 255, 0.9)',
        muted:       'rgba(255, 255, 255, 0.4)',
        gridLine:    'rgba(255, 255, 255, 0.06)',
        surface:     'rgba(255, 255, 255, 0.03)',
    };

    const PALETTE = [
        COLORS.accent, COLORS.success, COLORS.info,
        COLORS.warning, COLORS.error,
        'rgba(167, 139, 250, 1)', 'rgba(45, 212, 191, 1)',
    ];

    // ── Global Defaults ────────────────────────────────────────
    function _applyDefaults() {
        if (!window.Chart) return;
        Chart.defaults.color = COLORS.muted;
        Chart.defaults.borderColor = COLORS.gridLine;
        Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
        Chart.defaults.font.size = 11;
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.padding = 16;
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 15, 25, 0.95)';
        Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.elements.bar.borderRadius = 4;
        Chart.defaults.elements.point.radius = 3;
        Chart.defaults.elements.point.hoverRadius = 6;
        Chart.defaults.elements.line.tension = 0.3;
    }

    // ── Instances Registry ─────────────────────────────────────
    const _instances = {};

    function _destroy(canvasId) {
        if (_instances[canvasId]) {
            _instances[canvasId].destroy();
            delete _instances[canvasId];
        }
    }

    function _getCanvas(canvasId) {
        const el = document.getElementById(canvasId);
        if (!el) { console.warn(`[ChartHelper] Canvas #${canvasId} not found`); return null; }
        return el;
    }

    // ── Public API ─────────────────────────────────────────────

    /**
     * Create a bar chart
     * @param {string} canvasId - Canvas element ID
     * @param {string[]} labels - X-axis labels
     * @param {Object[]} datasets - Array of { label, data, color? }
     * @param {Object} [opts] - Extra Chart.js options
     */
    function bar(canvasId, labels, datasets, opts = {}) {
        const canvas = _getCanvas(canvasId);
        if (!canvas) return null;
        _destroy(canvasId);

        const chartDatasets = datasets.map((ds, i) => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.color || PALETTE[i % PALETTE.length],
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 4,
            ...ds.extra,
        }));

        _instances[canvasId] = new Chart(canvas, {
            type: 'bar',
            data: { labels, datasets: chartDatasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: COLORS.gridLine },
                        ticks: { callback: v => _formatShort(v) },
                    },
                    x: { grid: { display: false } },
                },
                plugins: {
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${_formatMoney(ctx.parsed.y)}` } },
                },
                ...opts,
            },
        });
        return _instances[canvasId];
    }

    /**
     * Create a line chart
     */
    function line(canvasId, labels, datasets, opts = {}) {
        const canvas = _getCanvas(canvasId);
        if (!canvas) return null;
        _destroy(canvasId);

        const chartDatasets = datasets.map((ds, i) => ({
            label: ds.label,
            data: ds.data,
            borderColor: ds.color || PALETTE[i % PALETTE.length],
            backgroundColor: ds.fillColor || (ds.color || PALETTE[i % PALETTE.length]).replace(', 1)', ', 0.1)'),
            fill: ds.fill !== undefined ? ds.fill : true,
            pointBackgroundColor: ds.color || PALETTE[i % PALETTE.length],
            ...ds.extra,
        }));

        _instances[canvasId] = new Chart(canvas, {
            type: 'line',
            data: { labels, datasets: chartDatasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: {
                        grid: { color: COLORS.gridLine },
                        ticks: { callback: v => _formatShort(v) },
                    },
                    x: { grid: { display: false } },
                },
                plugins: {
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${_formatMoney(ctx.parsed.y)}` } },
                },
                ...opts,
            },
        });
        return _instances[canvasId];
    }

    /**
     * Create a doughnut chart
     */
    function doughnut(canvasId, labels, data, opts = {}) {
        const canvas = _getCanvas(canvasId);
        if (!canvas) return null;
        _destroy(canvasId);

        _instances[canvasId] = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: PALETTE.slice(0, labels.length),
                    borderWidth: 0,
                    hoverOffset: 8,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { label: ctx => `${ctx.label}: ${_formatMoney(ctx.parsed)}` } },
                },
                ...opts,
            },
        });
        return _instances[canvasId];
    }

    // ── Formatters ─────────────────────────────────────────────
    function _formatMoney(v) {
        if (window.Utils?.formatARS) return window.Utils.formatARS(v);
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v);
    }

    function _formatShort(v) {
        if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
        return v.toString();
    }

    // ── Init ───────────────────────────────────────────────────
    // Apply defaults when Chart.js is ready
    if (window.Chart) {
        _applyDefaults();
    } else {
        const _origOnload = window.onload;
        window.addEventListener('DOMContentLoaded', () => {
            if (window.Chart) _applyDefaults();
        });
    }

    return { bar, line, doughnut, COLORS, PALETTE, destroy: _destroy };
})();
