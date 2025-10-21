# API de Catálogos Públicos

## Endpoint: GET /api/Catalog/GetAllCatalogsPublicAsync

Este endpoint permite obtener catálogos públicos de la base de datos con filtros opcionales.

### Parámetros de Consulta

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `Id` | `integer` | ID del catálogo específico | No |
| `TableName` | `string` | Nombre de la tabla a filtrar | No |
| `Value` | `string` | Valor del catálogo a filtrar | No |

### Ejemplo de Request

```bash
curl 'https://api-mider-dev.buzzword.com.mx/api/Catalog/GetAllCatalogsPublicAsync?Id=1&TableName=estados&Value=activo' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN'
```

### Respuesta

```json
{
  "code": 200,
  "isValid": true,
  "comments": "All Catalogs were successfully retrieved.",
  "response": [
    {
      "id": 20,
      "tableName": "Gender",
      "value": "Femenino",
      "description": "Define el genero femenino",
      "enable": true,
      "userModified": "SysAdmin"
    }
  ],
  "token": ""
}
```

### Estructura de Respuesta

#### Respuesta Principal
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `code` | `number` | Código de respuesta HTTP |
| `isValid` | `boolean` | Indica si la respuesta es válida |
| `comments` | `string` | Mensaje descriptivo de la respuesta |
| `response` | `array` | Array con los catálogos |
| `token` | `string` | Token de autenticación (vacío para endpoints públicos) |

#### Estructura de Catálogo
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `number` | ID único del catálogo |
| `tableName` | `string` | Nombre de la tabla |
| `value` | `string` | Valor del catálogo |
| `description` | `string` | Descripción opcional |
| `enable` | `boolean` | Indica si el catálogo está habilitado |
| `userModified` | `string` | Usuario que modificó el registro |

## Uso en el Frontend

### Composable useCatalog

```typescript
import { useCatalog } from '@/composables/useCatalog'

const { catalogs, loading, error, fetchCatalogs } = useCatalog()

// Obtener todos los catálogos
await fetchCatalogs()

// Obtener catálogos con filtros
await fetchCatalogs({
  tableName: 'Gender',
  value: 'Femenino'
})
```

### Servicio Directo

```typescript
import { catalogService } from '@/lib/api/services'

// Obtener catálogos públicos
const catalogs = await catalogService.getAllCatalogsPublic({
  tableName: 'estados'
})
```

## Componente de Ejemplo

Se ha creado un componente de ejemplo en `components/examples/CatalogExample.vue` que demuestra:

- Filtrado por ID, nombre de tabla y valor
- Manejo de estados de carga y error
- Visualización de resultados con badges y cards
- Formateo de fechas

## Página de Demostración

Visita `/examples/catalog` para ver una demostración completa del endpoint.

## Catálogo de Géneros

### Implementación en el Formulario de Registro

El formulario de registro (`components/auth/RegisterForm.vue`) utiliza el endpoint de catálogo para cargar dinámicamente las opciones de género:

```typescript
// Cargar opciones de género desde el catálogo
const loadGenderOptions = async () => {
  await fetchCatalogs({ tableName: 'generos' })
  const genderCatalogs = catalogs.value.filter(catalog => 
    catalog.tableName === 'generos' && catalog.isActive
  )
  
  genderOptions.value = genderCatalogs.map(catalog => ({
    id: catalog.id,
    value: catalog.value,
    description: catalog.description || catalog.value
  }))
}
```

### Página de Ejemplo

Visita `/examples/gender-catalog` para ver una demostración específica del catálogo de géneros.

## Catálogo de Tipos de Usuario

### Implementación en el Registro

El proceso de registro utiliza el endpoint de catálogo para obtener automáticamente el ID del tipo de usuario "visitante":

```typescript
// Función auxiliar para obtener el ID del tipo de usuario "visitante"
const getVisitorUserTypeId = async (): Promise<number> => {
  try {
    const userTypes = await catalogService.getAllCatalogsPublic({ tableName: 'UserType' })
    const visitorType = userTypes.find(type => 
      type.value.toLowerCase() === 'visitante' || 
      type.value.toLowerCase() === 'visitor'
    )
    return visitorType?.id || 1 // Por defecto 1 si no se encuentra
  } catch (error) {
    console.error('Error obteniendo tipo de usuario visitante:', error)
    return 1 // Por defecto 1 en caso de error
  }
}
```

### Página de Ejemplo

Visita `/examples/user-type-catalog` para ver una demostración específica del catálogo de tipos de usuario.

## Casos de Uso Comunes

1. **Obtener estados disponibles**: `?TableName=estados`
2. **Obtener tipos de documento**: `?TableName=tipos_documento`
3. **Obtener categorías**: `?TableName=categorias`
4. **Obtener géneros**: `?TableName=Gender`
5. **Obtener tipos de usuario**: `?TableName=UserType`
6. **Filtrar por valor específico**: `?Value=Femenino`

## Notas de Implementación

- El endpoint es público y no requiere autenticación
- Los filtros son opcionales y se pueden combinar
- La respuesta siempre es un array, incluso si solo hay un resultado
- Los catálogos inactivos también se incluyen en la respuesta 