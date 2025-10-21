# Servicio de Instituciones Educativas

## Descripción

Este documento describe la implementación completa del servicio de instituciones educativas para el sistema MIDEReservacionesFront. El servicio proporciona funcionalidades CRUD completas y consultas avanzadas para la gestión de instituciones educativas.

## Estructura del Servicio

### 1. Configuración de Endpoints

Los endpoints están definidos en `lib/api/core/config.ts`:

```typescript
institution: {
  create: '/api/Institution/CreateInstitutionAsync',
  update: '/api/Institution/UpdateInstitutionAsync',
  delete: '/api/Institution/DeleteInstitutionAsync',
  getById: '/api/Institution/GetInstitutionAsync',
  getAllCCT: '/api/Institution/GetAllInstitutionCCTAsync',
  getAllMunicipalities: '/api/Institution/GetAllInstitutionMunicipalityAsync',
  getAllLocalities: '/api/Institution/GetAllInstitutionLocalityAsync',
  getAll: '/api/Institution/GetAllInstitutionsAsync'
}
```

### 2. Tipos TypeScript

Los tipos están definidos en `lib/api/types/institution/index.ts`:

#### Interfaces Principales

```typescript
export interface Institution {
  id: number
  institutionName: string | null
  userModifiedId: number
  cct?: string
  stateId?: number
  municipalityId?: number
  localityId?: number
  postalCode?: string
  educationalControlTypeId?: number
  educationShiftId?: number
}
```

#### Interfaces de Petición

```typescript
export interface CreateInstitutionRequest {
  institutionName: string | null
  userModifiedId: number
}

export interface UpdateInstitutionRequest {
  id: number
  institutionName: string | null
  userModifiedId: number
}

export interface DeleteInstitutionRequest {
  id: number
  userModifiedId: number
}

export interface GetAllInstitutionCCTRequest {
  id?: number
  institutionName?: string
  cct?: string
  stateId: number // required
  municipalityId?: number
  localityId?: number
  postalCode?: string
  educationalControlTypeId?: number
  educationShiftId?: number
  pageNumber: number // required
  pageSize: number // required
}
```

### 3. Servicio Principal

El servicio está implementado en `lib/api/services/institution/institution.service.ts`:

#### Métodos CRUD Básicos

```typescript
// Crear institución
async createInstitution(data: CreateInstitutionRequest): Promise<Institution>

// Actualizar institución
async updateInstitution(data: UpdateInstitutionRequest): Promise<Institution>

// Eliminar institución
async deleteInstitution(data: DeleteInstitutionRequest): Promise<boolean>

// Obtener institución por ID
async getInstitution(params: GetInstitutionRequest): Promise<Institution>
```

#### Métodos de Consulta Avanzada

```typescript
// Obtener instituciones con filtros CCT
async getAllInstitutionCCT(params: GetAllInstitutionCCTRequest): Promise<Institution[]>

// Obtener todas las instituciones
async getAllInstitutions(params?: GetAllInstitutionsRequest): Promise<Institution[]>
```

#### Métodos de Catálogos Geográficos

```typescript
// Obtener municipios por estado
async getAllMunicipalities(params: GetAllInstitutionMunicipalityRequest): Promise<Municipality[]>

// Obtener localidades por municipio
async getAllLocalities(params: GetAllInstitutionLocalityRequest): Promise<Locality[]>
```

### 4. Composable Vue

El composable está implementado en `composables/useInstitutions.ts`:

#### Estados Reactivos

```typescript
const institutions = ref<Institution[]>([])
const municipalities = ref<Municipality[]>([])
const localities = ref<Locality[]>([])
const currentInstitution = ref<Institution | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
```

#### Computed Properties

```typescript
const hasInstitutions = computed(() => institutions.value.length > 0)
const hasMunicipalities = computed(() => municipalities.value.length > 0)
const hasLocalities = computed(() => localities.value.length > 0)
const isLoading = computed(() => loading.value)
const hasError = computed(() => error.value !== null)
```

## Uso del Servicio

### 1. Uso Directo del Servicio

```typescript
import { institutionService } from '~/lib/api/services'

// Crear una institución
const newInstitution = await institutionService.createInstitution({
  institutionName: 'Escuela Primaria Ejemplo',
  userModifiedId: 1
})

// Obtener instituciones con filtros CCT
const institutions = await institutionService.getAllInstitutionCCT({
  stateId: 1,
  pageNumber: 1,
  pageSize: 10,
  institutionName: 'Escuela'
})
```

