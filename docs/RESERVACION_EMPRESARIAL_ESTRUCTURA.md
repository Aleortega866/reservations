# 📊 Estructura y Flujo de Reservaciones Empresariales

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESERVACIONES EMPRESARIALES                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   PÁGINAS       │    │   COMPONENTES   │    │   STORES     │ │
│  │                 │    │                 │    │              │ │
│  │ • index.vue     │    │ • EmpresarialForm│    │ • reservation-│ │
│  │ • formulario-   │    │ • ReservationStep│    │   form.ts    │ │
│  │   reservacion   │    │   Header.vue    │    │ • reservation-│ │
│  │                 │    │ • ReservationStep│    │   company.ts │ │
│  │                 │    │   1,2,3.vue     │    │ • reservation-│ │
│  │                 │    │                 │    │   step-status│ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                       │     │
│           └───────────────────────┼───────────────────────┘     │
│                                   │                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   COMPOSABLES   │    │   SERVICIOS     │    │   UTILS      │ │
│  │                 │    │                 │    │              │ │
│  │ • useReservation│    │ • API Endpoints │    │ • useToast   │ │
│  │   Company.ts    │    │ • useApiFetch   │    │ • useError   │ │
│  │ • useStepLoader │    │ • useApiPost    │    │ • useStore   │ │
│  │ • useStepEvents │    │                 │    │   Cleanup    │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Navegación

```
┌─────────────────┐
│   /reservations │
│   (Lista)       │
└─────────┬───────┘
          │ "Ver Detalle"
          ▼
┌─────────────────┐
│ /reservations/  │
│ formulario-     │
│ reservacion     │
│ ?step=1         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ReservationStep │
│ Header.vue      │
│ (Navegación)    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ EmpresarialForm │
│ (Contenedor)    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ReservationStep │
│ 1, 2, o 3.vue   │
│ (Formulario)    │
└─────────────────┘
```

## 📋 Estructura de Archivos

### 🗂️ Páginas
```
pages/reservations/
├── index.vue                    # Lista de reservaciones
└── formulario-reservacion.vue   # Página principal del formulario
```

### 🧩 Componentes
```
components/reservations/
├── ReservationStepHeader.vue           # Header con navegación de pasos
├── formtypes/
│   └── empresarial/
│       ├── EmpresarialForm.vue         # Contenedor del formulario empresarial
│       └── steps/
│           ├── ReservationStep1.vue    # Paso 1: Datos básicos
│           ├── ReservationStep2.vue    # Paso 2: Información detallada
│           └── ReservationStep3.vue    # Paso 3: Finalización
```

### 🏪 Stores (Pinia)
```
stores/
├── reservation-form.ts          # Store principal de formulario
├── reservation-company.ts       # Store específico empresarial
└── reservation-step-status.ts   # Store de estado de pasos
```

### 🔧 Composables
```
composables/reservations/
├── useReservationCompany.ts     # Lógica empresarial
├── useReservationStepLoader.ts  # Cargador de pasos
├── useReservationStepIntegration.ts # Integración de pasos
└── useStepSaveEvents.ts         # Eventos de guardado
```

## 🎯 Flujo de Datos Detallado

### 1️⃣ **Inicialización**
```
Usuario accede a /reservations/formulario-reservacion
    ↓
formulario-reservacion.vue se monta
    ↓
onMounted() ejecuta:
    - loadExistingReservation() si hay ID
    - reservationFormStore.initializeNewSession() si es nuevo
    ↓
ReservationStepHeader.vue se monta
    ↓
setupStepSaveListeners() configura eventos
    ↓
loadStepsIfNeeded() carga estado de pasos
```

### 2️⃣ **Navegación entre Pasos**
```
Usuario hace clic en paso
    ↓
ReservationStepHeader emite "step-click"
    ↓
EmpresarialForm.vue escucha evento
    ↓
Cambia currentStep
    ↓
Renderiza ReservationStep correspondiente
```

### 3️⃣ **Guardado de Paso**
```
Usuario envía formulario
    ↓
ReservationStep2.vue ejecuta handleSubmit
    ↓
mapFormDataToApiRequest() transforma datos
    ↓
store.updateFormData() actualiza store local
    ↓
updateReservationStep2() llama API
    ↓
useReservationCompany.ts ejecuta:
    - store.updateReservationStep2()
    - showSuccess() toast
    - emitStep2Saved() evento
    ↓
ReservationStepHeader escucha evento
    ↓
markStepCompleteImmediately() marca como completo
    ↓
forceReloadAllStepsComposable() recarga estado
    ↓
UI se actualiza con ✅
```

## 🔧 Funciones Principales

### 📄 **ReservationStepHeader.vue**
```typescript
// Navegación
goToNextStep()           // Ir al siguiente paso
goToPreviousStep()       // Ir al paso anterior
getStepVisualState()     // Estado visual del paso

// Carga de datos
loadStepsIfNeeded()      // Cargar pasos si es necesario
forceReloadAllSteps()    // Forzar recarga de pasos

// Eventos
setupStepSaveListeners() // Configurar listeners
handleStepSaved()        // Manejar guardado exitoso
markStepCompleteImmediately() // Marcar como completo
```

### 🏢 **EmpresarialForm.vue**
```typescript
// Gestión de pasos
currentStep              // Paso actual (1, 2, 3)
handleStepClick()        // Manejar clic en paso
canNavigateToStep()      // Verificar si puede navegar

// Renderizado
getCurrentStepComponent() // Obtener componente del paso
```

