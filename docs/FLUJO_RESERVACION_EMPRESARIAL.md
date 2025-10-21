# 🔄 Flujo de Reservación Empresarial - Diagrama Visual

## 📊 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           RESERVACIONES EMPRESARIALES                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │   PÁGINAS       │    │   COMPONENTES   │    │         STORES              │  │
│  │                 │    │                 │    │                             │  │
│  │ 📄 index.vue    │    │ 🧩 EmpresarialForm│    │ 🏪 reservation-form.ts     │  │
│  │ 📄 formulario-  │    │ 🧩 ReservationStep│    │ 🏪 reservation-company.ts  │  │
│  │    reservacion  │    │    Header.vue   │    │ 🏪 reservation-step-status  │  │
│  │                 │    │ 🧩 ReservationStep│    │                             │  │
│  │                 │    │    1,2,3.vue    │    │                             │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │   COMPOSABLES   │    │   SERVICIOS     │    │         UTILS               │  │
│  │                 │    │                 │    │                             │  │
│  │ 🔧 useReservation│    │ 🌐 API Endpoints│    │ 🛠️ useToast                 │  │
│  │    Company.ts   │    │ 🌐 useApiFetch  │    │ 🛠️ useErrorHandler          │  │
│  │ 🔧 useStepLoader│    │ 🌐 useApiPost   │    │ 🛠️ useStoreCleanup          │  │
│  │ 🔧 useStepEvents│    │                 │    │ 🛠️ useAutoStoreCleanup      │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Navegación

```
┌─────────────────┐
│   /reservations │
│   (Lista)       │
│                 │
│ [Ver Detalle]   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ /reservations/  │
│ formulario-     │
│ reservacion     │
│ ?step=1         │
│                 │
│ [Paso 1] [Paso 2] [Paso 3] │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ReservationStep │
│ Header.vue      │
│                 │
│ [←] [1] [2] [3] [→] │
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
│                 │
│ [Guardar] [Siguiente] │
└─────────────────┘
```

## 🎯 Flujo de Datos Detallado

### 1️⃣ **Inicialización**
```
┌─────────────────┐
│ Usuario accede  │
│ a formulario-   │
│ reservacion     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ onMounted()     │
│ ejecuta:        │
│                 │
│ • loadExisting  │
│   Reservation() │
│ • initializeNew │
│   Session()     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ReservationStep │
│ Header.vue      │
│ se monta        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ setupStepSave   │
│ Listeners()     │
│ configura       │
│ eventos         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ loadStepsIf     │
│ Needed()        │
│ carga estado    │
│ de pasos        │
└─────────────────┘
```

### 2️⃣ **Navegación entre Pasos**
```
┌─────────────────┐
│ Usuario hace    │
│ clic en paso    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ReservationStep │
│ Header emite    │
│ "step-click"    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ EmpresarialForm │
│ escucha evento  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Cambia          │
│ currentStep     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Renderiza       │
│ ReservationStep │
│ correspondiente │
└─────────────────┘
```

### 3️⃣ **Guardado de Paso**
```
┌─────────────────┐
│ Usuario envía   │
│ formulario      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ReservationStep │
│ 2.vue ejecuta   │
│ handleSubmit()  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ mapFormDataTo   │
│ ApiRequest()    │
│ transforma      │
│ datos           │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ store.update    │
│ FormData()      │
│ actualiza store │
│ local           │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ updateReservation│
│ Step2() llama   │
│ API             │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ useReservation  │
│ Company.ts      │
│ ejecuta:        │
│                 │
│ • store.update  │
│   Reservation   │
│   Step2()       │
│ • showSuccess() │
│   toast         │
│ • emitStep2     │
│   Saved() evento│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ReservationStep │
│ Header escucha  │
│ evento          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ markStepComplete│
│ Immediately()   │
│ marca como      │
│ completo        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ forceReloadAll  │
│ Steps() recarga │
│ estado          │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ UI se actualiza │
│ con ✅          │
└─────────────────┘
```

