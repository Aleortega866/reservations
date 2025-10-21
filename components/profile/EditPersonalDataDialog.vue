<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child class="hidden">
      <slot name="trigger">
        <Button variant="outline">Editar datos</Button>
      </slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-xl text-start">Editar datos personales</DialogTitle>
        <DialogDescription class="text-sm text-start">
          Modifica tu información personal y preferencias de comunicación.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="(event) => {
        try {
          onSubmit()
        } catch (error) {
          console.error('Error en form submit handler:', error)
          showError('Error', 'Error al procesar el formulario')
        }
      }" class="space-y-4 py-2">
        <div>
          <label class="block text-sm font-medium mb-1">Nombre de Usuario</label>
          <Input
            placeholder="Ingresa tu nombre de usuario"
            v-model="username"
          />
        </div>
        
        <div class="flex items-start space-x-2">
          <Checkbox 
            variant="secondary"
            class="mt-1" 
            v-model="receiveNewsletters"
          />
          <span class="text-sm text-muted-foreground">
            Me gustaría recibir únicamente información sobre actividades educativas, talleres, charlas, sesiones digitales y otros eventos relacionados.
          </span>
        </div>
        
        <div class="flex items-start space-x-2">
          <Checkbox 
            variant="secondary"
            class="mt-1" 
            v-model="acceptDataUsage"
            disabled
          />
          <span class="text-sm text-muted-foreground">
            Autorizo el uso de mis datos personales con fines comerciales.
          </span>
        </div>
        
        <DialogFooter class="pt-4 flex flex-col lg:flex-row gap-3 justify-end">

          <Button type="submit" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </Button>

          <DialogClose as-child>
            <Button variant="outline" :disabled="loading">
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useUsers } from '@/composables/auth/useUsers'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/ui/useToast'



const open = ref(false)
const { updateUser, isLoading: loading } = useUsers()
const authStore = useAuthStore()
const { showSuccess, showError } = useToast()
const currentUserData = ref<any>(null) // Para guardar los datos completos del usuario
const emit = defineEmits(['update-personal-data', 'update-completed'])

// Refs para los campos del formulario
const username = ref('')
const receiveNewsletters = ref(false)
const acceptDataUsage = ref(false)
const newEmail = ref('')

async function onSubmit() {
  try {
    console.log('onSubmit ejecutado')
    
    const userEmail = authStore.user?.email
    if (!userEmail) {
      console.error('Error: No se encontró el email del usuario autenticado')
      showError('Error', 'No se encontró el email del usuario autenticado')
      return
    }
    
    if (!currentUserData.value) {
      console.error('Error: No se encontraron los datos completos del usuario')
      showError('Error', 'No se encontraron los datos completos del usuario')
      return
    }
    
    const updateData: any = {
      ...currentUserData.value,
      userName: username.value,
      enableMarketing: receiveNewsletters.value
    }
    
    console.log('Datos a actualizar:', updateData)
    
    const result = await updateUser(updateData)
    console.log('Resultado de updateUser:', result)
    
    if (result) {
      showSuccess('Éxito', 'Datos personales actualizados correctamente')
      try {
        const emitData = { username: username.value }
        console.log('Emitiendo datos:', emitData)
        emit('update-personal-data', emitData)
        console.log('Evento update-personal-data emitido desde EditPersonalDataDialog')
        
        // Emitir evento de actualización completada
        emit('update-completed')
        console.log('Evento update-completed emitido')
      } catch (error) {
        console.error('Error al emitir evento update-personal-data:', error)
        showError('Error', 'Error al procesar la actualización')
      }
      
      open.value = false
      username.value = ''
      receiveNewsletters.value = false
      acceptDataUsage.value = false
      newEmail.value = ''
    }
  } catch (err: any) {
    console.error('Error en onSubmit:', err)
    showError('Error', err?.message || 'No se pudieron actualizar los datos del usuario')
  }
}

function openWithData(data: any, fullUserData?: any) {
  try {
    // Validar que data existe
    if (!data) {
      console.error('Error: data es undefined o null')
      showError('Error', 'No se pudieron cargar los datos del usuario')
      return
    }
    
    if (fullUserData) {
      currentUserData.value = fullUserData
    }
    
    username.value = data.username || ''
    receiveNewsletters.value = data.receiveNewsletters || false
    acceptDataUsage.value = data.acceptDataUsage || false
    newEmail.value = data.email || ''
    open.value = true
  } catch (error) {
    console.error('Error en openWithData:', error)
    showError('Error', 'Error al abrir el diálogo de edición')
  }
}

defineExpose({
  openWithData
})
</script> 