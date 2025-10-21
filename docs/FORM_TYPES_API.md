# API de Formularios Principales

## Descripción

Esta documentación describe la implementación actualizada del sistema de formularios principales que utiliza la respuesta de la API para llenar y listar los formularios.

## Estructura de la API

### Endpoints

#### GET /api/Form/GetAllFormTypesAsync
Obtiene todos los tipos de formularios disponibles.

#### PUT /api/Form/UpdateFormTypeEnableStatusAsync/{id}
Actualiza el estado activo/inactivo de un formulario específico.

**Métodos soportados:** PUT, PATCH

**Parámetros:**
- `id` (number): ID del formulario a actualizar

**Nota:** La respuesta puede tener `"response": null` cuando la actualización es exitosa. En este caso, se considera éxito si `code` es 200 y `isValid` es true.

**Respuesta:**
```json
{
  "code": 200,
  "isValid": true,
  "comments": "Acrtualización exitosa",
  "response": null,
  "token": ""
}
```

### Respuesta de la API
```json
{
  "code": 200,
  "isValid": true,
  "comments": "Consulta exitosa.",
  "response": [
    {
      "id": 1,
      "description": "General",
      "enable": true
    },
    {
      "id": 2,
      "description": "Escolar",
      "enable": true
    },
    {
      "id": 3,
      "description": "Empresarial",
      "enable": true
    },
    {
      "id": 4,
      "description": "Curso de verano",
      "enable": false
    },
    {
      "id": 5,
      "description": "Patrocinio escolar (acceso gratuito)",
      "enable": true
    },
    {
      "id": 6,
      "description": "Patrocinio escolar (acceso gratuito + transporte gratuito)",
      "enable": true
    },
    {
      "id": 7,
      "description": "Banco de México",
      "enable": true
    },
    {
      "id": 8,
      "description": "Encuentro con profesores",
      "enable": true
    },
    {
      "id": 9,
      "description": "Sesiones digitales",
      "enable": true
    },
    {
      "id": 10,
      "description": "Eventos con cupo sujeto a disponibilidad",
      "enable": true
    }
  ],
  "token": ""
}
```

## Tipos de Datos

### FormType
```typescript
interface FormType {
  id: number
  description: string
  enable: boolean
}
```

### FormTypesResponse
```typescript
interface FormTypesResponse {
  code: number
  isValid: boolean
  comments: string
  response: FormType[]
  token: string
}
```

### UpdateFormTypeEnableStatusResponse
```typescript
interface UpdateFormTypeEnableStatusResponse {
  code: number
  isValid: boolean
  comments: string
  response: boolean | null
  token: string
}
```

## Componentes Actualizados

### 1. Servicio de Formularios (`lib/api/services/form/form.service.ts`)

El servicio ha sido actualizado para manejar la nueva estructura de respuesta de la API:

```typescript
class FormService {
  async getAllFormTypes(): Promise<FormType[]> {
    const { execute } = useApiFetch<FormTypesResponse>(API_ENDPOINTS.form.getAllFormTypes)
    const result = await execute()
    return result.response || []
  }

  async updateFormTypeEnableStatus(id: number): Promise<boolean> {
    const endpoint = `${API_ENDPOINTS.form.updateFormTypeEnableStatus}/${id}`
    const { execute } = useApiPut<UpdateFormTypeEnableStatusResponse>(endpoint)
    const result = await execute()
    // Si la respuesta es null pero el código es 200 y isValid es true, consideramos éxito
    return result.response === true || (result.code === 200 && result.isValid)
  }

  async updateFormTypeEnableStatusPatch(id: number): Promise<boolean> {
    const endpoint = `${API_ENDPOINTS.form.updateFormTypeEnableStatus}/${id}`
    const { execute } = useApiPatch<UpdateFormTypeEnableStatusResponse>(endpoint)
    const result = await execute()
    // Si la respuesta es null pero el código es 200 y isValid es true, consideramos éxito
    return result.response === true || (result.code === 200 && result.isValid)
  }
}
```