## 🎨 Estados Visuales de Pasos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PASO COMPLETO │    │ PASO DISPONIBLE │    │ PASO BLOQUEADO  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │     ✅     │  │    │  │     2     │  │    │  │     3     │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│ bg-green-100    │    │ bg-blue-100     │    │ bg-gray-100     │
│ text-green-800  │    │ text-blue-800   │    │ text-gray-500   │
│                 │    │                 │    │                 │
│ Navegación:     │    │ Navegación:     │    │ Navegación:     │
│ ✅ Habilitada   │    │ ✅ Habilitada   │    │ ❌ Deshabilitada│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Funciones Principales por Componente

### 📄 **ReservationStepHeader.vue**
```
┌─────────────────────────────────────────────────────────────────┐
│                    ReservationStepHeader.vue                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🧭 NAVEGACIÓN                                                  │
│  ├─ goToNextStep()           → Ir al siguiente paso            │
│  ├─ goToPreviousStep()       → Ir al paso anterior             │
│  └─ getStepVisualState()     → Estado visual del paso          │
│                                                                 │
│  📊 CARGA DE DATOS                                             │
│  ├─ loadStepsIfNeeded()      → Cargar pasos si es necesario    │
│  ├─ forceReloadAllSteps()    → Forzar recarga de pasos         │
│  └─ loadReservationSteps()   → Cargar pasos de reservación     │
│                                                                 │
│  🎧 EVENTOS                                                    │
│  ├─ setupStepSaveListeners() → Configurar listeners            │
│  ├─ handleStepSaved()        → Manejar guardado exitoso        │
│  ├─ markStepCompleteImmediately() → Marcar como completo       │
│  └─ cleanupStepSaveListeners() → Limpiar listeners             │
│                                                                 │
│  🐛 DEBUG                                                      │
│  ├─ toggleDebugInfo()        → Mostrar/ocultar debug           │
│  ├─ debugInfo (computed)     → Información de debug            │
│  └─ showDebugControls        → Controles de debug              │
└─────────────────────────────────────────────────────────────────┘
```

### 🏢 **EmpresarialForm.vue**
```
┌─────────────────────────────────────────────────────────────────┐
│                      EmpresarialForm.vue                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🎯 GESTIÓN DE PASOS                                           │
│  ├─ currentStep              → Paso actual (1, 2, 3)          │
│  ├─ handleStepClick()        → Manejar clic en paso            │
│  └─ canNavigateToStep()      → Verificar si puede navegar      │
│                                                                 │
│  🎨 RENDERIZADO                                                │
│  ├─ getCurrentStepComponent() → Obtener componente del paso    │
│  └─ stepComponents           → Mapeo de componentes            │
│                                                                 │
│  📡 EVENTOS                                                    │
│  ├─ @step-click              → Escuchar clic en paso           │
│  └─ @step-completed          → Escuchar paso completado        │
└─────────────────────────────────────────────────────────────────┘
```

### 📝 **ReservationStep2.vue**
```
┌─────────────────────────────────────────────────────────────────┐
│                    ReservationStep2.vue                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 FORMULARIO                                                 │
│  ├─ handleSubmit()           → Manejar envío                   │
│  ├─ mapFormDataToApiRequest() → Transformar datos              │
│  ├─ validateForm()           → Validar formulario              │
│  └─ form (reactive)          → Datos del formulario            │
│                                                                 │
│  🌐 API                                                        │
│  ├─ updateReservationStep2() → Actualizar paso 2               │
│  └─ useReservationCompany()  → Composable empresarial          │
│                                                                 │
│  🎨 UI                                                         │
│  ├─ campos del formulario    → Inputs, selects, checkboxes     │
│  ├─ validación en tiempo real → Mensajes de error              │
│  └─ botones de acción        → Guardar, Siguiente              │
└─────────────────────────────────────────────────────────────────┘
```

### 🏪 **useReservationCompany.ts**
```
┌─────────────────────────────────────────────────────────────────┐
│                  useReservationCompany.ts                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔧 CRUD OPERATIONS                                            │
│  ├─ createReservationStep1()  → Crear paso 1                   │
│  ├─ updateReservationStep2()  → Actualizar paso 2              │
│  └─ updateReservationStep3()  → Actualizar paso 3              │
│                                                                 │
│  📡 EVENTOS                                                    │
│  ├─ emitStep1Saved()          → Emitir evento paso 1           │
│  ├─ emitStep2Saved()          → Emitir evento paso 2           │
│  └─ emitStep3Saved()          → Emitir evento paso 3           │
│                                                                 │
│  🛠️ UTILIDADES                                                │
│  ├─ loadStep1()               → Cargar datos paso 1            │
│  ├─ loadStep2()               → Cargar datos paso 2            │
│  ├─ showSuccess()             → Mostrar toast éxito            │
│  └─ showError()               → Mostrar toast error            │
└─────────────────────────────────────────────────────────────────┘
```

