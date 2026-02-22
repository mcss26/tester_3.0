// lighthouse-playwright.js
// Authenticates with Supabase via puppeteer-core, then runs Lighthouse CLI on each admin screen.
// Usage: node scripts/lighthouse-playwright.js [slug]

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chromeLauncher = require("chrome-launcher");
const puppeteer = require("puppeteer-core");

const BASE_URL = "http://127.0.0.1:5501";
const LH_DIR = path.join("docs", "02-ui-ux", "lighthouse");

const SUPABASE_URL = "https://iyknbgmcnbpvalvsjxjz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a25iZ21jbmJwdmFsdnNqeGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTc4MTEsImV4cCI6MjA4MzkzMzgxMX0.n3aFby5YOMZbyqwsWZPlSJuf_KzRB6woja70divY32A";
const AUTH_EMAIL = process.env.LH_EMAIL || "admin@midnightclub.com.ar";
const AUTH_PASS = process.env.LH_PASS || "28021999";

const SCREENS = [
  { slug: "admin-index", path: "/pages/admin/admin-index.html" },
  { slug: "admin-semanal", path: "/pages/admin/admin-semanal.html" },
  { slug: "admin-reportes", path: "/pages/admin/admin-reportes.html" },
  { slug: "admin-pagos", path: "/pages/admin/admin-pagos.html" },
  { slug: "admin-solicitudes", path: "/pages/admin/admin-solicitudes.html" },
  { slug: "admin-config", path: "/pages/admin/admin-config.html" },
  { slug: "admin-central-stock", path: "/pages/admin/admin-central-stock.html" },
  { slug: "admin-master-categorias", path: "/pages/admin/admin-master-categorias.html" },
  { slug: "admin-master-nomina", path: "/pages/admin/admin-master-nomina.html" },
  { slug: "admin-master-pos", path: "/pages/admin/admin-master-pos.html" },
  { slug: "admin-master-proveedores", path: "/pages/admin/admin-master-proveedores.html" },
  { slug: "admin-master-tarifario", path: "/pages/admin/admin-master-tarifario.html" },
  { slug: "admin-workdays", path: "/pages/admin/admin-workdays.html" },
];

function needsReport(slug) {
  return !fs.existsSync(path.join(LH_DIR, slug, "report.json"));
}

async function main() {
  const targetSlug = process.argv[2];

  let targets;
  if (targetSlug) {
    const screen = SCREENS.find((s) => s.slug === targetSlug);
    if (!screen) {
      console.error(`Unknown slug: ${targetSlug}`);
      process.exit(1);
    }
    targets = [screen];
  } else {
    targets = SCREENS.filter((s) => needsReport(s.slug));
    if (targets.length === 0) {
      console.log("✓ All screens already have report.json");
      process.exit(0);
    }
  }

  console.log(`\n🔦 Lighthouse v13 CLI Runner`);
  console.log(`   Screens: ${targets.length}`);
  console.log(`   ${targets.map((t) => t.slug).join(", ")}\n`);

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless=new", "--no-first-run", "--no-default-browser-check"],
  });
  const port = chrome.port;
  console.log(`   Chrome on port ${port}\n`);

  // Authenticate via puppeteer
  console.log("🔐 Authenticating...");
  const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}` });
  const page = await browser.newPage();

  // Navigate to index.html (redirects to login.html) — safe page that won't redirect mid-evaluate
  await page.goto(`${BASE_URL}/index.html`, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  const authResult = await page.evaluate(
    async (url, key, email, pass) => {
      try {
        const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
          body: JSON.stringify({ email, password: pass }),
        });
        if (!res.ok) return { error: `HTTP ${res.status}` };
        const data = await res.json();
        localStorage.setItem(
          `sb-iyknbgmcnbpvalvsjxjz-auth-token`,
          JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
            expires_in: data.expires_in,
            token_type: data.token_type,
            user: data.user,
          })
        );
        return { ok: true, email: data.user?.email };
      } catch (e) {
        return { error: e.message };
      }
    },
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    AUTH_EMAIL,
    AUTH_PASS
  );

  if (authResult.error) {
    console.error(`   ❌ Auth failed: ${authResult.error}`);
    await chrome.kill();
    process.exit(1);
  }
  console.log(`   ✅ ${authResult.email}\n`);

  await page.close();
  await browser.disconnect();

  // Run Lighthouse CLI for each screen using the same Chrome instance
  const results = [];
  for (const screen of targets) {
    const url = `${BASE_URL}${screen.path}`;
    const outDir = path.join(LH_DIR, screen.slug);
    const reportPath = path.join(outDir, "report.json");

    console.log(`📊 ${screen.slug}`);

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    try {
      const cmd = [
        "npx lighthouse",
        `"${url}"`,
        `--port=${port}`,
        "--output=json",
        `--output-path="${reportPath}"`,
        "--only-categories=performance,accessibility,best-practices,seo",
        "--form-factor=mobile",
        "--screenEmulation.mobile=true",
        "--screenEmulation.width=412",
        "--screenEmulation.height=823",
        "--throttling.rttMs=150",
        "--throttling.throughputKbps=1638.4",
        "--throttling.cpuSlowdownMultiplier=4",
        "--quiet",
        "--chrome-flags=''",
      ].join(" ");

      execSync(cmd, { stdio: "pipe", timeout: 120000 });

      // Read and extract scores
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
        const cats = report.categories;
        const scores = {
          P: Math.round((cats.performance?.score || 0) * 100),
          A: Math.round((cats.accessibility?.score || 0) * 100),
          BP: Math.round((cats["best-practices"]?.score || 0) * 100),
          SEO: Math.round((cats.seo?.score || 0) * 100),
        };
        console.log(`   ✅ P:${scores.P} A:${scores.A} BP:${scores.BP} SEO:${scores.SEO}`);
        results.push({ slug: screen.slug, scores, ok: true });
      }
    } catch (err) {
      console.error(`   ❌ ${err.message?.substring(0, 100)}`);
      results.push({ slug: screen.slug, ok: false });
    }
  }

  await chrome.kill();

  // Generate summaries
  console.log("\n📝 Summaries...");
  for (const r of results) {
    if (!r.ok) continue;
    try {
      execSync(`node docs/02-ui-ux/lighthouse/parse-report.js ${r.slug}`, { stdio: "inherit" });
    } catch (_) {}
  }

  // Matrix
  console.log("\n📊 Matrix...");
  try {
    execSync("node scripts/lighthouse-matrix.js", { stdio: "inherit" });
  } catch (_) {}

  // Final summary
  console.log("\n" + "=".repeat(50));
  for (const r of results) {
    if (r.ok) {
      console.log(`✅ ${r.slug}: P:${r.scores.P} A:${r.scores.A} BP:${r.scores.BP} SEO:${r.scores.SEO}`);
    } else {
      console.log(`❌ ${r.slug}`);
    }
  }
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
