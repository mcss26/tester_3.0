// operativo-analisis.js - Lógica para Análisis de Consumo (Versión Operativa)

(async function() {
  'use strict';

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(['operativo', 'logistico', 'admin']);
  if (!session) return;

  // 2. Supabase Check
  if (!window.Utils.assertSbOrShowBlockingError()) return;

  const sb = window.sb;
  const { getThemeColor, getChartColors } = window.Utils;

  // ── State ──────────────────────────────────────────────────────────────
  let importData = [];
  let chartInstance = null;
  let importFileName = '';

  // ── Helpers ────────────────────────────────────────────────────────────

  function setMessage(container, message, isError) {
      if (!container) return;
      container.textContent = '';
      const paragraph = document.createElement('p');
      paragraph.textContent = message;
      paragraph.className = isError ? 'text-danger' : 'text-muted';
      container.appendChild(paragraph);
  }

  function normalizeString(value) {
      return String(value || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ');
  }

  function parseQuantity(value) {
      if (value === null || value === undefined || value === '') return 0;
      const raw = String(value).trim();
      if (!raw) return 0;
      const hasComma = raw.includes(',');
      const hasDot = raw.includes('.');
      let normalized = raw;
      if (hasComma && hasDot) {
          normalized = raw.replace(/\./g, '').replace(',', '.');
      } else {
          normalized = raw.replace(',', '.');
      }
      const clean = normalized.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(clean);
      return Number.isFinite(parsed) ? parsed : 0;
  }

  function buildCell(value) {
      const cell = document.createElement('td');
      const text = value === null || value === undefined || value === '' ? '-' : String(value);
      cell.textContent = text;
      return cell;
  }

  function buildAnalysisStat(label, value, tone) {
      const stat = document.createElement('div');
      stat.className = 'analysis-stat';
      if (tone) stat.classList.add(`is-${tone}`);

      const labelEl = document.createElement('p');
      labelEl.className = 'analysis-stat-label';
      labelEl.textContent = label;
      stat.appendChild(labelEl);

      const valueEl = document.createElement('p');
      valueEl.className = 'analysis-stat-value';
      valueEl.textContent = value;
      stat.appendChild(valueEl);

      return stat;
  }

  function buildInfoItem(label, value) {
      const item = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = label + ': ';
      item.appendChild(strong);
      item.appendChild(document.createTextNode(value));
      return item;
  }

  // ── Tab Navigation ─────────────────────────────────────────────────────

  function renderAnalysisTabs() {
      const container = document.getElementById('analysis-tabs-container');
      if (!container) return;
      container.textContent = '';

      const tabsDef = [
          { id: 'importar', label: 'Importar' },
          { id: 'analizar', label: 'Analizar' },
          { id: 'historica', label: 'Histórica' }
      ];

      tabsDef.forEach((tab, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.id = `tab-btn-${tab.id}`;
          btn.className = 'tab-chip';
          if (index === 0) btn.classList.add('active');
          btn.textContent = tab.label;
          btn.addEventListener('click', () => showAnalysisTab(tab.id));
          container.appendChild(btn);
      });
  }

  function showAnalysisTab(tabId) {
      ['importar', 'analizar', 'historica'].forEach(t => {
          const el = document.getElementById(`analysis-tab-${t}`);
          const btn = document.getElementById(`tab-btn-${t}`);
          if (el) el.classList.add('hidden');
          if (btn) btn.classList.remove('active');
      });

      const activeEl = document.getElementById(`analysis-tab-${tabId}`);
      const activeBtn = document.getElementById(`tab-btn-${tabId}`);
      if (activeEl) activeEl.classList.remove('hidden');
      if (activeBtn) activeBtn.classList.add('active');

      if (tabId === 'historica') {
          loadHistoryChart();
      }
  }

  // ── Import Logic ───────────────────────────────────────────────────────

  function handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      importFileName = file.name || '';

      const fileNameEl = document.getElementById('import-file-name');
      if (fileNameEl) {
          fileNameEl.textContent = importFileName ? `Archivo: ${importFileName}` : '';
      }

      const reader = new FileReader();
      reader.onload = function(e) {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          let headerRowIndex = 0;
          let foundHeader = false;

          for (let i = 0; i < Math.min(20, aoa.length); i++) {
              const row = aoa[i];
              const rowStr = row.join(' ').toLowerCase();
              if (rowStr.includes('producto') || rowStr.includes('nombre') || rowStr.includes('item') || rowStr.includes('articulo')) {
                  headerRowIndex = i;
                  foundHeader = true;
                  break;
              }
          }

          let headerOverride = null;
          if (!foundHeader) {
              const firstRow = aoa[headerRowIndex] || [];
              headerOverride = [];
              if (firstRow.length > 0) {
                  headerOverride[0] = 'producto';
                  if (firstRow.length > 1) headerOverride[1] = 'cantidad';
                  for (let i = 2; i < firstRow.length; i++) {
                      headerOverride[i] = `col_${i + 1}`;
                  }
              }
          }

          const json = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, header: headerOverride || undefined, defval: '' });
          processImportData(json, foundHeader);
      };
      reader.readAsArrayBuffer(file);
  }

  async function processImportData(json, foundHeader) {
      const previewContainer = document.getElementById('import-preview');
      setMessage(previewContainer, 'Procesando...', false);

      const { data: skus, error: skuError } = await sb.from('master_sku').select('id, nombre, external_id');
      if (skuError) {
          setMessage(previewContainer, 'Error al cargar SKUs: ' + skuError.message, true);
          return;
      }

      if (!json || json.length === 0) {
          setMessage(previewContainer, 'No se encontraron filas en el archivo.', true);
          return;
      }

      importData = [];
      let matchedCount = 0;
      let unmatchedCount = 0;

      json.forEach(row => {
          const keys = Object.keys(row);

          const productKey = keys.find(k =>
              k.toLowerCase().includes('articulo') ||
              k.toLowerCase().includes('producto') ||
              k.toLowerCase().includes('nombre') ||
              k.toLowerCase().includes('item') ||
              k.toLowerCase().includes('descrip')
          );

          const qtyKey = keys.find(k =>
              k.toLowerCase() === 'cantidad' ||
              k.toLowerCase() === 'cant' ||
              k.toLowerCase().includes('consumo') ||
              k.toLowerCase().includes('final') ||
              k.toLowerCase().includes('total')
          );

          const productName = productKey ? row[productKey] : null;
          const qty = qtyKey ? row[qtyKey] : 0;

          if (productName && String(productName).trim().length > 0) {
              const cleanName = normalizeString(productName);

              let match = skus.find(s => {
                  const dbName = normalizeString(s.nombre);
                  const dbExtId = normalizeString(s.external_id);
                  return dbName === cleanName || (dbExtId && dbExtId === cleanName);
              });

              importData.push({
                  excelName: productName,
                  skuId: match ? match.id : null,
                  skuName: match ? match.nombre : 'NO ENCONTRADO',
                  quantity: parseQuantity(qty)
              });

              if (match) matchedCount++;
              else unmatchedCount++;
          }
      });

      const detectedKeys = json.length > 0 ? Object.keys(json[0]).join(', ') : 'Ninguna';

      if (matchedCount === 0) {
          const sampleSkus = skus.slice(0, 5).map(s => `${s.nombre} [ID:${s.external_id}]`).join(', ');
          const sampleExcel = importData.slice(0, 5).map(d => `"${d.excelName}"`).join(', ');

          renderNoMatches({
              detectedKeys,
              importCount: importData.length,
              sampleSkus,
              sampleExcel,
              foundHeader
          });
          return;
      }

      renderImportPreview(matchedCount, unmatchedCount, foundHeader);
  }

  function renderNoMatches({ detectedKeys, importCount, sampleSkus, sampleExcel, foundHeader }) {
      const container = document.getElementById('import-preview');
      if (!container) return;
      container.textContent = '';

      const title = document.createElement('h4');
      title.textContent = 'No se encontraron coincidencias (0 matches)';
      container.appendChild(title);

      const warning = document.createElement('p');
      warning.className = 'text-muted';
      warning.textContent = foundHeader
          ? 'Revisa que las columnas y nombres coincidan con los SKUs.'
          : 'No se detectó cabecera clara. Se asumió: Columna 1 = Producto, Columna 2 = Cantidad.';
      container.appendChild(warning);

      const summary = document.createElement('div');
      summary.className = 'analysis-summary';
      summary.appendChild(buildAnalysisStat('Procesados', importCount));
      summary.appendChild(buildAnalysisStat('Coincidencias', 0, 'danger'));
      summary.appendChild(buildAnalysisStat('Cabecera', foundHeader ? 'Detectada' : 'Forzada'));
      container.appendChild(summary);

      const keys = document.createElement('p');
      keys.textContent = `Columnas detectadas: ${detectedKeys}`;
      container.appendChild(keys);

      const list = document.createElement('ul');
      list.className = 'detail-list';
      list.appendChild(buildInfoItem('Procesados', `${importCount} items válidos del Excel.`));
      list.appendChild(buildInfoItem('Ejemplos DB', `${sampleSkus} ...`));
      list.appendChild(buildInfoItem('Ejemplos Excel (Primeros 5)', `${sampleExcel} ...`));
      container.appendChild(list);

      const hint = document.createElement('p');
      hint.className = 'text-muted';
      hint.textContent = 'El sistema busca coincidencia exacta por Nombre o ID externo.';
      container.appendChild(hint);
  }

  function renderImportPreview(matched, unmatched, foundHeader) {
      const container = document.getElementById('import-preview');
      if (!container) return;
      container.textContent = '';

      const title = document.createElement('h4');
      title.textContent = 'Resultados del mapeo';
      container.appendChild(title);

      const summary = document.createElement('div');
      summary.className = 'analysis-summary';

      summary.appendChild(buildAnalysisStat('Total importado', importData.length));
      summary.appendChild(buildAnalysisStat('Encontrados', matched, matched > 0 ? 'success' : 'danger'));
      summary.appendChild(buildAnalysisStat('No encontrados', unmatched, unmatched > 0 ? 'danger' : 'success'));

      container.appendChild(summary);

      if (!foundHeader) {
          const warning = document.createElement('p');
          warning.className = 'text-muted';
          warning.textContent = 'No se detectó cabecera clara. Se asumió: Columna 1 = Producto, Columna 2 = Cantidad.';
          container.appendChild(warning);
      }

      const tableWrap = document.createElement('div');
      tableWrap.className = 'analysis-preview';

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      ;['Excel', 'Sistema', 'Cant'].forEach(label => {
          const th = document.createElement('th');
          th.textContent = label;
          headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      importData.forEach(item => {
          const row = document.createElement('tr');
          if (!item.skuId) row.classList.add('row-warning');
          row.appendChild(buildCell(item.excelName));
          row.appendChild(buildCell(item.skuName));
          row.appendChild(buildCell(item.quantity));
          tbody.appendChild(row);
      });
      table.appendChild(tbody);

      tableWrap.appendChild(table);
      container.appendChild(tableWrap);

      const actionRow = document.createElement('div');
      actionRow.className = 'form-actions';
      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = 'btn-primary';
      confirmBtn.textContent = 'Confirmar importación';
      confirmBtn.disabled = matched === 0;
      confirmBtn.addEventListener('click', confirmImport);
      actionRow.appendChild(confirmBtn);
      container.appendChild(actionRow);
  }

  // ── Confirm Import ─────────────────────────────────────────────────────

  async function confirmImport() {
      const dateVal = document.getElementById('import-date').value;
      if (!dateVal) {
          window.Toast.warning('Por favor seleccione una fecha operativa.');
          return;
      }

      if (importData.length === 0) return;

      const { data: report, error: repError } = await sb
          .from('consumption_reports')
          .insert({
              operational_date: dateVal,
              file_name: importFileName || ('Import ' + new Date().toLocaleDateString())
          })
          .select()
          .single();

      if (repError) {
          if (repError.code === '23505') {
              window.Toast.error('Ya existe un reporte para esta fecha. Elimínelo antes de importar uno nuevo.');
          } else {
              window.Toast.error('Error al crear reporte: ' + repError.message);
          }
          return;
      }

      const details = importData
          .filter(d => d.skuId)
          .map(d => ({
              report_id: report.id,
              sku_id: d.skuId,
              quantity: d.quantity
          }));

      if (details.length === 0) {
          window.Toast.info('No hay filas válidas para importar.');
          return;
      }

      const { error: detError } = await sb
          .from('consumption_details')
          .insert(details);

      if (detError) {
          window.Toast.warning('Reporte creado pero hubo error en detalles: ' + detError.message);
      } else {
          window.Toast.success('Importación exitosa.');
          importData = [];
          document.getElementById('import-preview').textContent = '';
          document.getElementById('import-file').value = '';
          const fileNameEl = document.getElementById('import-file-name');
          if (fileNameEl) fileNameEl.textContent = '';
          try {
              window.sessionStorage.removeItem('analysis-ideal-cache-v1');
          } catch (err) {
              // ignore storage errors
          }
      }
  }

  // ── Analyze Logic ──────────────────────────────────────────────────────

  async function analyzeIdealStock() {
      const start = document.getElementById('analyze-date-start').value;
      const end = document.getElementById('analyze-date-end').value;

      if(!start || !end) {
          window.Toast.warning('Seleccione rango de fechas.');
          return;
      }

      const container = document.getElementById('analysis-results');
      setMessage(container, 'Calculando...', false);

      const { data: reports, error: reportError } = await sb
          .from('consumption_reports')
          .select('id')
          .gte('operational_date', start)
          .lte('operational_date', end);

      if (reportError) {
          setMessage(container, 'Error al cargar reportes: ' + reportError.message, true);
          return;
      }

      if (!reports || reports.length === 0) {
          setMessage(container, 'No hay reportes en este rango.', false);
          return;
      }

      const reportIds = reports.map(r => r.id);

      const { data: details, error: detailError } = await sb
          .from('consumption_details')
          .select('sku_id, quantity, sku:master_sku(nombre)')
          .in('report_id', reportIds);

      if (detailError) {
          setMessage(container, 'Error al cargar detalles: ' + detailError.message, true);
          return;
      }

      if (!details || details.length === 0) {
          setMessage(container, 'No hay detalles en este rango.', false);
          return;
      }

      const skuMap = {};
      details.forEach(d => {
          if (!skuMap[d.sku_id]) {
              skuMap[d.sku_id] = {
                  name: d.sku.nombre,
                  totalQty: 0,
              };
          }
          skuMap[d.sku_id].totalQty += d.quantity;
      });

      const daysCount = reportIds.length;

      container.textContent = '';
      const title = document.createElement('h4');
      title.textContent = 'Resultados del análisis';
      container.appendChild(title);
      const summary = document.createElement('div');
      summary.className = 'analysis-summary';

      summary.appendChild(buildAnalysisStat('Días analizados', daysCount));
      summary.appendChild(buildAnalysisStat('Productos', Object.keys(skuMap).length));
      container.appendChild(summary);

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      ;['Producto', 'Consumo Promedio', 'Ideal 500', 'Ideal 900'].forEach(label => {
          const th = document.createElement('th');
          th.textContent = label;
          headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      for (const [id, data] of Object.entries(skuMap)) {
          const avg = (data.totalQty / daysCount);
          const ideal500 = Math.ceil(avg);
          const ideal900 = Math.ceil(avg * (900 / 500));

          const row = document.createElement('tr');
          row.appendChild(buildCell(data.name));
          row.appendChild(buildCell(avg.toFixed(2)));

          const idealCell = document.createElement('td');
          idealCell.textContent = ideal500;
          idealCell.className = 'analysis-ideal';
          row.appendChild(idealCell);

          const ideal2Cell = document.createElement('td');
          ideal2Cell.textContent = ideal900;
          ideal2Cell.className = 'analysis-ideal';
          row.appendChild(ideal2Cell);

          tbody.appendChild(row);
      }

      table.appendChild(tbody);
      const tableWrap = document.createElement('div');
      tableWrap.className = 'analysis-preview';
      tableWrap.appendChild(table);
      container.appendChild(tableWrap);
  }

  // ── History Chart ──────────────────────────────────────────────────────

  async function loadHistoryChart() {
      const canvas = document.getElementById('history-chart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (chartInstance) chartInstance.destroy();

      const { data: reports, error: reportError } = await sb
          .from('consumption_reports')
          .select('operational_date, id')
          .order('operational_date', { ascending: false })
          .limit(30);

      if (reportError || !reports || reports.length === 0) return;

      const orderedReports = reports.slice().reverse();

      const reportIds = orderedReports.map(r => r.id);
      const dates = orderedReports.map(r => r.operational_date);

      const { data: details, error: detailsError } = await sb
          .from('consumption_details')
          .select('report_id, sku_id, quantity, sku:master_sku(nombre)')
          .in('report_id', reportIds);

      if (detailsError || !details || details.length === 0) return;

      const skuTotals = {};

      details.forEach(d => {
          if (!skuTotals[d.sku_id]) {
              skuTotals[d.sku_id] = {
                  name: d.sku?.nombre || 'Desconocido',
                  total: 0,
                  id: d.sku_id
              };
          }
          skuTotals[d.sku_id].total += d.quantity;
      });

      const top5 = Object.values(skuTotals)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

      const themeColors = getChartColors(5);

      const datasets = top5.map((sku, index) => {
          const data = dates.map(date => {
              const rep = orderedReports.find(r => r.operational_date === date);
              if (!rep) return 0;

              const det = details.find(d => d.report_id === rep.id && d.sku_id === sku.id);
              return det ? det.quantity : 0;
          });

          const color = themeColors[index % themeColors.length];

          return {
              label: sku.name,
              data: data,
              borderColor: color,
              backgroundColor: color,
              tension: 0.1,
              fill: false
          };
      });

      if (datasets.length === 0) {
           datasets.push({ label: 'Sin Datos', data: [] });
      }

      const textColor = getThemeColor('--color-text-muted', '#a0a0a0');
      const gridColor = getThemeColor('--color-border', 'rgba(255,255,255,0.06)');

      chartInstance = await window.ChartLoader.create(ctx, {
          type: 'line',
          data: {
              labels: dates,
              datasets: datasets
          },
          options: {
              responsive: true,
              interaction: {
                  mode: 'index',
                  intersect: false,
              },
              plugins: {
                  title: {
                      display: true,
                      text: 'Top 5 Productos Más Consumidos (Últimos 30 días)',
                      color: getThemeColor('--color-text-main', '#e0e0e0')
                  },
                  legend: {
                      position: 'top',
                      labels: {
                          usePointStyle: true,
                          color: textColor
                      }
                  }
              },
              scales: {
                  x: {
                      ticks: { color: textColor },
                      grid: { color: gridColor }
                  },
                  y: {
                      ticks: { color: textColor },
                      grid: { color: gridColor }
                  }
              }
          }
      });
  }

  // ── Boot ────────────────────────────────────────────────────────────────

  // Bind file input (replaces inline onchange in HTML)
  const fileInput = document.getElementById('import-file');
  if (fileInput) fileInput.addEventListener('change', handleFileSelect);

  // Bind analyze button
  const analyzeBtn = document.getElementById('btn-analyze-ideal');
  if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeIdealStock);

  renderAnalysisTabs();
  showAnalysisTab('importar');

  const previewContainer = document.getElementById('import-preview');
  setMessage(previewContainer, 'Seleccione un archivo para previsualizar.', false);

  const resultsContainer = document.getElementById('analysis-results');
  setMessage(resultsContainer, 'Seleccione un rango para calcular recomendaciones.', false);

})();
