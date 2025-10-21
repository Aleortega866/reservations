# Servicio de Códigos Postales

Este documento describe la implementación del servicio de códigos postales en la aplicación MIDER.

## Descripción

El servicio de códigos postales permite consultar y filtrar códigos postales de México a través de la API. Proporciona funcionalidades para buscar por código postal, municipio y otros criterios.

## Endpoint

```
GET /api/PostalCode/GetAllPostalCodeAsync
```

### Parámetros de Consulta

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `Id` | `integer` | ID único del código postal | No |
| `PostalCode` | `string` | Código postal para filtrar | No |
| `Municipality` | `string` | Municipio para filtrar | No |

### Ejemplo de Request

```bash
curl 'https://api-mider-dev.buzzword.com.mx/api/PostalCode/GetAllPostalCodeAsync?PostalCode=01000' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN'
```

## Estructura del Proyecto

### Servicio

- **Archivo**: `lib/api/services/postal-code/postal-code.service.ts`
- **Clase**: `PostalCodeService`
- **Método principal**: `getAllPostalCodes(params?)`

### Tipos TypeScript

- **Archivo**: `lib/api/types/postal-code/index.ts`
- **Interfaces**:
  - `PostalCode`: Representa un código postal
  - `GetAllPostalCodesRequest`: Parámetros para consultar códigos postales

### Composable

- **Archivo**: `composables/usePostalCodes.ts`
- **Función**: `usePostalCodes()`

## Uso del Servicio

### 1. Importar el servicio

```typescript
import { postalCodeService } from '@/lib/api'
```

### 2. Usar el servicio directamente

```typescript
// Obtener todos los códigos postales
const postalCodes = await postalCodeService.getAllPostalCodes()

// Buscar por código postal
const results = await postalCodeService.getAllPostalCodes({
  postalCode: '01000'
})

// Buscar por municipio
const results = await postalCodeService.getAllPostalCodes({
  municipality: 'Cuauhtémoc'
})
```

### 3. Usar el composable (Recomendado)

```typescript
import { usePostalCodes } from '@/composables/usePostalCodes'

const {
  postalCodes,
  loading,
  error,
  postalCodeOptions,
  fetchPostalCodes,
  searchByPostalCode,
  searchByMunicipality,
  getPostalCodeByCode
} = usePostalCodes()

// Cargar todos los códigos postales
await fetchPostalCodes()

// Buscar por código postal
await searchByPostalCode('01000')

// Buscar por municipio
await searchByMunicipality('Cuauhtémoc')

// Obtener opciones para componentes de selección
console.log(postalCodeOptions.value)
```

## Integración en Componentes

### Ejemplo con FilterSelect

```vue
<template>
  <FormField name="postalCode" v-slot="{ field }">
    <FormItem>
      <FormLabel>Código Postal</FormLabel>
      <FormControl>
        <FilterSelect
          :model-value="field.value"
          :onUpdate:modelValue="field.onChange"
          :options="postalCodeOptions"
          :loading="loading"
          placeholder="Seleccionar código postal"
        />
      </FormControl>
      <FormMessage />
      <div v-if="error" class="text-sm text-destructive">
        Error al cargar códigos postales: {{ error }}
      </div>
    </FormItem>
  </FormField>
</template>

<script setup lang="ts">
import { usePostalCodes } from '@/composables/usePostalCodes'

const { postalCodeOptions, loading, error, fetchPostalCodes } = usePostalCodes()

// Cargar códigos postales al montar el componente
onMounted(() => {
  fetchPostalCodes()
})
</script>
```

### Ejemplo con búsqueda en tiempo real

```vue
<template>
  <Input
    v-model="searchTerm"
    placeholder="Buscar código postal..."
    @input="handleSearch"
  />
  
  <div v-if="loading">Cargando...</div>
  <div v-else>
    <div v-for="postalCode in postalCodes" :key="postalCode.id">
      {{ postalCode.postalCode }} - {{ postalCode.municipality }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePostalCodes } from '@/composables/usePostalCodes'

const { postalCodes, loading, searchByPostalCode } = usePostalCodes()
const searchTerm = ref('')

const handleSearch = () => {
  if (searchTerm.value.length >= 3) {
    searchByPostalCode(searchTerm.value)
  }
}
</script>
```

