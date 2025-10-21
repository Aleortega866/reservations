<template>
    <Card class="border-0 shadow-none">
      <CardHeader class="text-center pb-4">
        <CardTitle class="text-2xl font-semibold">Ingresa tu nueva contraseña</CardTitle>
        <p class="text-sm text-muted-foreground mt-2">
          Asegúrate de que sea segura y fácil de recordar
        </p>
      </CardHeader>
      <CardContent class="space-y-4 px-2">
        <!-- Error message -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">
            {{ getErrorMessage(error) }}
          </p>
        </div>

        <!-- Success message -->
        <div v-if="success" class="p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">
            {{ success }}
          </p>
        </div>

        <form @submit="onSubmit" class="space-y-4" v-auto-animate>
          <FormField v-slot="{ componentField }" name="password" v-auto-animate>
            <FormItem>
              <FormLabel class="text-sm">Nueva contraseña</FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Ingresa tu nueva contraseña"
                    class="border-0 pr-10"
                    :disabled="loading"
                    v-bind="componentField"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
                    @click="showPassword = !showPassword"
                    :disabled="loading"
                    tabindex="-1"
                  >
                    <Icon v-if="!showPassword" icon="lucide:eye" width="16" height="16" />
                    <Icon v-else icon="lucide:eye-off" width="16" height="16" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
              <!-- Password strength indicator -->
              <div v-if="values.password" class="mt-2">
                <div class="flex space-x-1">
                  <div 
                    v-for="(strength, index) in passwordStrength" 
                    :key="index"
                    class="h-1 flex-1 rounded"
                    :class="strength.color"
                  ></div>
                </div>
                <p class="text-xs mt-1">{{ passwordStrengthText }}</p>
              </div>
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="confirmPassword" v-auto-animate>
            <FormItem>
              <FormLabel class="text-sm">Confirmar nueva contraseña</FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Confirma tu nueva contraseña"
                    class="border-0 pr-10"
                    :disabled="loading"
                    v-bind="componentField"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
                    @click="showConfirmPassword = !showConfirmPassword"
                    :disabled="loading"
                    tabindex="-1"
                  >
                    <Icon v-if="!showConfirmPassword" icon="lucide:eye" width="16" height="16" />
                    <Icon v-else icon="lucide:eye-off" width="16" height="16" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          {{isValid}}
          <Button 
            type="submit" 
            variant="secondary"
            class="w-full mt-3"
            :disabled="loading"
          >
            <div v-if="loading" class="flex items-center justify-center">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Cambiando contraseña...
            </div>
            <span v-else>Cambiar contraseña</span>
          </Button>
        </form>

        <div class="flex items-center justify-center space-x-4 my-6">
          <div class="flex-1 border-t border-muted"></div>
          <div class="w-3 h-3 border border-muted rounded-full"></div>
          <div class="flex-1 border-t border-muted"></div>
        </div>
        <div class="text-center space-y-2">
          <Button variant="link" @click="$emit('login')" class="text-primary p-0 h-auto italic">
            Iniciar Sesión
          </Button>
          <br>
          <Button variant="link" @click="$emit('register')" class="text-primary p-0 h-auto italic">
            Registrarme
          </Button>
        </div>
      </CardContent>
    </Card>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'
  import * as z from 'zod'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form'
  import { Icon } from '@iconify/vue'
  import { vAutoAnimate } from '@formkit/auto-animate/vue'
  import { useErrorHandler } from '@/composables/ui/useErrorHandler'
  
  const props = defineProps({
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: [Error, Object, null],
      default: null
    },
    code: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['submit', 'login', 'register'])
  
  const success = ref('')
  
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  // Schema de validación con Zod
  const formSchema = toTypedSchema(z.object({
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
  
  // Formulario con vee-validate
  const form = useForm({
    validationSchema: formSchema,
  })
  
  const { handleSubmit, isValid, values } = form
  
  // Calcular fortaleza de la contraseña
  const passwordStrength = computed(() => {
    const password = values.password
    if (!password) return []
    
    let score = 0
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ]
    
    score = checks.filter(Boolean).length
    
    if (score <= 1) {
      return [
        { color: 'bg-red-500' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' }
      ]
    } else if (score <= 2) {
      return [
        { color: 'bg-orange-500' },
        { color: 'bg-orange-500' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' }
      ]
    } else if (score <= 3) {
      return [
        { color: 'bg-yellow-500' },
        { color: 'bg-yellow-500' },
        { color: 'bg-yellow-500' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' }
      ]
    } else if (score <= 4) {
      return [
        { color: 'bg-blue-500' },
        { color: 'bg-blue-500' },
        { color: 'bg-blue-500' },
        { color: 'bg-blue-500' },
        { color: 'bg-gray-200' }
      ]
    } else {
      return [
        { color: 'bg-green-500' },
        { color: 'bg-green-500' },
        { color: 'bg-green-500' },
        { color: 'bg-green-500' },
        { color: 'bg-green-500' }
      ]
    }
  })
  
  const passwordStrengthText = computed(() => {
    const password = values.password
    if (!password) return ''
    
    let score = 0
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ]
    
    score = checks.filter(Boolean).length
    
    if (score <= 1) return 'Muy débil'
    if (score <= 2) return 'Débil'
    if (score <= 3) return 'Media'
    if (score <= 4) return 'Fuerte'
    return 'Muy fuerte'
  })
  
  // Error handler
  const { getPasswordResetErrorMessage } = useErrorHandler()
  
  // Función para mostrar el mensaje de error correctamente
  const getErrorMessage = (err) => {
    if (!err) return ''
    if (typeof err === 'string') return err
    if (err.message) return err.message
    return JSON.stringify(err)
  }
  
  // Limpiar errores cuando se resuelve el error del servidor
  watch(() => props.error, (newError) => {
    if (!newError) {
      form.resetForm()
    }
  })
  
  const onSubmit = handleSubmit((values) => {
    emit('submit', { 
      code: props.code,
      ...values
    })
  })

  // Registrar la directiva globalmente en el componente
  defineExpose({})
  // @ts-ignore
  if (typeof defineNuxtPlugin === 'function') {
    // Nuxt 3 plugin registration (SSR compatible)
    defineNuxtPlugin((nuxtApp) => {
      nuxtApp.vueApp.directive('auto-animate', vAutoAnimate)
    })
  } else {
    // Vue 3 SFC registration
    // @ts-ignore
    if (typeof app !== 'undefined' && app.directive) {
      app.directive('auto-animate', vAutoAnimate)
    }
  }
  </script> 