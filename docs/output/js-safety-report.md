# JS Safety Report

> Generated: 2026-02-22
> Scanner: `scripts/audit-js-safety.js`

## Summary

| Category | Count | Risk |
|:--|--:|:--|
| 🔴 Fire-and-forget mutations | 4 | Silent data loss |
| 🔴 Silent catches | 9 | Hidden errors |
| 🟡 .single() usage | 36 | PGRST116 risk |
| 🟡 Uncleaned intervals | 5 | Memory leak |
| **Total findings** | **54** | |

**Safety Score: 87/100** (64 files scanned)

---

## Findings by File

### `assets/js/modules/admin/admin-workdays.js` (7 findings)

**🔴 Fire-and-forget mutations:**
- L1244: `await window.sb.rpc("rpc_open_work_day", {`

**🟡 .single() usage:**
- L1062: `.single();`
- L1459: `.single();`
- L1496: `.single();`
- L1514: `.single();`
- L1588: `.single();`

**🟡 Uncleaned intervals:**
- L2041: `pollingTimer = setInterval(pollKPIs, POLL_INTERVAL_MS);` (missing: beforeunload listener)

### `assets/js/modules/operativo/scanner.js` (5 findings)

**🔴 Silent catches:**
- L140: `} catch (e) { /* ignore */ }`
- L149: `} catch (e) { /* ignore */ }`

**🟡 .single() usage:**
- L21: `.single();`
- L185: `.single();`
- L220: `.single();`

### `assets/js/modules/logistica/logistica-recepcion.js` (4 findings)

**🟡 .single() usage:**
- L407: `.single();`
- L449: `.single();`
- L561: `.single();`
- L598: `.single();`

### `assets/js/modules/operativo/scanner-mock.js` (4 findings)

**🔴 Silent catches:**
- L155: `} catch (err) { console.warn('Wake lock failed:', err); }`
- L484: `} catch { /* ignore */ }`
- L501: `} catch { /* ignore */ }`
- L515: `} catch { /* ignore */ }`

### `assets/js/modules/staff/staff-caja-index.js` (4 findings)

**🔴 Silent catches:**
- L505: `} catch { /* Silent */ }`

**🟡 .single() usage:**
- L178: `.single();`
- L231: `.single();`
- L503: `.from('profiles').select('full_name').eq('id', state.currentUser.id).single();`

### `assets/js/modules/admin/admin-index.js` (3 findings)

**🟡 .single() usage:**
- L49: `.single();`

**🟡 Uncleaned intervals:**
- L129: `intervals.push(setInterval(fetchQrCount, 30000));` (missing: clearInterval)
- L174: `intervals.push(setInterval(fetchMcoStats, 60000));` (missing: clearInterval)

### `assets/js/modules/admin/admin-pagos.js` (3 findings)

**🔴 Fire-and-forget mutations:**
- L1044: `await window.sb.rpc('admin_mark_payment_done', {`

**🟡 .single() usage:**
- L1001: `const { data: p } = await window.sb.from('finance_payments').select('*').eq('id', id).single();`
- L1042: `const { data: p } = await window.sb.from('finance_payments').select('amount_total').eq('id', singID).single();`

### `assets/js/modules/operativo/operativo-solicitudes.js` (3 findings)

**🟡 .single() usage:**
- L103: `.single();`
- L389: `.single();`
- L604: `.single();`

### `assets/js/core/error-logger.js` (2 findings)

**🔴 Fire-and-forget mutations:**
- L69: `await sb.from('error_log').insert({`

**🔴 Silent catches:**
- L76: `} catch (_ignored) {`

### `assets/js/modules/admin/admin-central-stock.js` (2 findings)

**🟡 .single() usage:**
- L1702: `.select().single();`
- L1753: `.select().single();`

### `assets/js/modules/admin/qr-generator.js` (2 findings)

**🟡 .single() usage:**
- L243: `.single();`

**🟡 Uncleaned intervals:**
- L16: `const iv = setInterval(() => {` (missing: beforeunload listener)

### `assets/js/modules/encargados/encargado-barra-noche.js` (2 findings)

**🟡 .single() usage:**
- L233: `.single();`
- L414: `.single();`

### `assets/js/modules/operativo/operativo-analisis.js` (2 findings)

**🔴 Silent catches:**
- L432: `} catch (err) {`

**🟡 .single() usage:**
- L393: `.single();`

### `assets/js/core/auth.js` (1 findings)

**🟡 .single() usage:**
- L120: `.single();`

### `assets/js/core/gbol-service.js` (1 findings)

**🔴 Fire-and-forget mutations:**
- L139: `await window.sb.from('gbol_sync_log').insert({`

### `assets/js/core/navigation-debug.js` (1 findings)

**🟡 Uncleaned intervals:**
- L49: `this.timer = setInterval(() => this.updateContent(), 1000);` (missing: beforeunload listener)

### `assets/js/core/work-day-helper.js` (1 findings)

**🟡 .single() usage:**
- L71: `.single();`

### `assets/js/modules/admin/admin-semanal.js` (1 findings)

**🟡 .single() usage:**
- L108: `const { data: live } = await window.sb.from('vw_financial_week_live').select('*').eq('week_start', weekStart).single();`

### `assets/js/modules/encargados/encargado-barra-index.js` (1 findings)

**🟡 .single() usage:**
- L48: `.single();`

### `assets/js/modules/encargados/encargado-barra-personal.js` (1 findings)

**🟡 .single() usage:**
- L324: `.single();`

### `assets/js/modules/encargados/encargado-caja-index.js` (1 findings)

**🟡 .single() usage:**
- L41: `.single();`

### `assets/js/modules/encargados/encargado-caja-noche.js` (1 findings)

**🟡 .single() usage:**
- L293: `.single();`

### `assets/js/modules/encargados/encargado-caja-personal.js` (1 findings)

**🟡 .single() usage:**
- L162: `.single();`

### `assets/js/modules/staff/staff-barra-index.js` (1 findings)

**🟡 .single() usage:**
- L39: `.single();`
