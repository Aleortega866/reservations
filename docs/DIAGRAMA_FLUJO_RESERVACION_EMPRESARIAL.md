# Diagrama de Flujo - Reservación Empresarial

## Diagrama Principal

```mermaid
flowchart TD
    A["Usuario accede a /reservations"] --> B{"Hay reservacion existente?"}
    
    B -->|Si| C["Cargar reservacion existente"]
    B -->|No| D["Inicializar nueva reservacion"]
    
    C --> E["EmpresarialForm.vue"]
    D --> E
    
    E --> F["ReservationStepHeader.vue"]
    F --> G["Configurar listeners de eventos"]
    G --> H["Cargar estado de pasos"]
    
    H --> I{"Que paso mostrar?"}
    
    I -->|Paso 1| J["ReservationStep1.vue<br/>Datos basicos"]
    I -->|Paso 2| K["ReservationStep2.vue<br/>Informacion detallada"]
    I -->|Paso 3| L["ReservationStep3.vue<br/>Finalizacion"]
    
    J --> M["Usuario llena formulario"]
    K --> M
    L --> M
    
    M --> N["Usuario envia formulario"]
    N --> O["mapFormDataToApiRequest"]
    O --> P["store.updateFormData"]
    P --> Q["API Call"]
    
    Q --> R{"API exitosa?"}
    
    R -->|Error| S["Mostrar error"]
    R -->|Exito| T["Emitir evento de guardado"]
    
    S --> M
    T --> U["ReservationStepHeader escucha evento"]
    U --> V["Marcar paso como completo"]
    V --> W["Recargar estado de pasos"]
    W --> X["Actualizar UI"]
    
    X --> Y{"Es el ultimo paso?"}
    
    Y -->|No| Z["Habilitar boton Siguiente Paso"]
    Y -->|Si| AA["Reservacion completada"]
    
    Z --> I
    AA --> BB["Redirigir a lista de reservaciones"]
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style F fill:#e8f5e8
    style J fill:#fff3e0
    style K fill:#fff3e0
    style L fill:#fff3e0
    style T fill:#e8f5e8
    style V fill:#e8f5e8
    style AA fill:#c8e6c9
```

## Diagrama de Estados de Pasos

```mermaid
stateDiagram-v2
    [*] --> Paso1: Inicializacion
    
    Paso1 --> Paso1Completo: Datos validos
    Paso1Completo --> Paso2: Usuario navega
    Paso1Completo --> Paso1: Usuario edita
    
    Paso2 --> Paso2Completo: Datos validos
    Paso2Completo --> Paso3: Usuario navega
    Paso2Completo --> Paso2: Usuario edita
    Paso2Completo --> Paso1: Usuario navega atras
    
    Paso3 --> Paso3Completo: Datos validos
    Paso3Completo --> [*]: Reservacion completada
    Paso3Completo --> Paso3: Usuario edita
    Paso3Completo --> Paso2: Usuario navega atras
    
    state Paso1 {
        [*] --> Cargando
        Cargando --> Formulario: Datos cargados
        Formulario --> Validando: Usuario envia
        Validando --> Formulario: Error
        Validando --> [*]: Exito
    }
    
    state Paso2 {
        [*] --> Cargando
        Cargando --> Formulario: Datos cargados
        Formulario --> Validando: Usuario envia
        Validando --> Formulario: Error
        Validando --> [*]: Exito
    }
    
    state Paso3 {
        [*] --> Cargando
        Cargando --> Formulario: Datos cargados
        Formulario --> Validando: Usuario envia
        Validando --> Formulario: Error
        Validando --> [*]: Exito
    }
```

## Diagrama de Componentes

```mermaid
graph TB
    subgraph "Paginas"
        A[formulario-reservacion.vue]
    end
    
    subgraph "Componentes"
        B[ReservationStepHeader.vue]
        C[EmpresarialForm.vue]
        D[ReservationStep1.vue]
        E[ReservationStep2.vue]
        F[ReservationStep3.vue]
    end
    
    subgraph "Stores"
        G[reservation-form.ts]
        H[reservation-company.ts]
        I[reservation-step-status.ts]
    end
    
    subgraph "Composables"
        J[useReservationCompany.ts]
        K[useStepSaveEvents.ts]
        L[useReservationStepLoader.ts]
    end
    
    subgraph "API"
        M[API Endpoints]
        N[useApiFetch]
        O[useApiPost]
    end
    
    A --> B
    A --> C
    C --> D
    C --> E
    C --> F
    
    B --> I
    C --> G
    D --> H
    E --> H
    F --> H
    
    D --> J
    E --> J
    F --> J
    
    J --> K
    J --> L
    
    J --> M
    L --> N
    L --> O
    
    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#f3e5f5
    style D fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#fce4ec
    style H fill:#fce4ec
    style I fill:#fce4ec
    style J fill:#e0f2f1
    style K fill:#e0f2f1
    style L fill:#e0f2f1
```

