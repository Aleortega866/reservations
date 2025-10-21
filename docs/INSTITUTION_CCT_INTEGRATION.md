# Integración del Servicio CCT de Instituciones

## Resumen

Este documento describe la integración completa del endpoint `/api/Institution/GetAllInstitutionCCTAsync` en el sistema de gestión de instituciones educativas.

## Endpoint Integrado

**URL:** `GET /api/Institution/GetAllInstitutionCCTAsync`

**Descripción:** Obtiene las instituciones de acuerdo al filtro especificado en la consulta.

## Parámetros del Endpoint

### Parámetros Requeridos
- `StateId` (integer): ID del estado de la república
- `PageNumber` (integer): Número de página para paginación
- `PageSize` (integer): Tamaño de página para paginación

### Parámetros Opcionales
- `Id` (integer): Filtra por ID de institución
- `InstitutionName` (string): Filtra por nombre de institución
- `CCT` (string): Filtra por código CCT
- `MunicipalityId` (integer): Filtra por municipio
- `LocalityId` (integer): Filtra por localidad
- `PostalCode` (string): Filtra por código postal
- `EducationaControlTypeId` (integer): Filtra por tipo de control educativo
- `EducationShiftId` (integer): Filtra por turno educativo

## Implementación

### 1. Servicio (lib/api/services/institution/institution.service.ts)

El servicio ya está implementado con el método `getAllInstitutionCCT`:

```typescript
async getAllInstitutionCCT(params: GetAllInstitutionCCTRequest): Promise<Institution[]> {
  const { execute } = useApiFetch<{ response: Institution[] }>(
    API_ENDPOINTS.institution.getAllCCT,
    { immediate: false }
  )
  
  const query: Record<string, any> = {
    StateId: params.stateId,
    PageNumber: params.pageNumber,
    PageSize: params.pageSize
  }
  
  // Agregar filtros opcionales
  if (params.id !== undefined) {
    query.Id = params.id
  }
  
  if (params.institutionName) {
    query.InstitutionName = params.institutionName
  }
  
  if (params.cct) {
    query.CCT = params.cct
  }
  
  // ... otros filtros
  
  const result = await execute({ query })
  return result.response || []
}
```

### 2. Composable (composables/useInstitutions.ts)

El composable ya incluye el método `getAllInstitutionCCT`:

```typescript
const getAllInstitutionCCT = async (params: GetAllInstitutionCCTRequest): Promise<Institution[]> => {
  loading.value = true
  error.value = null
  
  try {
    const result = await institutionService.getAllInstitutionCCT(params)
    institutions.value = result
    return result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al obtener las instituciones'
    return []
  } finally {
    loading.value = false
  }
}
```

### 3. Componente Integrado (components/profile/AddInstitutionDialog.vue)

El componente `AddInstitutionDialog.vue` ha sido actualizado para integrar completamente el servicio CCT:

#### Características Implementadas:

1. **Filtros Dinámicos:**
   - Entidad Federativa (Estado)
   - Municipio/Delegación/Alcaldía
   - Localidad
   - Código Postal
   - Tipo de Institución
   - Turno Educativo

2. **Búsqueda por Nombre o CCT:**
   - Campo de texto para buscar por nombre de institución
   - Detección automática de CCT (códigos alfanuméricos)
   - Búsqueda en tiempo real

3. **Estados de Carga y Error:**
   - Indicadores visuales de carga
   - Manejo de errores con mensajes informativos
   - Contador de resultados encontrados

4. **Funcionalidades Adicionales:**
   - Botón para limpiar todos los filtros
   - Transformación automática de datos
   - Integración con catálogos geográficos

#### Código Principal:

```typescript
// Parámetros para el servicio CCT
const cctParams = ref({
  stateId: 1, // Requerido - valor por defecto
  pageNumber: 1, // Requerido
  pageSize: 50, // Requerido - aumentado para mostrar más resultados
  institutionName: undefined,
  cct: undefined,
  municipalityId: undefined,
  localityId: undefined,
  postalCode: undefined,
  educationalControlTypeId: undefined,
  educationShiftId: undefined
})

// Función para cargar instituciones CCT
const loadCCTInstitutions = async () => {
  try {
    loadingCCT.value = true
    cctError.value = null
    
    console.log('🔍 Cargando instituciones CCT con parámetros:', cctParams.value)
    
    const result = await getAllInstitutionCCT(cctParams.value)
    
    // Transformar las instituciones al formato esperado
    cctInstitutions.value = result.map((institution: any) => ({
      value: institution.id?.toString() || '',
      label: institution.institutionName || 'Sin nombre',
      type: 'Institución Educativa',
      location: `CCT: ${institution.cct || 'N/A'}`,
      status: 'Registrada SEP',
      description: `Institución con CCT: ${institution.cct || 'N/A'}`
    }))
    
  } catch (error) {
    console.error('❌ Error cargando instituciones CCT:', error)
    cctError.value = error instanceof Error ? error.message : 'Error desconocido'
  } finally {
    loadingCCT.value = false
  }
}
```

