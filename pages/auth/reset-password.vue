<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-6">
      <!-- Token validation message -->
      <div v-if="validatingToken" class="text-center">
        <div class="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm text-muted-foreground">Validando token...</p>
      </div>

      <!-- Invalid token message -->
      <div v-else-if="!tokenValid" class="text-center space-y-4">
        <div class="p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">
            El enlace de recuperación es inválido o ha expirado.
          </p>
        </div>
        <Button @click="navigateTo('/auth/forgot-password')" class="w-full">
          Solicitar nuevo enlace
        </Button>
      </div>

      <!-- New Password Form -->
      <NewPasswordForm
        v-else
        :loading="loading"
        :error="error"
        :token="resetCode || resetToken"
        @submit="handleResetPassword"
        @login="navigateTo('/auth/login')"
        @register="navigateTo('/auth/register')"
      />

      <!-- Chat button -->
      <div class="fixed bottom-4 right-4">
        <Button size="sm" class="rounded-full bg-muted-foreground hover:bg-muted-foreground/90 text-background">
          <Icon icon="lucide:message-circle" width="16" height="16" class="mr-2" />
          Chat!
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import NewPasswordForm from '@/components/auth/NewPasswordForm.vue'
import { authService } from '@/lib/api/services/auth'
import { useToast } from '@/composables/ui/useToast'
import { useErrorHandler } from '@/composables/ui/useErrorHandler'

// Estados del componente
const loading = ref(false)
const error = ref(null)
const resetToken = ref('')
const validatingToken = ref(true)
const tokenValid = ref(false)

// Toast system
const { showSuccess, showError, showInfo, showWarning } = useToast()
const { getPasswordResetErrorMessage } = useErrorHandler()

// Obtener token de la URL - ahora maneja tanto token como code
const route = useRoute()
const resetCode = ref('')

onMounted(async () => {
  // Obtener el parámetro correspondiente
  if (route.query.code) {
    resetCode.value = route.query.code
  } else if (route.query.token) {
    resetToken.value = route.query.token
  }
  const hasToken = resetToken.value || resetCode.value
  
  if (!hasToken) {
    tokenValid.value = false
    validatingToken.value = false
    showError('Token inválido', 'El enlace de recuperación no contiene un token válido')
    return
  }

  // Toast informativo de validación
  showInfo('Validando enlace', 'Verificando que el enlace sea válido...')

  try {
    // Usar el token o código que tengamos disponible
    const tokenToValidate = resetCode.value || resetToken.value
    
    // Validar el token
    const response = await authService.confirmTokenAccess({ email: '', code: tokenToValidate })
    tokenValid.value = response.isValid
    
    if (response.isValid) {
      showSuccess('Enlace válido', 'Puedes proceder a cambiar tu contraseña')
    } else {
      showWarning('Enlace expirado', 'El enlace ha expirado o ya fue utilizado')
    }
  } catch (err) {
    console.error('Error validando token:', err)
    tokenValid.value = false
    showError('Error de validación', getPasswordResetErrorMessage(err))
  } finally {
    validatingToken.value = false
  }
})

const handleResetPassword = async (formData) => {
  loading.value = true
  error.value = null
  
  // Toast informativo de inicio
  showInfo('Procesando cambio', 'Estamos actualizando tu contraseña...')
  
  try {
    await authService.resetPassword({
      token: formData.token,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    })
    
    // Toast de éxito
    showSuccess('¡Contraseña actualizada!', 'Tu contraseña ha sido cambiada exitosamente')
    
    // Redirigir al login con mensaje de éxito
    await navigateTo('/auth/login?message=password-reset-success')
    
  } catch (err) {
    error.value = err
    console.error('Error al cambiar contraseña:', err)
    
    // Toast de error
    showError('Error al cambiar contraseña', getPasswordResetErrorMessage(err))
  } finally {
    loading.value = false
  }
}


</script> 