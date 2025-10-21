import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

// Schema para login
export const loginSchema = toTypedSchema(z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido')
    .max(255, 'El correo electrónico es demasiado largo'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(128, 'La contraseña es demasiado larga')
}))

// Schema para registro
export const registerSchema = toTypedSchema(z.object({
  username: z
    .string()
    .min(1, 'El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario es demasiado largo')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  birthDate: z
    .string()
    .min(1, 'La fecha de nacimiento es requerida')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 13 && age <= 120
    }, 'Debes tener entre 13 y 120 años'),
  gender: z
    .string()
    .min(1, 'Por favor selecciona tu género')
    .refine((value) => ['male', 'female', 'other', 'prefer-not-to-say'].includes(value), {
      message: 'Selecciona una opción válida'
    }),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Ingresa un número de teléfono válido')
    .max(20, 'El número de teléfono es demasiado largo')
}))

// Schema para recuperación de contraseña
export const forgotPasswordSchema = toTypedSchema(z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido')
    .max(255, 'El correo electrónico es demasiado largo')
}))

// Schema para cambio de contraseña
export const resetPasswordSchema = toTypedSchema(z.object({
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .max(128, 'La contraseña es demasiado larga'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}))

// Tipos exportados para uso en componentes
export type LoginFormData = {
  email: string
  password: string
}

export type RegisterFormData = {
  username: string
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  phone: string
}

export type ForgotPasswordFormData = {
  email: string
}

export type ResetPasswordFormData = {
  password: string
  confirmPassword: string
} 