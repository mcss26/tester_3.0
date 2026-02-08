/**
 * chart-loader.js — Lazy Chart.js Loader
 * 
 * Defers Chart.js loading until a chart is actually needed.
 * Eliminates render-blocking script from pages that may never use charts.
 * 
 * Usage:
 *   const Chart = await window.ChartLoader.load();
 *   new Chart(ctx, config);
 * 
 * Or with auto-retry:
 *   const chart = await window.ChartLoader.create(ctx, config);
 */
(function () {
  'use strict';

  const CDN_URL = 'https://cdn.jsdelivr.net/npm/chart.js';
  let loadPromise = null;

  /**
   * Load Chart.js from CDN if not already available.
   * Returns a Promise that resolves to the Chart constructor.
   * @returns {Promise<typeof Chart>}
   */
  function load() {
    // Already loaded globally?
    if (window.Chart) return Promise.resolve(window.Chart);

    // Already loading?
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CDN_URL;
      script.async = true;
      script.onload = () => {
        if (window.Chart) {
          resolve(window.Chart);
        } else {
          reject(new Error('Chart.js loaded but Chart constructor not found'));
        }
      };
      script.onerror = () => {
        loadPromise = null; // Allow retry
        reject(new Error('Failed to load Chart.js from CDN'));
      };
      document.head.appendChild(script);
    });

    return loadPromise;
  }

  /**
   * Convenience: load Chart.js and create a chart in one call.
   * @param {CanvasRenderingContext2D|HTMLCanvasElement} ctx
   * @param {Object} config — Chart.js configuration
   * @returns {Promise<Chart>}
   */
  async function create(ctx, config) {
    const Chart = await load();
    return new Chart(ctx, config);
  }

  window.ChartLoader = Object.freeze({ load, create });
})();