### 🏪 **reservation-step-status.ts**
```
┌─────────────────────────────────────────────────────────────────┐
│                reservation-step-status.ts                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 ESTADO                                                     │
│  ├─ stepStatus               → Estado de cada paso             │
│  ├─ currentReservationId     → ID de reservación actual        │
│  ├─ currentAttendeeType      → Tipo de asistente               │
│  └─ isLoading                → Estado de carga                 │
│                                                                 │
│  ✅ VALIDACIÓN                                                │
│  ├─ isStepDataComplete()     → Verificar si paso está completo │
│  ├─ validateFields()         → Validar campos                  │
│  ├─ validateField()          → Validar campo individual        │
│  └─ stepValidationConfig     → Configuración de validación     │
│                                                                 │
│  🎯 GESTIÓN                                                   │
│  ├─ markStepComplete()       → Marcar paso como completo       │
│  ├─ markStepIncomplete()     → Marcar paso como incompleto     │
│  ├─ loadAllStepsStatus()     → Cargar estado de todos los pasos│
│  └─ forceReloadAllSteps()    → Forzar recarga                  │
│                                                                 │
│  🔧 CONFIGURACIÓN                                             │
│  ├─ addStepValidationConfig() → Agregar configuración          │
│  ├─ addNewReservationType()   → Agregar nuevo tipo             │
│  └─ getStepValidationConfig() → Obtener configuración          │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Flujo de Validación

```
┌─────────────────┐
│ Datos del paso  │
│ llegan del API  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ isStepData      │
│ Complete()      │
│ verifica        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ validateFields()│
│ valida campos   │
│ requeridos      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ validateField() │
│ valida cada     │
│ campo           │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Reglas de       │
│ validación:     │
│                 │
│ • Campos básicos│
│ • Campos contacto│
│ • Campos fecha  │
│ • Campos ID     │
│ • Campos costo  │
│ • Campos boolean│
│ • Arrays        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Resultado:      │
│ ✅ Completo     │
│ ❌ Incompleto   │
└─────────────────┘
```

## 🚀 Flujo de Guardado Exitoso (Detallado)

```
┌─────────────────┐
│ 1. Usuario      │
│    envía        │
│    formulario   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 2. API responde │
│    exitosamente │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 3. useReservation│
│    Company      │
│    emite evento │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 4. ReservationStep│
│    Header       │
│    escucha      │
│    evento       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 5. Verifica que │
│    es la misma  │
│    reservación  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 6. Marca paso   │
│    como completo│
│    inmediatamente│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 7. Recarga      │
│    estado de    │
│    todos los    │
│    pasos        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 8. UI se        │
│    actualiza    │
│    con ✅       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 9. Botón        │
│    "Siguiente   │
│    Paso" se     │
│    habilita     │
└─────────────────┘
```

## 🎯 Resumen del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA COMPLETO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🎯 OBJETIVO: Sistema de reservaciones empresariales modular   │
│                                                                 │
│  🏗️ ARQUITECTURA:                                              │
│  ├─ Páginas: Navegación principal                              │
│  ├─ Componentes: Lógica de UI encapsulada                     │
│  ├─ Stores: Estado global gestionado                           │
│  ├─ Composables: Lógica reutilizable                          │
│  └─ Eventos: Sincronización entre componentes                 │
│                                                                 │
│  🔄 FLUJO: Completamente reactivo y automático                │
│                                                                 │
│  ✅ RESULTADO: UI se actualiza en tiempo real                  │
└─────────────────────────────────────────────────────────────────┘
```

---

Este diagrama muestra la estructura completa del sistema de reservaciones empresariales, desde la navegación hasta el guardado exitoso, incluyendo todos los componentes, funciones y flujos de datos involucrados.
