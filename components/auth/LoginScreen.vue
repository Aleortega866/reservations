<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl text-center">Iniciar Sesión</CardTitle>
        <CardDescription class="text-center">
          Ingresa tus credenciales para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Correo electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              v-model="email"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              v-model="password"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const email = ref('')
const password = ref('')
const loading = ref(false)


</script> 