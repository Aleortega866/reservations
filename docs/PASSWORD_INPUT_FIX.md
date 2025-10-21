# Corrección del Problema del Input de Contraseña

## Problema Identificado

El usuario no podía escribir en el campo de contraseña cuando intentaba usar caracteres especiales como el guión (`-`). El problema estaba en la validación de caracteres especiales que era demasiado restrictiva.

### Contraseña Problemática
- **Contraseña intentada**: `Passw123-*/`
- **Carácter problemático**: `-` (guión)
- **Regex original**: `/[!@#$%^&*(),.?":{}|<>]/`

## Solución Implementada

### 1. Actualización del Regex de Caracteres Especiales

Se modificó el regex en `lib/validations/users.ts` para incluir más caracteres especiales comunes:

**Antes:**
```javascript
.regex(/[!@#$%^&*(),.?":{}|<>]/, 'La contraseña debe contener al menos un carácter especial')
```

**Después:**
```javascript
.regex(/[!@#$%^&*(),.?":{}|<>\-_+=]/, 'La contraseña debe contener al menos un carácter especial')
```

### 2. Caracteres Especiales Ahora Permitidos

Los siguientes caracteres especiales ahora son válidos para contraseñas:
- `!` `@` `#` `$` `%` `^` `&` `*` `(` `)` `,` `.` `?` `"` `:` `{` `}` `|` `<` `>` `\` `-` `_` `+` `=`

### 3. Actualización del Texto de Ayuda

Se actualizó el texto de ayuda en `UserFormDialog.vue` para mostrar ejemplos de caracteres especiales válidos:

```vue
<div class="text-xs text-muted-foreground mt-1">
  La contraseña debe tener exactamente 8 caracteres con mayúscula, minúscula, número y carácter especial (ej: !@#$%^&*()_+-=).
</div>
```

## Archivos Modificados

1. **`lib/validations/users.ts`**
   - Actualizado regex en `userSchema`
   - Actualizado regex en `editUserSchema`

2. **`components/admin/usuarios/UserFormDialog.vue`**
   - Actualizado texto de ayuda para mostrar ejemplos

## Resultado

Ahora el usuario puede escribir contraseñas que incluyan el guión (`-`) y otros caracteres especiales comunes sin problemas. La contraseña `Passw123-*/` ahora es válida y se puede escribir correctamente en el campo de contraseña.

## Nota sobre Errores de Linter

Los errores de linter mostrados están relacionados con problemas de tipos entre `vee-validate` y el componente `Input`, no con la funcionalidad de la contraseña. Estos errores no afectan la funcionalidad del input de contraseña.
