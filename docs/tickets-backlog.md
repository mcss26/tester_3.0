# Tickets Backlog — Simulación Operativa

> Observaciones no-bloqueantes detectadas durante la prueba en vivo.

| #   | Descripción                                                                                                                                                                                                                                                                                                                       | Origen     | Prioridad | Estado    |
| :-- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :-------- | :-------- |
| 1   | **Stock difiere entre operativo-stock y admin-central-stock.** Ambos usan `vw_stock_global` pero admin también consulta `master_sku` directo + `consumption_reports`. La vista incluye SKUs inactivos (active=false) — operativo probablemente no filtra `activo=true`. Admin muestra 58 SKUs, operativo podría filtrar distinto. | Simulación | Media     | Pendiente |
