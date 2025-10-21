import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

// Schema para crear/editar usuario
export const userSchema = toTypedSchema(z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(20, 'El nombre no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  apellidoPaterno: z
    .string()
    .min(1, 'El apellido paterno es requerido')
    .max(20, 'El apellido paterno no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido paterno solo puede contener letras y espacios'),
  apellidoMaterno: z
    .string()
    .min(1, 'El apellido materno es requerido')
    .max(20, 'El apellido materno no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido materno solo puede contener letras y espacios'),
  correoElectronico: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido')
    .max(50, 'El correo electrónico no puede exceder 50 caracteres'),
  contraseña: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*(),.?":{}|<>\-_+=]/, 'La contraseña debe contener al menos un carácter especial')
}))

// Schema para editar usuario (sin contraseña)
export const editUserSchema = toTypedSchema(z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(20, 'El nombre no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  apellidoPaterno: z
    .string()
    .min(1, 'El apellido paterno es requerido')
    .max(20, 'El apellido paterno no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido paterno solo puede contener letras y espacios'),
  apellidoMaterno: z
    .string()
    .min(1, 'El apellido materno es requerido')
    .max(20, 'El apellido materno no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido materno solo puede contener letras y espacios')
}))

// Schema para crear empleado (coincide con CreateEmployeeRequest)
export const employeeSchema = toTypedSchema(z.object({
  userName: z
    .string()
    .min(1, 'El nombre de usuario es requerido')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(20, 'El nombre no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  paternalLastName: z
    .string()
    .min(1, 'El apellido paterno es requerido')
    .max(20, 'El apellido paterno no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido paterno solo puede contener letras y espacios'),
  maternalLastName: z
    .string()
    .min(1, 'El apellido materno es requerido')
    .max(20, 'El apellido materno no puede exceder 20 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido materno solo puede contener letras y espacios'),
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido')
    .max(50, 'El correo electrónico no puede exceder 50 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*(),.?":{}|<>\-_+=]/, 'La contraseña debe contener al menos un carácter especial')
}))

// Schema para búsqueda de usuarios
export const searchUserSchema = toTypedSchema(z.object({
  correoElectronico: z
    .string()
    .email('Ingresa un correo electrónico válido')
    .optional()
}))

// Tipos exportados para uso en componentes
export type UserFormData = {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  correoElectronico: string
  contraseña: string
}

export type EditUserFormData = {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
}

export type EmployeeFormData = {
  userName: string
  name: string
  paternalLastName: string
  maternalLastName: string
  email: string
  password: string
}

export type SearchUserFormData = {
  correoElectronico?: string
}
