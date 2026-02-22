const fs = require('fs');
const path = require('path');

const lhBase = 'docs/02-ui-ux/lighthouse';
const screenshotDir = 'docs/80-ephemeral/agent-logs/visual-audit';
const contextDir = 'docs/output/qa';

const screens = [
  { slug: 'admin-index',              screenshot: 'admin_admin-index.png',              topic: 'index' },
  { slug: 'admin-workdays',           screenshot: 'admin_admin-workdays.png',           topic: 'workday' },
  { slug: 'admin-semanal',            screenshot: 'admin_admin-semanal.png',            topic: 'semanal' },
  { slug: 'admin-reportes',           screenshot: 'admin_admin-reportes.png',           topic: 'reportes' },
  { slug: 'admin-pagos',              screenshot: 'admin_admin-pagos.png',              topic: 'pagos' },
  { slug: 'admin-solicitudes',        screenshot: 'admin_admin-solicitudes.png',        topic: 'solicitudes' },
  { slug: 'admin-config',             screenshot: 'admin_admin-config.png',             topic: 'config' },
  { slug: 'admin-central-stock',      screenshot: 'admin_admin-central-stock.png',      topic: 'central-stock' },
  { slug: 'admin-master-categorias',  screenshot: 'admin_admin-master-categorias.png',  topic: 'master-categorias' },
  { slug: 'admin-master-nomina',      screenshot: 'admin_admin-master-nomina.png',      topic: 'master-nomina' },
  { slug: 'admin-master-pos',         screenshot: 'admin_admin-master-pos.png',         topic: 'master-pos' },
  { slug: 'admin-master-proveedores', screenshot: 'admin_admin-master-proveedores.png', topic: 'master-proveedores' },
  { slug: 'admin-master-tarifario',   screenshot: 'admin_admin-master-tarifario.png',   topic: 'master-tarifario' },
];

let copied = 0;
let contextCopied = 0;

screens.forEach(s => {
  const destDir = path.join(lhBase, s.slug);

  // Copy screenshot
  const srcScreenshot = path.join(screenshotDir, s.screenshot);
  const dstScreenshot = path.join(destDir, 'screenshot.png');
  if (fs.existsSync(srcScreenshot) && !fs.existsSync(dstScreenshot)) {
    fs.copyFileSync(srcScreenshot, dstScreenshot);
    copied++;
  }

  // Copy context if exists
  const srcContext = path.join(contextDir, 'context-' + s.topic + '.md');
  const dstContext = path.join(destDir, 'context.md');
  if (fs.existsSync(srcContext) && !fs.existsSync(dstContext)) {
    fs.copyFileSync(srcContext, dstContext);
    contextCopied++;
  }
});

console.log('Screenshots copiados:', copied);
console.log('Contextos copiados:', contextCopied);