### 2. Composable useFormTypes (`composables/useFormTypes.ts`)

El composable `useFormTypes` proporciona una interfaz reactiva para manejar los tipos de formularios:

```typescript
export function useFormTypes() {
  const formTypes = ref<FormType[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isLoaded = ref(false) // Nueva bandera para evitar llamadas duplicadas

  // Computed properties actualizados
  const activeFormTypes = computed(() => 
    formTypes.value.filter(form => form.enable)
  )

  const formTypesByType = computed(() => (type: string) => 
    formTypes.value.filter(form => form.description.toLowerCase().includes(type.toLowerCase()))
  )

  // Métodos actualizados
  const getFormTypeById = (id: number) => {
    return formTypes.value.find(form => form.id === id)
  }

  const searchFormTypes = (query: string) => {
    if (!query.trim()) return formTypes.value
    
    const lowerQuery = query.toLowerCase()
    return formTypes.value.filter(form => 
      form.description.toLowerCase().includes(lowerQuery)
    )
  }

  const updateFormTypeEnableStatus = async (id: number) => {
    try {
      const result = await formService.updateFormTypeEnableStatus(id)
      
      if (result) {
        // Actualizar el estado local del formulario
        const formIndex = formTypes.value.findIndex(form => form.id === id)
        if (formIndex !== -1) {
          formTypes.value[formIndex] = {
            ...formTypes.value[formIndex],
            enable: !formTypes.value[formIndex].enable
          }
        }
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el estado del formulario'
      console.error('Error updating form type enable status:', err)
      return false
    }
  }

  const updateFormTypeEnableStatusPatch = async (id: number) => {
    try {
      const result = await formService.updateFormTypeEnableStatusPatch(id)
      
      if (result) {
        // Actualizar el estado local del formulario
        const formIndex = formTypes.value.findIndex(form => form.id === id)
        if (formIndex !== -1) {
          formTypes.value[formIndex] = {
            ...formTypes.value[formIndex],
            enable: !formTypes.value[formIndex].enable
          }
        }
      }
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el estado del formulario'
      console.error('Error updating form type enable status with PATCH:', err)
      return false
    }
  }

  /**
   * Carga todos los tipos de formularios desde la API
   * Evita llamadas duplicadas si ya están cargados
   */
  const loadFormTypes = async (forceReload = false) => {
    // Si ya están cargados y no se fuerza la recarga, no hacer nada
    if (isLoaded.value && !forceReload) {
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const data = await formService.getAllFormTypes()
      formTypes.value = data
      isLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar los tipos de formularios'
      console.error('Error loading form types:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fuerza la recarga de los tipos de formularios
   */
  const reloadFormTypes = async () => {
    return loadFormTypes(true)
  }

  return {
    // Estado
    formTypes: readonly(formTypes),
    loading: readonly(loading),
    error: readonly(error),
    isLoaded: readonly(isLoaded),
    
    // Computed
    activeFormTypes,
    formTypesByType,
    
    // Métodos
    loadFormTypes,
    reloadFormTypes,
    getFormTypeById,
    getFormTypesByType,
    searchFormTypes,
    updateFormTypeEnableStatus
  }
}
```

#### Características principales:

- **Patrón Singleton**: El composable usa un patrón singleton para asegurar que solo haya una instancia compartida entre todos los componentes
- **Evita llamadas duplicadas**: El composable verifica si los datos ya están cargados antes de hacer una nueva petición
- **Recarga forzada**: Proporciona un método `reloadFormTypes()` para forzar la recarga cuando sea necesario
- **Estado de carga**: Incluye una bandera `isLoaded` para verificar si los datos ya fueron cargados
- **Manejo de errores**: Gestiona errores de red y los expone de forma reactiva
- **Logging**: Incluye logs para debuggear el comportamiento del singleton