### 2. Uso del Composable en Componentes Vue

```vue
<script setup lang="ts">
import { useInstitutions } from '~/composables/useInstitutions'

const {
  institutions,
  loading,
  error,
  createInstitution,
  getAllInstitutionCCT,
  clearError
} = useInstitutions()

// Crear institución
const handleCreate = async () => {
  const result = await createInstitution({
    institutionName: 'Nueva Institución',
    userModifiedId: 1
  })
  
  if (result) {
    console.log('Institución creada:', result)
  }
}

// Buscar instituciones
const handleSearch = async () => {
  await getAllInstitutionCCT({
    stateId: 1,
    pageNumber: 1,
    pageSize: 10
  })
}
</script>

<template>
  <div>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="institution in institutions" :key="institution.id">
        {{ institution.institutionName }}
      </div>
    </div>
  </div>
</template>
```

## Endpoints de la API

### POST /api/Institution/CreateInstitutionAsync

Crea una nueva institución.

**Body:**
```json
{
  "institutionName": "string | null",
  "userModifiedId": "integer"
}
```

### PUT /api/Institution/UpdateInstitutionAsync

Actualiza una institución existente.

**Body:**
```json
{
  "id": "integer",
  "institutionName": "string | null",
  "userModifiedId": "integer"
}
```

### DELETE /api/Institution/DeleteInstitutionAsync

Elimina una institución.

**Body:**
```json
{
  "id": "integer",
  "userModifiedId": "integer"
}
```

### GET /api/Institution/GetInstitutionAsync

Obtiene una institución por ID.

**Query Parameters:**
- `Id` (integer, required): ID de la institución

### GET /api/Institution/GetAllInstitutionCCTAsync

Obtiene instituciones con filtros CCT y paginación.

**Query Parameters:**
- `StateId` (integer, required): ID del estado
- `PageNumber` (integer, required): Número de página
- `PageSize` (integer, required): Tamaño de página
- `Id` (integer, optional): Filtro por ID
- `InstitutionName` (string, optional): Filtro por nombre
- `CCT` (string, optional): Filtro por código CCT
- `MunicipalityId` (integer, optional): Filtro por municipio
- `LocalityId` (integer, optional): Filtro por localidad
- `PostalCode` (string, optional): Filtro por código postal
- `EducationaControlTypeId` (integer, optional): Filtro por tipo de control educativo
- `EducationShiftId` (integer, optional): Filtro por turno educativo

### GET /api/Institution/GetAllInstitutionMunicipalityAsync

Obtiene municipios por estado.

**Query Parameters:**
- `StateId` (integer, required): ID del estado

### GET /api/Institution/GetAllInstitutionLocalityAsync

Obtiene localidades por municipio.

**Query Parameters:**
- `MunicipalityId` (integer, required): ID del municipio

### GET /api/Institution/GetAllInstitutionsAsync

Obtiene todas las instituciones con filtros básicos.

**Query Parameters:**
- `Id` (integer, optional): Filtro por ID
- `institutionName` (string, optional): Filtro por nombre

## Manejo de Errores

El servicio maneja errores de manera consistente:

1. **Errores de Red**: Capturados y convertidos a mensajes de error legibles
2. **Errores de Validación**: Retornados desde la API con detalles específicos
3. **Errores de Autenticación**: Manejo automático de tokens expirados

## Ejemplo Completo

Ver `examples/InstitutionExample.vue` para un ejemplo completo de uso que incluye:

- Formulario de creación de instituciones
- Búsqueda con filtros CCT
- Catálogos geográficos (municipios y localidades)
- Lista de instituciones con acciones CRUD
- Manejo de estados de carga y errores

## Consideraciones de Seguridad

1. **Autenticación**: Todos los endpoints requieren autenticación (excepto los públicos)
2. **Validación**: Los datos se validan tanto en el frontend como en el backend
3. **Auditoría**: Se registra el `userModifiedId` para auditoría de cambios

## Dependencias

- `axios`: Para peticiones HTTP
- `vue`: Para reactividad en composables
- TypeScript: Para tipado estático

## Archivos Relacionados

- `lib/api/core/config.ts`: Configuración de endpoints
- `lib/api/types/institution/index.ts`: Tipos TypeScript
- `lib/api/services/institution/`: Servicio principal
- `composables/useInstitutions.ts`: Composable Vue
- `examples/InstitutionExample.vue`: Ejemplo de uso
