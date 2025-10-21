<template>
  <div class="space-y-4">
    <!-- Tab de Material Didáctico -->
    <div v-if="tab === 'didactic'" class="space-y-4">
      <div class="space-y-2">
        <h3 class="font-medium">Materiales didácticos asociados a tu reservación</h3>
        <p class="text-sm">
          Según tu nivel académico seleccionado con el objetivo de vincular tu visita al museo, 
          puedes servirse para "guiar *informar* ante la SEP en relación con tus campos formativos.
        </p>
        <p class="text-sm">
          Además, te proporcionaremos material didáctico para antes y después de la visita que 
          te servirá como material de apoyo con tus grupos.
        </p>
      </div>

      <div class="space-y-3">
        <Card 
          v-for="level in educationalLevels" 
          :key="level" 
          @click="$emit('selectLevel', level)" 
          class="cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <CardContent class="flex items-center justify-between p-4">
            <span class="font-medium">{{ level }}</span>
            <Icon icon="lucide:chevron-right" width="16" height="16" />
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Tab de Rutas Sugeridas -->
    <div v-if="tab === 'routes'" class="space-y-4">
      <div class="space-y-2">
        <h3 class="font-medium">Rutas sugeridas asociadas a tu reservación</h3>
        <p class="text-sm">
          Estas rutas se crean a partir de la información que proporcionaste en el formulario de tu reservación.
        </p>
        <p class="text-sm">
          También podrás encontrar rutas alternativas sugeridas, pre seleccionadas por nuestros expertos del MIDE.
        </p>
      </div>

      <div class="space-y-3">
        <Card 
          v-for="floor in floors" 
          :key="floor" 
          @click="$emit('selectFloor', floor)" 
          class="cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <CardContent class="flex items-center justify-between p-4">
            <span class="font-medium">{{ floor }}</span>
            <Icon icon="lucide:chevron-right" width="16" height="16" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/vue'

const props = defineProps({
  tab: {
    type: String,
    required: true
  }
})

defineEmits(['selectLevel', 'selectFloor'])

const educationalLevels = [
  'Primaria',
  'Secundaria',
  'Media Superior',
  'Superior'
]

const floors = [
  '1er Piso',
  '2do Piso',
  '3er Piso',
  '4to Piso'
]
</script> 