## Estructura de Datos

### PostalCode

```typescript
interface PostalCode {
  /** ID único del código postal */
  id: number
  /** Código postal */
  postalCode: string
  /** Municipio */
  municipality: string
  /** Estado (opcional) */
  state?: string
  /** Ciudad (opcional) */
  city?: string
  /** Colonia (opcional) */
  neighborhood?: string
}
```

### GetAllPostalCodesRequest

```typescript
interface GetAllPostalCodesRequest {
  /** ID del código postal (opcional) */
  id?: number
  /** Código postal para filtrar (opcional) */
  postalCode?: string
  /** Municipio para filtrar (opcional) */
  municipality?: string
}
```

## Funciones del Composable

### Estado

- `postalCodes`: Lista de códigos postales (readonly)
- `loading`: Estado de carga (readonly)
- `error`: Mensaje de error (readonly)

### Computed

- `postalCodeOptions`: Opciones formateadas para componentes de selección

### Métodos

- `fetchPostalCodes(params?)`: Carga códigos postales con filtros opcionales
- `searchByPostalCode(postalCode)`: Busca por código postal específico
- `searchByMunicipality(municipality)`: Busca por municipio
- `getPostalCodeByCode(postalCode)`: Obtiene un código postal específico

## Manejo de Errores

El servicio incluye manejo de errores robusto:

```typescript
try {
  const postalCodes = await postalCodeService.getAllPostalCodes()
} catch (error) {
  console.error('Error al cargar códigos postales:', error)
  // Manejar el error apropiadamente
}
```

El composable maneja automáticamente los errores y los expone a través de la propiedad `error`.

## Ejemplos de Uso

### 1. Carga inicial de códigos postales

```typescript
const { fetchPostalCodes } = usePostalCodes()

onMounted(() => {
  fetchPostalCodes()
})
```

### 2. Búsqueda con debounce

```typescript
import { debounce } from 'lodash-es'

const { searchByPostalCode } = usePostalCodes()

const debouncedSearch = debounce((term: string) => {
  if (term.length >= 3) {
    searchByPostalCode(term)
  }
}, 300)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  debouncedSearch(target.value)
}
```

### 3. Validación de código postal

```typescript
const { getPostalCodeByCode } = usePostalCodes()

const validatePostalCode = (postalCode: string) => {
  const found = getPostalCodeByCode(postalCode)
  return found !== undefined
}
```

## Configuración

El endpoint está configurado en `lib/api/core/config.ts`:

```typescript
export const API_ENDPOINTS = {
  // ... otros endpoints
  postalCode: {
    getAll: '/api/PostalCode/GetAllPostalCodeAsync'
  }
}
```

## Testing

Para probar el servicio, puedes usar el ejemplo en:

- **Página**: `/examples/postal-codes`
- **Componente**: `examples/PostalCodesExample.vue`

## Consideraciones de Rendimiento

1. **Caching**: Considera implementar cache para códigos postales frecuentemente consultados
2. **Paginación**: Para grandes volúmenes de datos, considera implementar paginación
3. **Debounce**: Usa debounce en búsquedas en tiempo real para evitar demasiadas llamadas a la API

## Troubleshooting

### Error común: "No se encontraron códigos postales"

1. Verifica que el token de autorización sea válido
2. Confirma que el endpoint esté disponible
3. Revisa los parámetros de búsqueda

### Error común: "Error de red"

1. Verifica la conectividad a internet
2. Confirma que la URL base sea correcta
3. Revisa los logs del servidor

## Contribución

Para agregar nuevas funcionalidades al servicio:

1. Actualiza los tipos en `lib/api/types/postal-code/index.ts`
2. Modifica el servicio en `lib/api/services/postal-code/postal-code.service.ts`
3. Actualiza el composable en `composables/usePostalCodes.ts`
4. Agrega tests y documentación
5. Actualiza este documento
