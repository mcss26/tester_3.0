/**
 * MOCK-DATA.JS — Night Chief (Stock Audit + Caja + Nómina)
 * 100% ephemeral — only displays live data, no persistence.
 * ES Module — imported by app.js
 */

  /* ── Stock Audit: Conteo manual por categoría ── */
  const stockCategories = ['Destilados', 'Cerveza', 'Sin Alcohol', 'Insumos'];

  const stockAudit = [
    { sku: 'Fernet Branca 750',    cat: 'Destilados',   system: 24, counted: 21, cost: 3200  },
    { sku: 'Absolut Vodka 750',    cat: 'Destilados',   system: 18, counted: 18, cost: 4800  },
    { sku: 'Johnnie Walker Red',   cat: 'Destilados',   system: 12, counted: 11, cost: 6500  },
    { sku: 'Havana Club 3A',       cat: 'Destilados',   system: 15, counted: 14, cost: 3800  },
    { sku: 'Beefeater Gin 750',    cat: 'Destilados',   system: 10, counted: 10, cost: 5200  },
    { sku: 'Jägermeister 700',     cat: 'Destilados',   system: 8,  counted: 7,  cost: 7100  },
    { sku: 'Stella Artois 330',    cat: 'Cerveza',      system: 96, counted: 88, cost: 650   },
    { sku: 'Corona 355',           cat: 'Cerveza',      system: 72, counted: 70, cost: 750   },
    { sku: 'Patagonia IPA 473',    cat: 'Cerveza',      system: 48, counted: 48, cost: 900   },
    { sku: 'Red Bull 250ml',       cat: 'Sin Alcohol',  system: 48, counted: 46, cost: 1500  },
    { sku: 'Speed 250ml',          cat: 'Sin Alcohol',  system: 36, counted: 35, cost: 800   },
    { sku: 'Coca-Cola 354ml',      cat: 'Sin Alcohol',  system: 60, counted: 58, cost: 450   },
    { sku: 'Agua Mineral 500ml',   cat: 'Sin Alcohol',  system: 48, counted: 48, cost: 350   },
    { sku: 'Vasos descartables',   cat: 'Insumos',      system: 500, counted: 470, cost: 15  },
    { sku: 'Servilletas (paq)',     cat: 'Insumos',      system: 20, counted: 19, cost: 250   },
    { sku: 'Sorbetes (paq 100)',   cat: 'Insumos',      system: 12, counted: 12, cost: 180   },
  ];

  /* ── Rendición de Caja: Terminales ── */
  const cajaTerminals = [
    { name: 'CAJA 1',   systemCash: 420000, declaredCash: 418000, systemDigital: 185000, declaredDigital: 185000, withdrawals: 35000 },
    { name: 'CAJA 2',   systemCash: 380000, declaredCash: 380000, systemDigital: 210000, declaredDigital: 210000, withdrawals: 20000 },
    { name: 'CAJA VIP', systemCash: 290000, declaredCash: 288000, systemDigital: 320000, declaredDigital: 320000, withdrawals: 15000 },
    { name: 'BARRA 1',  systemCash: 65000,  declaredCash: 64500,  systemDigital: 95000,  declaredDigital: 95000,  withdrawals: 0     },
  ];

  /* ── Nómina / Devenciones ── */
  const nomina = [
    { area: 'Barra',      staff: 7,  total: 124000 },
    { area: 'Puerta',     staff: 7,  total: 99000  },
    { area: 'Caja',       staff: 2,  total: 30000  },
    { area: 'Producción', staff: 3,  total: 73000  },
    { area: 'Operativo',  staff: 3,  total: 32000  },
  ];

  /* ── Acceso / Passline + QR Propio ── */
  const acceso = {
    passlineSold: 450,
    passlineValidated: 423,
    boleteriaVendidos: 189,
    guardarropas: 85000,
    // QR Propio = cuenta ganado
    // Al escanear Passline → se entrega ticket con QR propio
    // Boletería → entrega mismo ticket con QR propio
    // Conciliación: QR escaneados = Passline validados + Boletería vendidos
    qrEscaneados: 608,  // should equal passlineValidated + boleteriaVendidos = 612
    qrExpected: 612,     // 423 + 189
  };

  /* ── Importaciones externas ── */
  const imports = [
    { source: 'GBOL Consumo',      status: 'synced',  lastSync: '04:12', records: 847, icon: 'GC' },
    { source: 'GBOL Fact. Electrónica', status: 'synced', lastSync: '04:12', records: 312, icon: 'GF' },
    { source: 'Passline',           status: 'synced',  lastSync: '03:58', records: 450, icon: 'PL' },
  ];

  /* ── Event Context ── */
  const currentEvent = {
    date: '2026-02-15',
    name: 'Noche Electrónica',
    status: 'ACTIVE',
    openedAt: '23:30',
    stockCountedAt: '03:45',
    stockCountedBy: 'Enc. Barra — Martín',
  };

  /* ── Historical Performance (últimas 8 noches) ── */
  const historicalPerformance = {
    labels: ['07/02', '08/02', '09/02', '10/02', '11/02', '12/02', '13/02', '14/02'],
    revenuePerCapita: [3200, 3500, 3800, 4100, 3900, 4200, 3700, 4000],
    stockPrecision:   [95.2, 96.1, 97.0, 96.5, 97.3, 96.8, 97.5, 97.1],
    cashDiffPct:      [-0.5, -0.3, -0.2, -0.4, -0.1, -0.3, -0.15, -0.2],
    mermaValorizada:  [42000, 38000, 28000, 35000, 22000, 31000, 25000, 29000],
    // Tonight's values (computed live, but fallback for sparkline)
    tonight: {
      revenuePerCapita: 4200,
      stockPrecision: 97.2,
      cashDiffPct: -0.17,
      mermaValorizada: 28400,
    }
  };

  /* ── Helpers ── */
  function formatCurrency(n) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    }).format(n);
  }

  function computeStockKPIs(items) {
    let totalDiffValue = 0;
    let totalSystemValue = 0;
    let itemsWithDiff = 0;

    items.forEach(function(i) {
      var diff = i.system - i.counted;
      totalDiffValue += diff * i.cost;
      totalSystemValue += i.system * i.cost;
      if (diff !== 0) itemsWithDiff++;
    });

    var precision = totalSystemValue > 0
      ? Math.round((1 - Math.abs(totalDiffValue) / totalSystemValue) * 100)
      : 100;

    return { totalDiffValue: totalDiffValue, totalSystemValue: totalSystemValue, itemsWithDiff: itemsWithDiff, precision: precision };
  }

  function computeCajaKPIs(terminals) {
    let totalSystem = 0, totalDeclared = 0, totalDigSystem = 0, totalDigDeclared = 0, totalWithdrawals = 0;

    terminals.forEach(function(t) {
      totalSystem += t.systemCash;
      totalDeclared += t.declaredCash;
      totalDigSystem += t.systemDigital;
      totalDigDeclared += t.declaredDigital;
      totalWithdrawals += t.withdrawals;
    });

    return {
      totalSystem: totalSystem, totalDeclared: totalDeclared,
      totalDigSystem: totalDigSystem, totalDigDeclared: totalDigDeclared,
      totalWithdrawals: totalWithdrawals,
      diffCash: totalDeclared - totalSystem,
      diffDigital: totalDigDeclared - totalDigSystem,
      totalRevenue: totalSystem + totalDigSystem,
    };
  }

  /* ── Export ── */
  export {
    stockCategories,
    stockAudit,
    cajaTerminals,
    nomina,
    acceso,
    imports,
    currentEvent,
    historicalPerformance,
    formatCurrency,
    computeStockKPIs,
    computeCajaKPIs,
  };