## Diagrama de Eventos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Formulario
    participant C as Composable
    participant A as API
    participant H as Header
    participant S as Store
    
    U->>F: Llena formulario
    U->>F: Envia formulario
    F->>C: handleSubmit()
    C->>C: mapFormDataToApiRequest()
    C->>S: updateFormData()
    C->>A: updateReservationStep2()
    
    A-->>C: Respuesta exitosa
    C->>C: emitStep2Saved()
    C-->>U: Toast de exito
    
    Note over H: Evento recibido
    H->>H: handleStepSaved()
    H->>S: markStepComplete()
    H->>H: forceReloadAllSteps()
    H-->>U: UI actualizada
```

## Diagrama de Validacion

```mermaid
flowchart TD
    A["Datos del paso llegan del API"] --> B["isStepDataComplete"]
    
    B --> C{"Tipo empresarial?"}
    C -->|Si| D["Validacion empresarial"]
    C -->|No| E["Validacion estandar"]
    
    D --> F["Campos basicos:<br/>fullName, email, phone"]
    D --> G["Campos booleanos:<br/>isReservationPersonAlsoResponsible<br/>isResponsibleNotAssigned"]
    D --> H["Arrays opcionales:<br/>mainEconomicConceptIds<br/>secondaryEconomicConceptIds<br/>specialAssistanceIds<br/>positionTypeIds<br/>ageRangeIds"]
    
    E --> I["Validacion por configuracion"]
    
    F --> J["validateFields"]
    G --> J
    H --> J
    I --> J
    
    J --> K["validateField para cada campo"]
    
    K --> L{"Tipo de campo?"}
    
    L -->|Basico| M["No null, undefined, vacio"]
    L -->|Contacto| N["No null, undefined, vacio"]
    L -->|Fecha| O["No null, undefined, vacio"]
    L -->|ID| P["No null, undefined, vacio"]
    L -->|Costo| Q["No null, undefined"]
    L -->|Boolean| R["No null, undefined"]
    L -->|Array| S["Es array, puede estar vacio"]
    
    M --> T["Resultado final"]
    N --> T
    O --> T
    P --> T
    Q --> T
    R --> T
    S --> T
    
    T --> U{"Todos los campos validos?"}
    U -->|Si| V["Paso completo"]
    U -->|No| W["Paso incompleto"]
    
    style A fill:#e1f5fe
    style V fill:#c8e6c9
    style W fill:#ffcdd2
```

## Diagrama de Flujo de Guardado

```mermaid
flowchart LR
    A["Usuario envia"] --> B["Transformar datos"]
    B --> C["Actualizar store"]
    C --> D["Llamar API"]
    D --> E{"Exito?"}
    
    E -->|Error| F["Mostrar error"]
    E -->|Exito| G["Emitir evento"]
    
    F --> A
    G --> H["Header escucha"]
    H --> I["Marcar completo"]
    I --> J["Recargar estado"]
    J --> K["Actualizar UI"]
    K --> L["Habilitar siguiente"]
    
    style A fill:#e1f5fe
    style G fill:#e8f5e8
    style I fill:#e8f5e8
    style K fill:#e8f5e8
    style F fill:#ffcdd2
```

## Diagrama de Responsive

```mermaid
flowchart TD
    A["Dispositivo"] --> B{"Tamano pantalla?"}
    
    B -->|Desktop| C["Layout horizontal"]
    B -->|Mobile| D["Layout vertical"]
    
    C --> E["Header con navegacion horizontal"]
    C --> F["Formulario en una columna"]
    C --> G["Botones de debug visibles"]
    
    D --> H["Header compacto"]
    D --> I["Formulario adaptativo"]
    D --> J["Botones tactiles"]
    
    E --> K["UI Final"]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    style A fill:#e1f5fe
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style K fill:#f3e5f5
```

---

## Como Visualizar los Diagramas

### Opciones para ver los diagramas:

1. **GitHub**: Los diagramas Mermaid se renderizan automaticamente
2. **VS Code**: Instala la extension "Mermaid Preview"
3. **Online**: Usa [mermaid.live](https://mermaid.live)
4. **Documentacion**: Copia el codigo Mermaid en cualquier editor compatible

### Para editar los diagramas:

1. Modifica el codigo Mermaid en este archivo
2. Los diagramas se actualizaran automaticamente
3. Puedes agregar nuevos diagramas siguiendo la sintaxis Mermaid

---

Estos diagramas muestran visualmente todo el flujo de una reservacion empresarial, desde la inicializacion hasta la finalizacion, incluyendo la arquitectura de componentes, eventos, validacion y estados.
