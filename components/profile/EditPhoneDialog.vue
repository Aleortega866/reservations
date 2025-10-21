<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger">
        <Button variant="outline">Editar teléfono</Button>
      </slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-xl text-start">Editar teléfono de contacto</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="(e) => handleSubmit(onSubmit)(e)" class="space-y-4 py-2">
        <FormField name="phone" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Teléfono de contacto</FormLabel>
            <FormControl>
              <Input
                type="tel"
                name="phoneNumber"
                placeholder="Ej: +52 55 1234 5678"
                :model-value="componentField.modelValue ?? ''"
                :onUpdate:modelValue="componentField['onUpdate:modelValue'] || (() => {})"

              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter class="pt-6">
          <DialogClose as-child>
            <Button variant="ghost" class="w-full mt-2">Cancelar</Button>
          </DialogClose>
          <Button 
            type="button" 
            :disabled="loading" 
            class="w-full"
            @click="() => handleSubmit(onSubmit)()"
          >
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Icon } from '@iconify/vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/ui/useToast'
import { useUsers } from '@/composables/auth/useUsers'

// No necesitamos props ya que usamos openWithData

const authStore = useAuthStore()
const { showSuccess, showError } = useToast()
const { updateUser, searchUserByEmail, isLoading: loading } = useUsers()
const currentUserData = ref<any>(null) // Para guardar los datos completos del usuario

const emit = defineEmits<{
  'update-phone': [phone: string]
}>()

const open = ref(false)

const schema = toTypedSchema(z.object({
  phone: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Formato de teléfono inválido')
}))



// Inicializar el formulario después del schema
const { handleSubmit, errors, values, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: ''
  }
})

// Función para abrir el diálogo con datos
const openWithData = (phone: string, fullUserData?: any) => {
  // Guardar los datos completos del usuario
  if (fullUserData) {
    currentUserData.value = fullUserData
  }
  
  // Resetear el formulario con el nuevo teléfono
  resetForm({ values: { phone: phone || '' } })
  
  // Abrir el diálogo
  open.value = true
}


const onSubmit = async (values: any) => {
  try {
    const userEmail = authStore.user?.email
    
    if (!userEmail) {
      showError('Error', 'No se encontró el email del usuario autenticado')
      return
    }
    
    if (!currentUserData.value) {
      showError('Error', 'No se encontraron los datos completos del usuario')
      return
    }
    
    // Crear objeto de actualización con todos los datos del usuario y solo el teléfono modificado
    const updateData: any = {
      ...currentUserData.value,
      phoneNumber: values.phone
    }
    
    const result = await updateUser(updateData)
    
    if (result) {
      showSuccess('Éxito', 'Teléfono actualizado correctamente')
      
      // Actualizar el local storage con la nueva información
      try {
          const currentUserData = localStorage.getItem('auth_user')
          if (currentUserData) {
            const parsedUserData = JSON.parse(currentUserData)
            const updatedUserDataForStorage = {
              ...parsedUserData,
              phoneNumber: values.phone
            }
            localStorage.setItem('auth_user', JSON.stringify(updatedUserDataForStorage))
          }
      } catch (updateError) {
        console.error('Error al actualizar local storage:', updateError)
        // No mostrar error al usuario ya que la actualización principal fue exitosa
      }
      
      // Emitir el evento con el nuevo teléfono
      emit('update-phone', values.phone)
      
      // Cerrar el diálogo directamente sin resetear el formulario
      open.value = false
    }
  } catch (err: any) {
    showError('Error', err?.message || 'No se pudo actualizar el teléfono')
  }
}

// Exponer la función openWithData
defineExpose({
  openWithData
})
</script> 