# Catálogo de Tipos de Industria (IndustryType)

## Descripción

Este documento describe la integración del catálogo de tipos de industria (IndustryType) en el sistema MIDEReservacionesFront. El catálogo permite obtener dinámicamente los tipos de industria disponibles desde la API y utilizarlos en formularios y componentes.

## Endpoint Utilizado

```
GET /api/Catalog/GetAllCatalogsPublicAsync?TableName=IndustryType
```

### Parámetros
- `TableName`: `IndustryType` (filtro para obtener solo tipos de industria)

### Respuesta Esperada

```json
{
  "code": 200,
  "isValid": true,
  "comments": "All Catalogs were successfully retrieved.",
  "response": [
    {
      "id": 1,
      "tableName": "IndustryType",
      "value": "Tecnología",
      "description": "Empresas del sector tecnológico",
      "enable": true,
      "userModified": "SysAdmin"
    },
    {
      "id": 2,
      "tableName": "IndustryType",
      "value": "Salud",
      "description": "Empresas del sector salud",
      "enable": true,
      "userModified": "SysAdmin"
    }
  ],
  "token": ""
}
```

## Implementación en Componentes

### 1. Componente AddCompanyDialog.vue

El componente `AddCompanyDialog.vue` ha sido actualizado para cargar dinámicamente los tipos de industria desde el catálogo:

```typescript
// Importar el composable de catálogos
import { useCatalog } from '@/composables/useCatalog'

// Usar el composable
const { catalogs, loading: catalogsLoading, error: catalogsError, fetchCatalogs } = useCatalog()

// Opciones para sector (se cargarán desde el catálogo)
const sectorOptions = ref<Array<{ value: string; label: string }>>([])

// Función para cargar los tipos de industria desde el catálogo
const loadIndustryTypes = async () => {
  try {
    console.log('🔄 Cargando tipos de industria desde el catálogo...')
    await fetchCatalogs({ tableName: 'IndustryType' })
    
    const industryCatalogs = catalogs.value.filter(catalog => 
      catalog.tableName === 'IndustryType' && catalog.enable
    )
    
    sectorOptions.value = industryCatalogs.map(catalog => ({
      value: catalog.value,
      label: catalog.description || catalog.value
    }))
    
    console.log('✅ Tipos de industria cargados:', sectorOptions.value)
  } catch (error) {
    console.error('❌ Error cargando tipos de industria:', error)
    // Fallback a opciones por defecto en caso de error
    sectorOptions.value = [
      { value: 'tecnologia', label: 'Tecnología' },
      { value: 'salud', label: 'Salud' },
      // ... más opciones por defecto
    ]
  }
}

// Cargar tipos de industria al montar el componente
onMounted(() => {
  loadIndustryTypes()
})
```

### 2. Template con Indicadores de Estado

```vue
<FormField name="sector" v-slot="{ field }">
  <FormItem>
    <FormLabel>Sector</FormLabel>
    <FormControl>
      <Select v-bind="field">  
        <SelectTrigger class="w-full">
          <SelectValue :placeholder="catalogsLoading ? 'Cargando sectores...' : 'Seleccionar sector'" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sectores</SelectLabel>
            <SelectItem 
              v-for="option in sectorOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormControl>
    <FormMessage />
    <div v-if="catalogsError" class="text-sm text-destructive">
      Error al cargar sectores: {{ catalogsError }}
    </div>
  </FormItem>
</FormField>
```

## Composable useCatalog

El composable `useCatalog` proporciona toda la funcionalidad necesaria para trabajar con catálogos:

```typescript
import { useCatalog } from '@/composables/useCatalog'

const { 
  catalogs,           // Lista de catálogos
  loading,           // Estado de carga
  error,             // Error si ocurre
  fetchCatalogs      // Función para cargar catálogos
} = useCatalog()

// Cargar tipos de industria específicos
await fetchCatalogs({ tableName: 'IndustryType' })

// Filtrar catálogos activos
const activeCatalogs = catalogs.value.filter(catalog => catalog.enable)
```