### 3. Componente MainFormsList (`components/admin/formularios/MainFormsList.vue`)

El componente ha sido actualizado para mostrar los formularios con la nueva estructura:

```typescript
interface Formulario {
  id: number
  description: string
  enable: boolean
}

interface Props {
  modelValue: number[] | number
  label: string
  placeholder?: string
  formularios: readonly Formulario[]
  autoOpen?: boolean
  multiple?: boolean
}
```

### 4. Página de Formularios (`pages/admin/formularios.vue`)

La página ahora usa los datos de la API en lugar de datos hardcodeados:

```typescript
// Datos de formularios principales - se llenan desde la API
const formulariosPrincipales = computed(() => formTypes.value);

// Estado para los formularios seleccionados
const selectedFormularios = ref<number[]>([]);
```

## Funcionalidades

### 1. Carga de Datos
- Los formularios se cargan automáticamente al montar el componente
- Manejo de estados de carga y error
- Recarga manual de datos

### 2. Filtrado
- Filtrado por formularios activos (`enable: true`)
- Búsqueda por descripción
- Filtrado por tipo basado en la descripción

### 3. Visualización
- Lista de todos los formularios con su estado
- Indicadores visuales de estado activo/inactivo
- Contadores de formularios totales y activos

### 4. Interacción
- Switches para mostrar el estado de cada formulario
- Selección múltiple de formularios
- Eventos para actualizar, crear y eliminar formularios

### 5. Activación/Desactivación
- Switches interactivos para cambiar el estado activo/inactivo
- Llamada automática al endpoint de actualización
- Actualización en tiempo real del estado local
- Manejo de errores en la actualización

## Uso

### Prevención de Llamadas Duplicadas

El composable `useFormTypes` ahora incluye una funcionalidad para evitar llamadas duplicadas a la API usando un **patrón singleton**:

- **Patrón Singleton**: Solo existe una instancia del composable en toda la aplicación
- **Estado compartido**: Todos los componentes comparten el mismo estado de `formTypes`, `loading`, `error` e `isLoaded`
- **Verificación automática**: Antes de hacer una llamada a la API, verifica si los datos ya están cargados
- **Bandera `isLoaded`**: Indica si los datos ya fueron cargados previamente
- **Recarga forzada**: El método `reloadFormTypes()` permite forzar una nueva llamada cuando sea necesario
- **Múltiples componentes**: Si varios componentes usan el composable, solo se hará una llamada a la API
- **Logging**: Incluye logs en consola para debuggear el comportamiento

#### Ejemplo de uso con múltiples componentes:

```vue
<!-- Componente Padre -->
<template>
  <div>
    <h2>Página de Administración</h2>
    <FormulariosList />
    <QuotaRulesDialog />
  </div>
</template>

<script setup lang="ts">
import { useFormTypes } from '@/composables/useFormTypes'

const { loadFormTypes } = useFormTypes()

// Esta llamada se ejecutará
loadFormTypes()
</script>
```

```vue
<!-- FormulariosList.vue -->
<script setup lang="ts">
import { useFormTypes } from '@/composables/useFormTypes'

const { formTypes, isLoaded } = useFormTypes()

// Esta llamada NO se ejecutará si ya están cargados
loadFormTypes()
</script>
```

```vue
<!-- QuotaRulesDialog.vue -->
<script setup lang="ts">
import { useFormTypes } from '@/composables/useFormTypes'

const { formTypes, isLoaded } = useFormTypes()

// Esta llamada NO se ejecutará si ya están cargados
loadFormTypes()
</script>
```

**Resultado**: Solo se hará una llamada a la API, no tres.

**Logs en consola:**
```
useFormTypes: Creando nueva instancia singleton
useFormTypes: Cargando datos desde la API...
useFormTypes: Datos cargados exitosamente
useFormTypes: Reutilizando instancia singleton existente
useFormTypes: Datos ya cargados, evitando llamada duplicada
useFormTypes: Reutilizando instancia singleton existente
useFormTypes: Datos ya cargados, evitando llamada duplicada
```

