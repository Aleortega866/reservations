<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Prueba de Cambio de Contraseña</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Componente original -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Componente Original</h2>
        <ChangePasswordDialog>
          <template #trigger>
            <Button variant="outline">Abrir Modal de Cambio de Contraseña</Button>
          </template>
        </ChangePasswordDialog>
      </div>
      
      <!-- Componente de prueba -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Componente de Prueba</h2>
        <TestChangePassword />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog.vue'
import TestChangePassword from '@/components/profile/TestChangePassword.vue'
import { Button } from '@/components/ui/button'

useHead({
  title: 'Prueba de Cambio de Contraseña'
})
</script>