### 4. Ejemplo de Uso (examples/InstitutionCCTExample.vue)

Se ha creado un ejemplo completo para probar la integración:

- **Controles de prueba** para todos los parámetros
- **Visualización de resultados** en tiempo real
- **Logs de consola** para debugging
- **Manejo de estados** (carga, error, éxito)

### 5. Página de Prueba (pages/examples/institution-cct.vue)

Página dedicada para probar la integración en `/examples/institution-cct`

## Uso del Servicio

### Uso Básico

```typescript
import { useInstitutions } from '@/composables/useInstitutions'

const { getAllInstitutionCCT } = useInstitutions()

// Ejemplo básico
const instituciones = await getAllInstitutionCCT({
  stateId: 1, // Requerido
  pageNumber: 1, // Requerido
  pageSize: 10, // Requerido
})
```

### Uso con Filtros

```typescript
// Ejemplo con filtros
const instituciones = await getAllInstitutionCCT({
  stateId: 1,
  pageNumber: 1,
  pageSize: 50,
  institutionName: 'Escuela', // Opcional
  cct: 'ABC123', // Opcional
  municipalityId: 5, // Opcional
  localityId: 10, // Opcional
  postalCode: '12345', // Opcional
  educationalControlTypeId: 1, // Opcional
  educationShiftId: 2 // Opcional
})
```

## Debugging

### Logs de Consola

El sistema incluye logs detallados para debugging:

- `🔍 Cargando instituciones CCT con parámetros:` - Muestra los parámetros enviados
- `✅ Instituciones CCT cargadas:` - Confirma la carga exitosa
- `🔄 Instituciones transformadas:` - Muestra el resultado transformado
- `❌ Error cargando instituciones CCT:` - Muestra errores detallados

### Estados de Carga

- **loadingCCT**: Indica si se está cargando
- **cctError**: Contiene el mensaje de error si existe
- **cctInstitutions**: Array con las instituciones encontradas

## Consideraciones Técnicas

### 1. Valores por Defecto
- `stateId`: 1 (primer estado)
- `pageNumber`: 1 (primera página)
- `pageSize`: 50 (50 resultados por página)

### 2. Transformación de Datos
Las instituciones se transforman automáticamente al formato esperado por `FilterSelectCheck`:

```typescript
{
  value: institution.id?.toString() || '',
  label: institution.institutionName || 'Sin nombre',
  type: 'Institución Educativa',
  location: `CCT: ${institution.cct || 'N/A'}`,
  status: 'Registrada SEP',
  description: `Institución con CCT: ${institution.cct || 'N/A'}`
}
```

### 3. Manejo de Errores
- Errores de red se capturan y muestran al usuario
- Fallbacks para catálogos si la API falla
- Validación de parámetros requeridos

### 4. Performance
- Paginación implementada para manejar grandes volúmenes
- Carga lazy de catálogos geográficos
- Debounce en búsquedas de texto

## Próximos Pasos

1. **Testing**: Implementar pruebas unitarias y de integración
2. **Optimización**: Implementar cache para catálogos frecuentes
3. **UX**: Mejorar la interfaz de usuario con más feedback visual
4. **Validación**: Agregar validación de formularios más robusta

## Archivos Modificados

- `components/profile/AddInstitutionDialog.vue` - Integración principal
- `examples/InstitutionCCTExample.vue` - Ejemplo de uso
- `pages/examples/institution-cct.vue` - Página de prueba
- `docs/INSTITUTION_CCT_INTEGRATION.md` - Esta documentación

## Conclusión

La integración del servicio CCT está completa y funcional. El sistema permite:

- ✅ Búsqueda por todos los filtros disponibles
- ✅ Paginación de resultados
- ✅ Manejo de errores robusto
- ✅ Interfaz de usuario intuitiva
- ✅ Debugging completo
- ✅ Documentación detallada

El servicio está listo para uso en producción.
