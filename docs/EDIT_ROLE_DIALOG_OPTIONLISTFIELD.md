# Cambio de Select por OptionListField en EditRoleDialog

## Cambio Realizado

Se reemplazó el componente `Select` nativo por el componente personalizado `OptionListField` en el campo de selección de tipo de rol del diálogo de edición de roles.

## Implementación

### Antes (Select nativo)
```vue
<Select v-model="formData.roleTypeId" :class="{ 'border-destructive': errors.roleTypeId }">
  <SelectTrigger class="w-full">
    <SelectValue :placeholder="catalogsLoading ? 'Cargando tipos...' : 'Seleccionar tipo de rol'" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Tipos de rol</SelectLabel>
      <SelectItem 
        v-for="option in roleTypeOptions" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

### Después (OptionListField)
```vue
<OptionListField
  v-model="formData.roleTypeId"
  label=""
  :placeholder="catalogsLoading ? 'Cargando tipos...' : 'Seleccionar tipo de rol'"
  :options="roleTypeOptions"
  :disabled="catalogsLoading"
  searchable
  search-placeholder="Buscar tipo de rol..."
/>
```

## Beneficios del Cambio

### 1. **Funcionalidad de Búsqueda**
- Los usuarios pueden buscar tipos de rol escribiendo en el campo
- Mejora la experiencia de usuario cuando hay muchos tipos de rol disponibles

### 2. **Interfaz Consistente**
- Mantiene la consistencia visual con otros componentes de la aplicación
- Usa el mismo patrón de diseño que otros campos de selección

### 3. **Mejor UX**
- Animaciones suaves de apertura/cierre
- Indicadores visuales claros del estado de carga
- Manejo mejorado de estados vacíos y de error

### 4. **Funcionalidades Adicionales**
- Búsqueda en tiempo real
- Filtrado automático de opciones
- Mejor accesibilidad

## Configuración del OptionListField

### Propiedades Utilizadas
- `v-model="formData.roleTypeId"` - Vinculación bidireccional con el formulario
- `label=""` - Sin etiqueta (se usa el Label separado)
- `:placeholder` - Placeholder dinámico basado en el estado de carga
- `:options="roleTypeOptions"` - Lista de opciones del catálogo
- `:disabled="catalogsLoading"` - Deshabilitado durante la carga
- `searchable` - Habilita la funcionalidad de búsqueda
- `search-placeholder="Buscar tipo de rol..."` - Placeholder para el campo de búsqueda

### Formato de Opciones
Las opciones mantienen el formato existente:
```typescript
roleTypeOptions.value = roleTypeCatalogs.map(catalog => ({
  value: catalog.id.toString(), // ID como valor
  label: catalog.value          // Nombre como etiqueta
}))
```

## Compatibilidad

### ✅ Mantenido
- **Funcionalidad**: La selección y validación funcionan igual
- **Datos**: El formato de datos no cambió
- **Estados**: Estados de carga y error se mantienen
- **Validación**: Las validaciones del formulario siguen funcionando

### 🔄 Mejorado
- **Búsqueda**: Nueva funcionalidad de búsqueda
- **UX**: Mejor experiencia de usuario
- **Consistencia**: Interfaz más consistente con el resto de la app

## Archivos Modificados

- `components/admin/roles/EditRoleDialog.vue`
  - Reemplazado import de `Select` por `OptionListField`
  - Actualizado el template del campo de tipo de rol
  - Mantenida la lógica de carga y validación

## Notas Importantes

- El cambio es **retrocompatible** - no afecta la funcionalidad existente
- Se mantiene el **manejo de errores** y **validaciones**
- La **carga de datos** desde el catálogo sigue funcionando igual
- Se agregó **funcionalidad de búsqueda** como mejora adicional