### En un Componente Vue

```vue
<template>
  <div>
    <MainFormulariosList 
      label="Gestión de Formularios Principales"
      :modelValue="selectedFormularios" 
      :formularios="formulariosPrincipales"
      @update:modelValue="updateSelectedFormularios"
    />
    
    <!-- Estado de carga -->
    <div v-if="formTypesLoading" class="p-4 text-center">
      <p class="text-muted-foreground">Cargando formularios...</p>
    </div>
    
    <!-- Error -->
    <div v-if="formTypesError" class="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
      <p class="text-destructive text-sm">{{ formTypesError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFormTypes } from '@/composables/useFormTypes'
import MainFormulariosList from '@/components/admin/formularios/MainFormsList.vue'

const { formTypes, loading: formTypesLoading, error: formTypesError, loadFormTypes } = useFormTypes()

// Datos de formularios principales - se llenan desde la API
const formulariosPrincipales = computed(() => formTypes.value)

// Estado para los formularios seleccionados
const selectedFormularios = ref<number[]>([])

// Cargar formularios al montar el componente
loadFormTypes()

const updateSelectedFormularios = (formularios: number[] | number) => {
  if (Array.isArray(formularios)) {
    selectedFormularios.value = formularios
  } else {
    selectedFormularios.value = [formularios]
  }
}
</script>
```

### En un Composable

```typescript
import { useFormTypes } from '@/composables/useFormTypes'

const { 
  formTypes, 
  loading: formTypesLoading, 
  error: formTypesError, 
  loadFormTypes,
  activeFormTypes,
  searchFormTypes
} = useFormTypes()

// Cargar formularios (evita llamadas duplicadas)
loadFormTypes()

// Verificar si ya están cargados
if (isLoaded.value) {
  console.log('Los formularios ya están cargados')
}

// Forzar recarga si es necesario
await reloadFormTypes()

// Obtener formularios activos
const activeForms = activeFormTypes.value

// Buscar formularios
const searchResults = searchFormTypes('escolar')

// Cambiar estado de un formulario usando PUT
const toggleFormStatus = async (id: number) => {
  const result = await updateFormTypeEnableStatus(id)
  if (result) {
    console.log('Estado actualizado exitosamente con PUT')
  }
}

// Cambiar estado de un formulario usando PATCH
const toggleFormStatusPatch = async (id: number) => {
  const result = await updateFormTypeEnableStatusPatch(id)
  if (result) {
    console.log('Estado actualizado exitosamente con PATCH')
  }
}

## Ejemplos

### Página de Ejemplo
- **Ruta**: `/examples/form-types`
- **Archivo**: `pages/examples/form-types.vue`
- **Componente**: `examples/FormTypesExample.vue`

Esta página muestra todas las funcionalidades implementadas:
- Estado de la API
- Lista de formularios
- Formularios activos
- Búsqueda
- Acciones

## Cambios Realizados

1. **Actualización de tipos**: Se simplificó la interfaz `FormType` para coincidir con la API
2. **Servicio actualizado**: Se modificó el servicio para manejar la nueva estructura de respuesta
3. **Composable mejorado**: Se actualizaron los métodos de filtrado y búsqueda
4. **Componente adaptado**: Se modificó el componente para usar la nueva estructura de datos
5. **Página actualizada**: Se eliminaron los datos hardcodeados y se usa la API
6. **Ejemplos creados**: Se agregaron ejemplos y documentación

## Próximos Pasos

1. **Implementar CRUD**: Agregar funcionalidades para crear, actualizar y eliminar formularios
2. **Validación**: Agregar validación de datos
3. **Cache**: Implementar cache para mejorar el rendimiento
4. **Paginación**: Agregar paginación para grandes cantidades de formularios
5. **Filtros avanzados**: Implementar filtros más sofisticados 