## Ejemplo de Uso Completo

### Componente de Ejemplo: IndustryTypeCatalogExample.vue

Se ha creado un componente de ejemplo completo que demuestra:

1. **Carga de datos**: Obtener tipos de industria desde la API
2. **Filtrado**: Mostrar solo catálogos activos
3. **Búsqueda**: Filtrar por tabla, valor o descripción
4. **Estados**: Manejo de carga, error y éxito
5. **Visualización**: Cards y tabla con información detallada

### Página de Ejemplo

Visita `/examples/industry-type-catalog` para ver una demostración completa del catálogo de tipos de industria.

## Ventajas de la Implementación

### 1. **Dinámico**
- Los tipos de industria se cargan desde la base de datos
- No requiere cambios en el código para agregar nuevos tipos
- Se actualiza automáticamente cuando cambia el catálogo

### 2. **Robusto**
- Manejo de errores con fallback a opciones por defecto
- Indicadores de estado de carga
- Validación de datos

### 3. **Reutilizable**
- El composable `useCatalog` puede usarse en otros componentes
- Patrón consistente para todos los catálogos
- Fácil de mantener y extender

### 4. **Experiencia de Usuario**
- Placeholder dinámico durante la carga
- Mensajes de error claros
- Interfaz responsiva

## Casos de Uso

### 1. **Formulario de Registro de Empresa**
```typescript
// En AddCompanyDialog.vue
const loadIndustryTypes = async () => {
  await fetchCatalogs({ tableName: 'IndustryType' })
  // Mapear a opciones del select
}
```

### 2. **Filtros de Búsqueda**
```typescript
// En componentes de búsqueda
const industryTypes = computed(() => 
  catalogs.value.filter(catalog => 
    catalog.tableName === 'IndustryType' && catalog.enable
  )
)
```

### 3. **Validación de Datos**
```typescript
// Validar que el sector seleccionado existe en el catálogo
const isValidSector = (sector: string) => {
  return catalogs.value.some(catalog => 
    catalog.tableName === 'IndustryType' && 
    catalog.value === sector && 
    catalog.enable
  )
}
```

## Configuración del Backend

Para que el catálogo funcione correctamente, el backend debe tener:

1. **Tabla de catálogos** con la estructura:
   - `id`: Identificador único
   - `tableName`: 'IndustryType'
   - `value`: Valor del tipo de industria
   - `description`: Descripción opcional
   - `enable`: Estado activo/inactivo
   - `userModified`: Usuario que modificó el registro

2. **Endpoint público** que permita consultar catálogos sin autenticación

3. **Datos de ejemplo** para tipos de industria comunes:
   - Tecnología
   - Salud
   - Educación
   - Finanzas
   - Retail
   - Manufactura
   - Servicios
   - Consultoría
   - Otro

## Troubleshooting

### Error: "No se encontraron tipos de industria"
- Verificar que el backend tenga datos en la tabla `IndustryType`
- Confirmar que el endpoint `/api/Catalog/GetAllCatalogsPublicAsync` funcione
- Revisar la consola del navegador para errores de red

### Error: "Error al cargar sectores"
- Verificar la conectividad con la API
- Revisar los logs del backend
- Confirmar que el parámetro `TableName=IndustryType` sea correcto

### Opciones por defecto se muestran
- Esto es normal cuando hay errores de red
- Las opciones por defecto aseguran que el formulario siga funcionando
- Revisar la conectividad y reintentar

## Próximos Pasos

1. **Extender a otros catálogos**: Aplicar el mismo patrón a otros tipos de catálogo
2. **Caché local**: Implementar caché para mejorar el rendimiento
3. **Sincronización**: Actualizar automáticamente cuando cambien los catálogos
4. **Validación**: Agregar validación más robusta de los datos del catálogo