### 📝 **ReservationStep2.vue**
```typescript
// Formulario
handleSubmit()           // Manejar envío
mapFormDataToApiRequest() // Transformar datos
validateForm()           // Validar formulario

// API
updateReservationStep2() // Actualizar paso 2
```

### 🏪 **useReservationCompany.ts**
```typescript
// CRUD
createReservationStep1() // Crear paso 1
updateReservationStep2() // Actualizar paso 2
updateReservationStep3() // Actualizar paso 3

// Eventos
emitStep1Saved()         // Emitir evento paso 1
emitStep2Saved()         // Emitir evento paso 2
emitStep3Saved()         // Emitir evento paso 3

// Utilidades
loadStep1()              // Cargar datos paso 1
loadStep2()              // Cargar datos paso 2
```

### 🏪 **reservation-step-status.ts**
```typescript
// Estado
stepStatus               // Estado de cada paso
currentReservationId     // ID de reservación actual
currentAttendeeType      // Tipo de asistente

// Validación
isStepDataComplete()     // Verificar si paso está completo
validateFields()         // Validar campos
validateField()          // Validar campo individual

// Gestión
markStepComplete()       // Marcar paso como completo
markStepIncomplete()     // Marcar paso como incompleto
loadAllStepsStatus()     // Cargar estado de todos los pasos
```

## 🎨 Estados Visuales

### 🟢 **Paso Completo**
- Fondo: `bg-green-100`
- Texto: `text-green-800`
- Ícono: ✅ (check)
- Navegación: Habilitada

### 🔵 **Paso Disponible**
- Fondo: `bg-blue-100`
- Texto: `text-blue-800`
- Ícono: Número del paso
- Navegación: Habilitada

### ⚪ **Paso Bloqueado**
- Fondo: `bg-gray-100`
- Texto: `text-gray-500`
- Ícono: Número del paso
- Navegación: Deshabilitada

## 🔄 Eventos del Sistema

### 📡 **Eventos Emitidos**
```typescript
// ReservationStepHeader
"step-click"             // Clic en paso
"step-completed"         // Paso completado
"steps-loaded"           // Pasos cargados

// useStepSaveEvents
"reservation-step-saved" // Paso guardado (global)
"reservation-empresarial-step-saved" // Paso empresarial guardado
```

### 🎧 **Eventos Escuchados**
```typescript
// ReservationStepHeader escucha:
"reservation-step-saved"
"reservation-empresarial-step-saved"
"reservation-general-step-saved"
"reservation-summer-course-step-saved"
"reservation-escolar-step-saved"
```

## 🛡️ Validación de Pasos

### ✅ **Paso 1 - Datos Básicos**
```typescript
required: ['reservationDate', 'visitObjectiveId']
```

### ✅ **Paso 2 - Información Detallada**
```typescript
required: [
  'fullName', 
  'email', 
  'phone', 
  'isReservationPersonAlsoResponsible', 
  'isResponsibleNotAssigned'
]
optional: [
  'mainEconomicConceptIds',      // Puede estar vacío []
  'secondaryEconomicConceptIds', // Puede estar vacío []
  'specialAssistanceIds',        // Puede estar vacío []
  'positionTypeIds',             // Puede estar vacío []
  'ageRangeIds'                  // Puede estar vacío []
]
```

### ✅ **Paso 3 - Finalización**
```typescript
required: ['paymentMethodId', 'totalCost']
```

## 🚀 Flujo de Guardado Exitoso

```
1. Usuario envía formulario
   ↓
2. API responde exitosamente
   ↓
3. useReservationCompany emite evento
   ↓
4. ReservationStepHeader escucha evento
   ↓
5. Verifica que es la misma reservación
   ↓
6. Marca paso como completo inmediatamente
   ↓
7. Recarga estado de todos los pasos
   ↓
8. UI se actualiza con ✅
   ↓
9. Botón "Siguiente Paso" se habilita
```

## 🔧 Debug y Logging

### 📊 **Información de Debug**
```typescript
// ReservationStepHeader muestra:
- currentReservationId
- currentAttendeeType
- completedStepsCount
- areAllStepsComplete
- stepStatus (estado de cada paso)
```

### 🎯 **Logs Importantes**
```typescript
console.log('🎧 Configurando listeners de guardado de pasos...')
console.log('🎉 Paso guardado exitosamente:', { step, attendeeType, reservationId })
console.log('✅ Marcando paso X como completo inmediatamente')
console.log('🔍 Validación empresarial paso 2:', { basicFieldsComplete, booleanFieldsComplete })
```

## 📱 Responsive y UX

### 🖥️ **Desktop**
- Header con navegación horizontal
- Formulario en una columna
- Botones de debug visibles

### 📱 **Mobile**
- Header compacto
- Formulario adaptativo
- Botones de navegación táctiles

---

## 🎯 Resumen

El sistema de reservaciones empresariales está estructurado de manera modular y escalable:

1. **Páginas** manejan la navegación principal
2. **Componentes** encapsulan la lógica de UI
3. **Stores** gestionan el estado global
4. **Composables** proporcionan lógica reutilizable
5. **Eventos** sincronizan el estado entre componentes

El flujo es completamente reactivo y automático, actualizando la UI en tiempo real cuando se guardan los pasos exitosamente.
