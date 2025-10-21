# Conexión API - Registro de Usuarios

## Descripción
Este documento explica cómo está configurada la conexión entre el formulario de registro y el endpoint de la API para crear nuevos usuarios según la estructura real del endpoint.

## Estructura de la Implementación

### 1. Endpoint de la API
- **URL**: `https://api-mider-dev.buzzword.com.mx/api/User/CreateUserAsync`
- **Método**: POST
- **Content-Type**: application/json
- **Autorización**: Bearer Token (requerido)

### 2. Estructura de Datos de la API
```json
{
  "userName": "usuario123",
  "email": "juan@ejemplo.com",
  "password": "MiPassword123",
  "phoneNumber": "+52123456789",
  "name": "Juan",
  "paternalLastName": "Pérez",
  "maternalLastName": "García",
  "genderId": 1,
  "enableMarketing": true,
  "enableUsePersonalData": true,
  "enable": true,
  "userModifiedId": 1,
  "userTypeId": 1,
  "dateBirth": "1990-01-15"
}
```

### 3. Mapeo de Campos del Formulario a la API

| Campo del Formulario | Campo de la API | Tipo | Descripción |
|---------------------|----------------|------|-------------|
| `username` | `userName` | string | Nombre de usuario único |
| `firstName` | `name` | string | Nombre(s) del usuario |
| `lastName` | `paternalLastName` | string | Apellido paterno |
| `maternalLastName` | `maternalLastName` | string | Apellido materno (opcional) |
| `email` | `email` | string | Correo electrónico |
| `password` | `password` | string | Contraseña |
| `phone` | `phoneNumber` | string | Teléfono de contacto |
| `birthDate` | `dateBirth` | string | Fecha de nacimiento (YYYY-MM-DD) |
| `gender` | `genderId` | number | ID del género (1=Masculino, 2=Femenino, 3=Otro, 4=Prefiero no decir) |
| `receiveNewsletters` | `enableMarketing` | boolean | Autorización para marketing |
| `acceptDataUsage` | `enableUsePersonalData` | boolean | Autorización uso de datos personales |
| - | `enable` | boolean | Usuario habilitado (siempre true) |
| - | `userModifiedId` | number | ID del usuario que modifica (sistema = 1) |
| - | `userTypeId` | number | Tipo de usuario (por defecto = 1) |

### 4. Composable de Autenticación (`lib/api/composables/auth.ts`)
El composable `useApiAuth()` incluye la función `register()` que:
- Mapea los datos del formulario al formato exacto esperado por la API
- Convierte el género de string a número usando `mapGenderToId()`
- Asigna valores por defecto para campos del sistema
- Ejecuta la petición POST al endpoint de creación de usuarios
- Maneja errores y estados de carga automáticamente

### 5. Formulario de Registro (`components/auth/RegisterForm.vue`)
El componente incluye:
- **Nuevos campos agregados**:
  - Apellido Paterno (separado del campo apellidos anterior)
  - Apellido Materno (opcional)
- Validación con Zod para todos los campos
- Mapeo completo de datos del formulario
- Manejo de estados de carga y errores
- Todos los campos requeridos por la API

### 6. Página de Registro (`pages/auth/register.vue`)
La página incluye:
- Integración del formulario con el composable de API
- Manejo de estados de éxito y error
- Redirección automática después del registro exitoso
- Notificaciones visuales para el usuario

## Flujo de Registro Actualizado

1. **Usuario llena el formulario** → Validación en tiempo real
2. **Usuario envía el formulario** → Validación final de todos los campos
3. **Datos se mapean** → Conversión completa según estructura de la API
4. **Petición a la API** → POST a `/api/User/CreateUserAsync` con Bearer token
5. **Respuesta exitosa** → Mensaje de éxito y redirección al login
6. **Error en la API** → Mensaje de error específico según el tipo

## Validaciones del Formulario Actualizadas

### Campos Requeridos
- ✅ Nombre de usuario (3-50 caracteres, solo letras, números y _)
- ✅ Nombre (2-100 caracteres, solo letras y espacios)
- ✅ Apellido Paterno (2-100 caracteres, solo letras y espacios)
- ✅ Email (formato válido)
- ✅ Contraseña (8+ caracteres, mayúscula, minúscula, número)
- ✅ Confirmación de contraseña (debe coincidir)
- ✅ Teléfono (formato válido)
- ✅ Fecha de nacimiento (edad entre 13 y 120 años)
- ✅ Género (selección requerida)
- ✅ Autorización de datos personales (requerida)

### Campos Opcionales
- ✅ Apellido Materno (máximo 100 caracteres)
- ✅ Newsletter/Marketing (checkbox opcional)

## Mapeo de Género a ID

```javascript
const genderMap = {
  'male': 1,           // Masculino
  'female': 2,         // Femenino
  'other': 3,          // Otro
  'prefer-not-to-say': 4 // Prefiero no decir
}
```

## Configuración de la API

### Headers Automáticos
```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer YOUR_SECRET_TOKEN' // Si hay token disponible
}
```

### Campos del Sistema (Automáticos)
- `enable`: siempre `true`
- `userModifiedId`: siempre `1` (sistema)
- `userTypeId`: siempre `1` (usuario estándar)

## Ejemplo de Petición Real

```bash
curl https://api-mider-dev.buzzword.com.mx/api/User/CreateUserAsync \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
    "userName": "usuario123",
    "email": "juan@ejemplo.com",
    "password": "MiPassword123",
    "phoneNumber": "+52123456789",
    "name": "Juan",
    "paternalLastName": "Pérez",
    "maternalLastName": "García",
    "genderId": 1,
    "enableMarketing": true,
    "enableUsePersonalData": true,
    "enable": true,
    "userModifiedId": 1,
    "userTypeId": 1,
    "dateBirth": "1990-01-15"
  }'
```

## Notas Importantes

- ⚠️ **Token de Autorización**: El endpoint requiere un Bearer token, incluso para registro
- ✅ **Campos Separados**: Apellido paterno y materno ahora son campos separados
- ✅ **Género como Número**: El género se convierte automáticamente de texto a ID numérico
- ✅ **Fecha de Nacimiento**: Ahora se incluye en el registro (formato YYYY-MM-DD)
- ✅ **Campos del Sistema**: Se asignan automáticamente valores por defecto 