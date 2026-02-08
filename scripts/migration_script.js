const fs = require('fs');

// DATA FROM STEPS 223 and 224
const master = [
  {"id":"a0a08710-5239-4d6f-bbf7-ba96f26b1e8c","nombre_fantasia":"Distribuidora Energy","cuit":"30112233445"},
  {"id":"f1b34181-60b5-453b-94c4-88fefb1f5495","nombre_fantasia":"CAP (SINDICATO)","cuit":"20306383168"},
  {"id":"e1f6d21d-37f9-45d2-ad4d-b90c0d29ffe5","nombre_fantasia":"MILENIUM","cuit":"30700102005"},
  {"id":"db69a4ae-518c-473d-a0c9-e1e04184fc53","nombre_fantasia":"INSTAGRAM - META VERIFIED","cuit":null},
  {"id":"d35b5c7a-a831-4170-b75c-adeaffe78cac","nombre_fantasia":"ADICIONALES - PPS","cuit":"30999284651"},
  {"id":"cc0118b4-c44c-4a30-a1c0-2991290f9598","nombre_fantasia":"BADIE S.A.","cuit":"30717233138"},
  {"id":"ca4bf565-03be-45ce-9fa7-a3cbb656c7e4","nombre_fantasia":"THENON NICOLAS","cuit":null},
  {"id":"c6d7a3f1-6de8-4419-9bac-7521d71f9353","nombre_fantasia":"ESTUDIO CONTABLE","cuit":"27354824863"},
  {"id":"c0dd3078-e8d1-4a06-b53a-af779744e68f","nombre_fantasia":"SALTA REFRESCOS S.A.","cuit":"30518408689"},
  {"id":"b6f030b0-28d6-4252-b8c9-c28e155ac1a9","nombre_fantasia":"MAYORISTA YAGUAR","cuit":null},
  {"id":"b5981171-baa2-4c9c-a6c1-6854b3ea6dc0","nombre_fantasia":"EDESA (LUZ)","cuit":null},
  {"id":"ab1eed7c-3596-455b-afda-fdb07cd51f2a","nombre_fantasia":"SADAIC","cuit":"33525688939"},
  {"id":"a78240d4-a7d3-4423-86fd-f1da02d26aad","nombre_fantasia":"DAMESCO S.A.","cuit":"30700082101"},
  {"id":"a2658669-1c56-46f6-bf73-588f0f90a391","nombre_fantasia":"PETIT PLAST","cuit":"30614665149"},
  {"id":"9d671941-c6b2-4dc8-99f3-de2769f8a8b8","nombre_fantasia":"CABINA 360","cuit":null},
  {"id":"9873f053-72f7-4ace-9d90-24fb7350acc2","nombre_fantasia":"ZOCO","cuit":"30716009362"},
  {"id":"95190466-fadd-4a04-ad94-27ba01116c90","nombre_fantasia":"CLARO","cuit":"30687686171"},
  {"id":"91e9f029-3665-4081-9d87-b32e768651aa","nombre_fantasia":"LS GRUPONOA","cuit":"30718688368"},
  {"id":"908cb826-e03a-4a3c-ab9e-62e6837d8913","nombre_fantasia":"FUMIGACIÓN","cuit":"20301864923"},
  {"id":"7ea28699-cd31-4890-8d06-5804c8b48976","nombre_fantasia":"DISTRIBUIDORA DEL NORTE","cuit":"20290923515"},
  {"id":"7a6f4460-ad31-4d6d-8c4a-84bbdcbd3118","nombre_fantasia":"OCASA (AZUCAR)","cuit":"30538819256"},
  {"id":"6b701c1b-6b8b-4f50-a43a-4a2879899db2","nombre_fantasia":"DOLCE MARTINA","cuit":"27288871812"},
  {"id":"681481a1-c59b-4f71-acc0-72673de459b7","nombre_fantasia":"LA CORDOBESA","cuit":"27129998941"},
  {"id":"5ca5d87d-49d4-4247-b2a0-6acf6c4a62b8","nombre_fantasia":"G BOL (SISTEMA)","cuit":"30717776921"},
  {"id":"52ab9498-b8be-4eb1-94af-5829425946af","nombre_fantasia":"JAPOS DESCARTABLES","cuit":"20319486349"},
  {"id":"4f980116-b5f5-4661-94a3-c1242d8628cd","nombre_fantasia":"ATLANTA PRODUCCIONES SRL","cuit":"30718847067"},
  {"id":"49e161aa-0a07-483f-819f-8b64254747ee","nombre_fantasia":"PETIT PLAST","cuit":"33715472649"},
  {"id":"4859606f-4437-4d05-9c69-87c5aec6ab2c","nombre_fantasia":"SUPERMERCADO MAYORISTA MAKRO S.A.","cuit":"30589621499"},
  {"id":"3f147335-dd3b-4c45-b9c5-7a721ef3d94b","nombre_fantasia":"MEDICEM (ART/SALUD)","cuit":"30709233978"},
  {"id":"2f0061dc-db50-408a-9c36-aa37cb78368f","nombre_fantasia":"ESTUDIO CONTABLE","cuit":"23351071524"},
  {"id":"247d6c90-d036-41ae-8e88-535c84a1be38","nombre_fantasia":"DISTRUBUIDORA ENERGY NORTE SRL","cuit":"30712476539"},
  {"id":"215defcd-6710-46d5-9e41-c662d6705d2f","nombre_fantasia":"NATURGY (GAS)","cuit":null},
  {"id":"1735bc84-90ba-42ac-b731-2c5ffc2bd5aa","nombre_fantasia":"VIATICOS - INOVACION Y DESARROLLO","cuit":null},
  {"id":"0d4523d5-7dbf-4977-9338-1297aca338c5","nombre_fantasia":"I+D / DESARROLLO","cuit":null},
  {"id":"0562466c-e8da-41e0-8db4-df6585a119e2","nombre_fantasia":"ALQUILER INMUEBLE","cuit":"20081761079"},
  {"id":"01bda0c4-13c7-47bd-a548-3c955492a1dd","nombre_fantasia":"CABLE EXPRESS (INTERNET)","cuit":null},
  {"id":"0179ad96-1f02-4d32-9b6c-2479c3d63b31","nombre_fantasia":"EL NORTE SEGUROS","cuit":"30500040455"},
  {"id":"0c2c98cd-010f-439c-9efd-1ae70bf4bfdf","nombre_fantasia":"AADICAPIF","cuit":"30574449967"}
];

