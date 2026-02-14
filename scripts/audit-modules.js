const http = require('http');
const fs = require('fs');

const modules = [
  ['Admin', [
    ['admin/admin-index.html', 'Admin Index', 'Dashboard principal'],
    ['admin/admin-workdays.html', 'Admin Workdays', 'Jornadas, ZBB, devenciones'],
    ['admin/admin-pagos.html', 'Admin Pagos', 'Tesorería, pagos, nómina'],
    ['admin/admin-central-stock.html', 'Central Stock', 'Stock global'],
    ['admin/admin-solicitudes.html', 'Admin Solicitudes', 'Pedidos a proveedores'],
    ['admin/admin-config.html', 'Admin Config', 'Configuración sitio'],
    ['admin/admin-reportes.html', 'Admin Reportes', 'Reportes financieros'],
    ['admin/admin-semanal.html', 'Admin Semanal', 'Cierre semanal'],
    ['admin/admin-master-nomina.html', 'Master Nómina', 'Roles/staff'],
    ['admin/admin-master-pos.html', 'Master POS', 'Terminales'],
    ['admin/admin-master-proveedores.html', 'Master Proveedores', 'Proveedores'],
    ['admin/admin-master-tarifario.html', 'Master Tarifario', 'Tarifas entrada'],
    ['admin/admin-master-categorias.html', 'Master Categorías', 'Categorías'],
  ]],
  ['QR', [
    ['admin/qr/index.html', 'QR Index', 'Dashboard QR'],
    ['admin/qr/generator.html', 'QR Generator', 'Generador lotes'],
    ['admin/qr/monitor.html', 'QR Monitor', 'Monitor RT'],
  ]],
  ['Encargados', [
    ['encargados/encargado-caja-index.html', 'Enc Caja Index', 'Hub caja'],
    ['encargados/encargado-caja-noche.html', 'Enc Caja Noche', 'Cierre nocturno'],
    ['encargados/encargado-caja-personal.html', 'Enc Caja Personal', 'Staff caja'],
    ['encargados/encargado-barra-index.html', 'Enc Barra Index', 'Hub barra'],
    ['encargados/encargado-barra-noche.html', 'Enc Barra Noche', 'Conteo nocturno'],
    ['encargados/encargado-barra-personal.html', 'Enc Barra Personal', 'Staff barra'],
    ['encargados/encargado-recepcion.html', 'Enc Recepción', 'Control puerta'],
  ]],
  ['Gerencia', [
    ['gerencia/balance-semanal.html', 'Balance Semanal', 'Reporte gerencial'],
  ]],
  ['Logística', [
    ['logistica/logistica-index.html', 'Logística Index', 'Hub logístico'],
    ['logistica/logistica-distribucion.html', 'Distribución', 'Distribución'],
    ['logistica/logistica-recepcion.html', 'Recepción', 'Recepción merc.'],
    ['logistica/logistica-seguimiento.html', 'Seguimiento', 'Tracking pedidos'],
    ['logistica/logistica-stock.html', 'Log Stock', 'Stock logístico'],
  ]],
  ['Operativo', [
    ['operativo/operativo-index.html', 'Op Index', 'Hub operativo'],
    ['operativo/operativo-workday.html', 'Op Workday', 'Jornada operativa'],
    ['operativo/operativo-stock.html', 'Op Stock', 'Stock operativo'],
    ['operativo/operativo-solicitudes.html', 'Op Solicitudes', 'Pedidos op.'],
    ['operativo/operativo-analisis.html', 'Op Análisis', 'Análisis op.'],
    ['operativo/operativo-erp.html', 'Op ERP', 'Panel ERP'],
    ['operativo/operativo-cms.html', 'Op CMS', 'CMS contenido'],
    ['operativo/cms-members.html', 'CMS Members', 'Gestión miembros'],
    ['operativo/operativo-master-sku.html', 'Master SKU', 'Catálogo prod.'],
    ['operativo/operativo-master-proveedores.html', 'Op Proveedores', 'Proveedores op.'],
    ['operativo/scanner.html', 'Scanner', 'Escáner QR'],
  ]],
  ['Staff', [
    ['staff/staff-caja-index.html', 'Staff Caja', 'Dashboard caja'],
    ['staff/staff-barra-index.html', 'Staff Barra', 'Dashboard barra'],
  ]],
  ['Members', [
    ['members/my-qr.html', 'My QR', 'QR personal'],
  ]],
];

function fetchPage(path) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    http.get('http://localhost:8080/pages/' + path, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => { resolve({ code: res.statusCode, body: body, ms: Date.now() - t0 }); });
    }).on('error', (e) => { resolve({ code: 0, body: '', ms: Date.now() - t0, err: e.message }); });
  });
}

function analyze(html) {
  const r = {};
  const tm = html.match(/<title>(.*?)<\/title>/i);
  r.title = tm ? tm[1].trim() : '(sin titulo)';
  r.sizeKB = (html.length / 1024).toFixed(1);
  r.cssCount = (html.match(/<link[^>]+stylesheet/gi) || []).length;
  r.jsCount = (html.match(/<script[^>]*src=/gi) || []).length;
  r.supabase = html.includes('supabase') ? 'Y' : 'N';
  const rm = html.match(/data-allowed-roles="([^"]+)"/);
  r.roles = rm ? rm[1] : '(none)';
  r.goldenStd = html.includes('tokens.css') && html.includes('components.css') ? 'Y' : 'N';
  r.inlineStyles = (html.match(/style="/gi) || []).length;
  r.inlineOnclick = (html.match(/onclick="/gi) || []).length;
  r.tables = (html.match(/<table/gi) || []).length;
  r.forms = (html.match(/<form/gi) || []).length;
  r.hasTabs = (html.match(/tab-bar|data-tab/gi) || []).length > 0;
  r.hasTopbar = html.includes('class="topbar"');
  r.hasSlidePanel = html.includes('slide-panel') || html.includes('initSlidePanel');
  return r;
}

(async () => {
  const results = [];
  for (const [section, mods] of modules) {
    for (const [path, name, desc] of mods) {
      const res = await fetchPage(path);
      if (res.code === 200) {
        const a = analyze(res.body);
        results.push({ section, name, desc, path, code: res.code, ms: res.ms, ...a });
      } else {
        results.push({ section, name, desc, path, code: res.code, ms: res.ms, err: res.err || 'HTTP ' + res.code });
      }
    }
  }

  // Write JSON
  const outPath = 'C:/Users/siste/.gemini/antigravity/brain/d4d4195e-cb36-4569-b79e-59b97e6bfb8e/audit_results.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('Audit complete: ' + results.length + ' modules scanned');
  console.log('Results saved to: ' + outPath);

  // Quick summary
  const ok = results.filter(r => r.code === 200).length;
  const fail = results.filter(r => r.code !== 200).length;
  console.log('OK: ' + ok + ' | Error: ' + fail);
})();
