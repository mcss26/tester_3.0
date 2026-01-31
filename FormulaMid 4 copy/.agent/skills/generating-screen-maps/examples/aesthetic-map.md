# Ejemplo de Mapa Estético

Este es un ejemplo de cómo debe lucir un mapa de pantallas generado por este skill.

```mermaid
graph TD
    %% Nodos Principales
    Portal[Portal Central <br/> <small>index.html</small>]
    
    subgraph SG_ADM [Panel Administración]
        A_IDX[Dashboard <br/> <small>Métricas Globales</small>]
        A_STK[Control Stock <br/> <small>Cruce GBol/Ideal</small>]
        A_CIE[Cierres <br/> <small>Conciliación Fiscal</small>]
    end

    subgraph SG_STA [Operación Staff]
        S_CAJ[Caja Registradora <br/> <small>Ventas POS</small>]
        S_BAR[Barra <br/> <small>Pedidos Runners</small>]
    end

    %% Conexiones
    Portal -->|Role: Admin| A_IDX
    Portal -->|Role: Staff| S_CAJ
    A_IDX --> A_STK
    A_IDX --> A_CIE
    S_CAJ -.->|Validación| A_CIE

    %% Estilos
    class Portal default;
    class A_IDX,A_STK,A_CIE admin;
    class S_CAJ,S_BAR staff;

    classDef default fill:#1a1b1e,stroke:#333,color:#a9b1d6,stroke-width:1px;
    classDef admin fill:#1e293b,stroke:#3b82f6,color:#eff6ff,stroke-width:2px;
    classDef staff fill:#1e293b,stroke:#1e1b4b,stroke:#f59e0b,color:#fffbeb,stroke-width:2px;
```

## Características de este diseño:
1.  **Subgrafos**: Agrupan visualmente por contexto.
2.  **Etiquetas de Línea**: Explican la transición (`Role: Admin`).
3.  **Diferenciación de Estilo**: El color del borde y fondo indica el rol.
4.  **Meta-información**: El uso de `<small>` permite incluir el nombre del archivo sin ensuciar el nombre funcional de la pantalla.