const suppliers = [
  {"id":"0edc14b6-56ca-4cb4-a78b-a79521b2c47c","name":"Edesa","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"OPEX"},
  {"id":"c65171f9-eb23-4ab8-8d2d-6ac737089b57","name":"Cable Express","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"OPEX"},
  {"id":"dbabbe1d-abb7-4999-97da-332b7d10cd72","name":"Gbol","cuit":"30717776921","bank":"SANTANDER","cbu":"0720043420000002874168","alias":"hpdevs.santander","category":"OPEX"},
  {"id":"7a5c334b-944c-46f6-ac8c-c0164fa64c19","name":"Naturgy","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"OPEX"},
  {"id":"6d89690f-ec3a-4926-9986-9f6f4811a461","name":"Meta (Instagram)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"OPEX"},
  {"id":"7ad9153c-0b34-4f97-b367-625c8ed4b802","name":"Taplink","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"OPEX"},
  {"id":"a29bcecf-bb3f-4ef6-bdbb-e888e0724e8e","name":"Zocco - Karina (POSNET)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"OPEX"},
  {"id":"e0b9ca07-09a4-4c81-9566-60fbf73ecdef","name":"PPS (Adicionales)","cuit":"30999284651","bank":"MACRO","cbu":"2850100630000430133379","alias":null,"category":"L&D"},
  {"id":"7dd5c250-6a4d-4f19-94a9-92159f0e7aa1","name":"SADAIC - Luciano","cuit":null,"bank":"SANTANDER","cbu":null,"alias":"SADAICsede12444","category":"L&D"},
  {"id":"3e41319a-0cb4-4fc5-8fb2-f8a5dd914f30","name":"AADICAPIF - Carolina","cuit":null,"bank":"GALICIA","cbu":null,"alias":"aadicapif1975","category":"L&D"},
  {"id":"b2eca754-455d-40b8-ab80-fe8bc1d90bf4","name":"Mateo Marinakos (G.A.)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"G&A"},
  {"id":"beef6111-3e4c-4159-b39a-d40d4392c0a5","name":"Cristian Navarro (G.O.)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"G&A"},
  {"id":"ac886cc6-01ea-4af5-8c7c-bb25ad92c885","name":"Daniel Valdez (I+D)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"G&A"},
  {"id":"ac39305f-f49f-4772-aada-4444a83cd046","name":"Nayra Torrez (Contab.)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"G&A"},
  {"id":"05a48354-acca-429c-b6bc-2382be820be0","name":"Gabriela Heredia (Contab.)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"G&A"},
  {"id":"0813642d-1d5d-4b61-82aa-ef3990065717","name":"El Norte Seguros","cuit":"30500040455","bank":"MACRO","cbu":null,"alias":"elnorte.macro","category":"G&A"},
  {"id":"200093c7-21a6-45ba-8a0f-4c3231e23f0b","name":"Medisem - Jesica","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"G&A"},
  {"id":"bb697b84-0857-4987-b288-9aacdb68de07","name":"CAP (Sindicato)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"G&A"},
  {"id":"8e45d573-e703-4673-8b13-81cc14774ffb","name":"Ailen Astun (Marketing)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"G&A"},
  {"id":"28844625-a81b-4612-b34a-fb3675889e25","name":"LS. GROUP (Limpieza)","cuit":"30718688368","bank":"GALICIA","cbu":"0070173620000013511119","alias":null,"category":"COD"},
  {"id":"1e3192fd-b717-42b0-9898-5cd804d2c0ca","name":"Distribuidora Badie","cuit":"30717233138","bank":"MACRO","cbu":"2850127330094199319381","alias":"badiesa","category":"COGS"},
  {"id":"e04e6fce-b93d-4ddd-b5ae-0921ffc7079d","name":"Salta Refrescos","cuit":"30518408689","bank":"MACRO","cbu":"2850100630000000239579","alias":"soga.jueves.cobre","category":"COGS"},
  {"id":"c49844f4-166d-440e-b6a9-b6d4450ee440","name":"Japos Descartables","cuit":"20319486349","bank":"ALLARIA","cbu":null,"alias":"NTHENON.ALLARIA","category":"COGS"},
  {"id":"52c65b87-ec20-4877-9a2c-edf75828c4fa","name":"PETIT PLAST - LUCAS","cuit":"33715472649","bank":"MACRO","cbu":null,"alias":"petitplast.sa","category":"COGS"},
  {"id":"2d22c03b-8173-4d4c-b7a3-dd9e79a8aa2d","name":"MILLENIUM (Hielo)","cuit":"30700102005","bank":"ICBC","cbu":"0150830502000101375609","alias":"hielo.milenium","category":"COGS"},
  {"id":"1e002233-101e-4cc3-87e7-a85ab257614d","name":"DOLCE MARTINA","cuit":"27288871812","bank":"BBVA","cbu":null,"alias":"DOLCE.MARTINA29","category":"COGS"},
  {"id":"3ef7b5f9-e111-416e-a74d-612d2a494bd1","name":"Marcela (Técnica)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"TEC"},
  {"id":"f686836b-03e9-4f51-a32f-7a67d6947979","name":"Gaston Serra (Técnico)","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"TEC"},
  {"id":"e0a352c1-d86c-481f-a18e-6133a7e63f33","name":"OSSOLA","cuit":null,"bank":null,"cbu":null,"alias":null,"category":"CxP"}
];

function normalize(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/s\.a\./g, '').replace(/s\.r\.l\./g, '').replace(/\(.*\)/g, '').trim();
}

let sql = [];

// 1. Drop Constraint
sql.push(`ALTER TABLE cost_definitions DROP CONSTRAINT IF EXISTS cost_definitions_supplier_id_fkey;`);

// 2. Iterate Suppliers and Match
suppliers.forEach(sup => {
  let match = null;

  // Try CUIT match
  if (sup.cuit) {
    match = master.find(m => m.cuit === sup.cuit);
  }

  // Try Name match if no CUIT
  if (!match) {
    const nName = normalize(sup.name);
    match = master.find(m => normalize(m.nombre_fantasia) === nName);
  }

  if (match) {
    // UPDATE existing master with new info if missing
    let updates = [];
    if (sup.bank && !match.banco) updates.push(`banco = '${sup.bank}'`);
    // Fix duplicate cbu_alias assignment
    if (!match.cbu_alias) {
        if (sup.cbu) {
             updates.push(`cbu_alias = '${sup.cbu}'`);
        } else if (sup.alias) {
             updates.push(`cbu_alias = '${sup.alias}'`);
        }
    }
    if (sup.category && !match.category) updates.push(`category = '${sup.category}'`);
    
    // Explicitly set bank/aliascbu columns if they exist in master schema (checked earlier: banco, cbu_alias, cbu, alias)
    // Actually master has: banco, cbu_alias, cbu, alias.
    // Let's populate the specific columns too for future proofing
    if (sup.cbu && !match.cbu) updates.push(`cbu = '${sup.cbu}'`);
    if (sup.alias && !match.alias) updates.push(`alias = '${sup.alias}'`);

    if (updates.length > 0) {
      sql.push(`UPDATE master_proveedores SET ${updates.join(', ')} WHERE id = '${match.id}';`);
    }

    // Remap cost_definitions
    sql.push(`UPDATE cost_definitions SET supplier_id = '${match.id}' WHERE supplier_id = '${sup.id}';`);

  } else {
    // INSERT new record
    // We need a specific UUID for this new record so we can map it immediately
    // For simplicity in this script, we can generate a random UUID or let Postgres do it. 
    // BUT we need the ID for the constraint update. 
    // Trick: Use the OLD ID from suppliers! That ensures uniqueness and we don't need to update cost_definitions for these.
    // Wait, if we use the old ID, we don't need to update cost_definitions rows that point to it?
    // YES! If we insert into master_proveedores with the SAME ID as suppliers, the FK will just work (once re-added).
    
    // Check if ID collision is possible? unlikely with UUIDs.
    
    const insertCols = ['id', 'nombre_fantasia', 'active', 'created_at', 'updated_at'];
    const insertVals = [`'${sup.id}'`, `'${sup.name}'`, 'true', 'now()', 'now()'];

    if (sup.cuit) { insertCols.push('cuit'); insertVals.push(`'${sup.cuit}'`); }
    if (sup.bank) { insertCols.push('banco'); insertVals.push(`'${sup.bank}'`); }
    if (sup.cbu) { insertCols.push('cbu'); insertVals.push(`'${sup.cbu}'`); }
    if (sup.alias) { insertCols.push('alias'); insertVals.push(`'${sup.alias}'`); }
    // Map cbu_alias to whichever exists
    const combined = sup.cbu || sup.alias;
    if (combined) { insertCols.push('cbu_alias'); insertVals.push(`'${combined}'`); }
    if (sup.category) { insertCols.push('category'); insertVals.push(`'${sup.category}'`); }
    if (sup.phone) { insertCols.push('contacto_telefono'); insertVals.push(`'${sup.phone}'`); }

    sql.push(`INSERT INTO master_proveedores (${insertCols.join(', ')}) VALUES (${insertVals.join(', ')});`);
    
    // No need to update cost_definitions because the ID stays the same!
  }
});

// 3. Re-add Constraint
sql.push(`ALTER TABLE cost_definitions ADD CONSTRAINT cost_definitions_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES master_proveedores(id);`);

// 4. Drop old table
sql.push(`DROP TABLE suppliers;`);

fs.writeFileSync('migration.sql', sql.join('\\n'));
console.log('Migration SQL written to migration.sql');
