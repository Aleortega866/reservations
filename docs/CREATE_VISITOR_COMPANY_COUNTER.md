# Contador de CreateVisitorCompany

## Descripción

Este documento describe la implementación del contador para las operaciones de `createVisitorCompany` en el sistema de visitantes.

## Funcionalidad

El contador rastrea automáticamente:
- **Empresas creadas**: Número total de empresas creadas exitosamente
- **Empresas eliminadas**: Número total de empresas eliminadas
- **Total de operaciones**: Suma de todas las operaciones realizadas

## Implementación

### 1. Composable `useApiVisitor`

El contador está implementado en el composable `useApiVisitor` ubicado en:
```
lib/api/composables/visitor.ts
```

#### Variables reactivas del contador:
```typescript
const createVisitorCompanyCount = ref(0)
const deleteVisitorCompanyCount = ref(0)
const totalVisitorCompanyOperations = ref(0)
```

#### Función `createVisitorCompany`:
```typescript
const createVisitorCompany = async (data: Omit<CreateVisitorCompanyRequest, 'userModifiedId'>) => {
  try {
    clearError()
    loading.value = true
    const requestData: CreateVisitorCompanyRequest = {
      ...data,
      userModifiedId: getUserModifiedId()
    }
    const response = await visitorService.createVisitorCompany(requestData)
    
    // Incrementar contador
    createVisitorCompanyCount.value++
    totalVisitorCompanyOperations.value++
    
    // Agregar la nueva compañía a la lista
    if (response.data) {
      visitorCompanies.value.push(response.data)
    }
    
    return response
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}
```

#### Función `deleteVisitorCompany`:
```typescript
const deleteVisitorCompany = async (data: Omit<DeleteVisitorCompanyRequest, 'userModifiedId'>) => {
  try {
    clearError()
    loading.value = true
    const requestData: DeleteVisitorCompanyRequest = {
      ...data,
      userModifiedId: getUserModifiedId()
    }
    const response = await visitorService.deleteVisitorCompany(requestData)
    
    // Incrementar contador
    deleteVisitorCompanyCount.value++
    totalVisitorCompanyOperations.value++
    
    // Remover la compañía de la lista
    visitorCompanies.value = visitorCompanies.value.filter(c => c.id !== data.id)
    
    return response
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}
```

#### Función para limpiar contadores:
```typescript
const clearVisitorCompanyCounters = () => {
  createVisitorCompanyCount.value = 0
  deleteVisitorCompanyCount.value = 0
  totalVisitorCompanyOperations.value = 0
}
```

### 2. Uso en Componentes

#### Importar el composable:
```typescript
import { useApiVisitor } from '@/lib/api/composables/visitor'

const {
  createVisitorCompany,
  deleteVisitorCompany,
  createVisitorCompanyCount,
  deleteVisitorCompanyCount,
  totalVisitorCompanyOperations,
  clearVisitorCompanyCounters
} = useApiVisitor()
```

#### Mostrar contadores en el template:
```vue
<template>
  <div class="grid grid-cols-3 gap-4">
    <Card>
      <CardContent>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ createVisitorCompanyCount }}
          </div>
          <div class="text-sm text-muted-foreground">
            Empresas Creadas
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">
            {{ deleteVisitorCompanyCount }}
          </div>
          <div class="text-sm text-muted-foreground">
            Empresas Eliminadas
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {{ totalVisitorCompanyOperations }}
          </div>
          <div class="text-sm text-muted-foreground">
            Total Operaciones
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
```

### 3. Componente AddCompanyDialog

El componente `AddCompanyDialog.vue` ha sido actualizado para incluir el contador:

```vue
<DialogTitle class="text-left text-xl text-muted-foreground">
  Gestionar empresas
  <div class="text-sm text-muted-foreground mt-1">
    Empresas creadas: {{ createVisitorCompanyCount }}
  </div>
</DialogTitle>
```

## Ejemplo de Uso

### Página de ejemplo:
```
/examples/create-visitor-company-counter
```

### Componente de ejemplo:
```
examples/CreateVisitorCompanyCounterExample.vue
```

## Características

### ✅ Funcionalidades implementadas:
- Contador automático de empresas creadas
- Contador automático de empresas eliminadas
- Contador total de operaciones
- Función para limpiar contadores
- Integración con el modal AddCompanyDialog
- Ejemplo funcional completo
- Documentación detallada

### 📊 Métricas disponibles:
- `createVisitorCompanyCount`: Número de empresas creadas
- `deleteVisitorCompanyCount`: Número de empresas eliminadas
- `totalVisitorCompanyOperations`: Total de operaciones

### 🔧 Funciones disponibles:
- `createVisitorCompany(data)`: Crear empresa e incrementar contador
- `deleteVisitorCompany(data)`: Eliminar empresa e incrementar contador
- `clearVisitorCompanyCounters()`: Limpiar todos los contadores

## Persistencia

Los contadores se mantienen durante la sesión actual del usuario. Al recargar la página, los contadores se reinician a 0.

## Logs de Debug

El sistema incluye logs detallados para debugging:

```typescript
console.log('✅ Empresa creada exitosamente')
console.log('📊 Contador actualizado:', createVisitorCompanyCount.value)
console.log('🔄 Eliminando empresa con ID:', id)
console.log('📊 Contador de eliminaciones actualizado:', deleteVisitorCompanyCount.value)
```

## Consideraciones

1. **Persistencia**: Los contadores se reinician al recargar la página
2. **Concurrencia**: Los contadores son reactivos y se actualizan en tiempo real
3. **Errores**: Los contadores no se incrementan si la operación falla
4. **Limpieza**: Se puede limpiar manualmente con `clearVisitorCompanyCounters()`

## Próximas Mejoras

- [ ] Persistencia de contadores en localStorage
- [ ] Contadores por usuario/sesión
- [ ] Historial de operaciones
- [ ] Exportación de estadísticas
- [ ] Dashboard de métricas
