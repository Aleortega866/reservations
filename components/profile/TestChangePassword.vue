<template>
  <div class="p-4 border rounded-md">
    <h3 class="text-lg font-semibold mb-4">Prueba de Cambio de Contraseña</h3>
    
    <form @submit.prevent="testChangePassword" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Email:</label>
        <input v-model="formData.email" type="email" class="w-full p-2 border rounded" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Contraseña Actual:</label>
        <input v-model="formData.password" type="password" class="w-full p-2 border rounded" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Nueva Contraseña:</label>
        <input v-model="formData.newPassword" type="password" class="w-full p-2 border rounded" />
      </div>
      
      <button type="submit" :disabled="loading" class="w-full bg-blue-500 text-white p-2 rounded">
        {{ loading ? 'Probando...' : 'Probar Cambio de Contraseña' }}
      </button>
    </form>
    
    <div v-if="result" class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
      <h4 class="font-semibold text-green-800">Resultado:</h4>
      <pre class="text-sm text-green-700">{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded">
      <h4 class="font-semibold text-red-800">Error:</h4>
      <pre class="text-sm text-red-700">{{ JSON.stringify(error, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useApiAuth } from '@/lib/api/composables/auth'
import { useToast } from '@/composables/ui/useToast'

const { resetPasswordSignIn, loading } = useApiAuth()
const { showSuccess, showError } = useToast()

const formData = ref({
  email: '',
  password: '',
  newPassword: ''
})

const result = ref(null)
const error = ref(null)

async function testChangePassword() {
  console.log('🧪 Iniciando prueba de cambio de contraseña...')
  
  try {
    result.value = null
    error.value = null
    
    console.log('🧪 Datos del formulario:', formData.value)
    
    const response = await resetPasswordSignIn({
      email: formData.value.email || null,
      password: formData.value.password || null,
      newPassword: formData.value.newPassword || null
    })
    
    console.log('🧪 Respuesta exitosa:', response)
    result.value = response
    
    showSuccess('Prueba Exitosa', 'El servicio funcionó correctamente')
  } catch (err: any) {
    console.error('🧪 Error en la prueba:', err)
    error.value = err
    
    showError('Error en Prueba', err?.message || 'Error desconocido')
  }
}
</script>
