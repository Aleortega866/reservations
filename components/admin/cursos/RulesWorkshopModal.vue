<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          <span class="block text-primary font-bold text-base mt-1">
            Configurar Reglas de Talleres
          </span>
        </DialogTitle>
        <DialogDescription>
          Selecciona el tipo de configuración que deseas realizar
        </DialogDescription>
      </DialogHeader>
      
             <div class="grid gap-4 py-4">
         <!-- Opción 1: Talleres elegibles por visita -->
         <div 
           class="p-3 sm:p-4 border border-muted rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
           @click="selectOption('workshops')"
         >
           <div class="flex items-center space-x-2 sm:space-x-3">
             <div class="flex-shrink-0">
               <div class="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:users" class="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
               </div>
             </div>
             <div class="flex-1 min-w-0">
               <h3 class="text-sm font-semibold text-foreground">Talleres Elegibles por Visita</h3>
               <p class="text-xs sm:text-sm text-muted-foreground mt-1">
                 Configura qué talleres estarán disponibles según el tipo de visita
               </p>
             </div>
             <Icon icon="lucide:chevron-right" width="16" height="16" class="text-muted-foreground flex-shrink-0" />
           </div>
         </div>

         <!-- Opción 2: Rango de selección de horas -->
         <div 
           class="p-3 sm:p-4 border border-muted rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
           @click="selectOption('hours')"
         >
           <div class="flex items-center space-x-2 sm:space-x-3">
             <div class="flex-shrink-0">
               <div class="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:clock" class="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
               </div>
             </div>
             <div class="flex-1 min-w-0">
               <h3 class="text-sm font-semibold text-foreground">Rango de Selección de Horas</h3>
               <p class="text-xs sm:text-sm text-muted-foreground mt-1">
                 Define los rangos de tiempo disponibles para las reservaciones
               </p>
             </div>
              <Icon icon="lucide:chevron-right" width="16" height="16" class="text-muted-foreground flex-shrink-0" />
           </div>
         </div>
       </div>

      <div class="flex justify-end space-x-2 mt-6">
        <Button variant="outline" @click="isOpen = false">
          Cancelar
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'

const emit = defineEmits(['select-option', 'update:open'])

const isOpen = defineModel('open', { type: Boolean, default: false })

const selectOption = (option: 'workshops' | 'hours') => {
  emit('select-option', option)
  isOpen.value = false
}
</script> 