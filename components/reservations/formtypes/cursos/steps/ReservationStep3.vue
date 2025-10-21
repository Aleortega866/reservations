<template>
  <div class="space-y-4">

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="font-medium">Interés por algún taller</h3>
        <button 
          v-if="selectedWorkshops.length > 0"
          @click="navigateToWorkshops" 
          class="text-sm text-primary underline hover:text-primary/80"
        >
          Modificar talleres
        </button>
      </div>
      
      <!-- Card para seleccionar talleres si no hay ninguno seleccionado -->
      <Card 
        v-if="selectedWorkshops.length === 0"
        @click="navigateToWorkshops"
        class="bg-muted cursor-pointer hover:bg-muted/50 transition-colors rounded-md py-2"
      >
        <CardContent class="flex items-center justify-between py-1 px-2">
          <p class="text-sm text-muted-foreground">Por favor selecciona el o los talleres de tu interés</p>
          <Icon icon="lucide:chevron-right" width="16" height="16" class="text-muted-foreground" />
        </CardContent>
      </Card>

      <!-- Grilla de talleres seleccionados -->
      <div v-else class="grid grid-cols-3 gap-3">
        <div 
          v-for="workshop in selectedWorkshopsData" 
          :key="workshop.id"
          class="bg-muted rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          @click="openWorkshopContent(workshop)"
        >
          <div class="aspect-square bg-muted-foreground/20 rounded-md flex items-center justify-center mb-2">
            <Icon 
              v-if="workshop.type === 'video'"
              icon="ri:play-circle-fill" 
              class="w-8 h-8 text-white"
            />
            <Icon 
              v-else-if="workshop.type === 'pdf'"
              icon="ri:file-pdf-fill" 
              class="w-8 h-8 text-white"
            />
            <Icon 
              v-else
              icon="ri:image-fill" 
              class="w-8 h-8 text-white"
            />
          </div>
          <p class="text-xs text-center font-medium">{{ workshop.title }}</p>
        </div>
      </div>

      <!-- Modal para visualizar contenido del taller -->
      <WorkshopContentViewer 
        v-if="selectedWorkshopContent"
        :workshop="selectedWorkshopContent"
        v-model:open="showContentModal"
      />
    </div>
    
    <div class="flex items-center space-x-1 mb-4">
      <Icon
        icon="ri:information-2-fill"
        width="20"
        height="20"
        class="text-muted-foreground"
      />
      <p class="text-xs italic text-muted-foreground">
        Recuerda que puedes modificar los talleres de tu interés las veces que desees
      </p>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <Label class="text-sm font-medium">Señala el medio por el que te enteraste del MIDE</Label>
        <Select v-model="data.source">
          <SelectTrigger class="bg-muted border-0 w-full">
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="option in informationSources" 
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">Forma de pago</Label>
        <Select v-model="data.paymentMethod">
          <SelectTrigger class="bg-muted border-0 w-full">
            <SelectValue placeholder="Por favor, selecciona una opción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="option in paymentMethods" 
              :key="option.value"
              :value="option.value"
            >
              <span class="whitespace-normal text-left leading-relaxed truncate max-w-[300px]">
                {{ option.label }}
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center space-x-1 mb-4">
        <Icon
          icon="ri:information-2-fill"
          width="20"
          height="20"
          class="text-muted-foreground"
        />
        <p class="text-xs italic text-muted-foreground">
          Si requieres factura, presenta la constancia de situación fiscal el día de la visita.
        </p>
      </div>

      <div class="space-y-2">
        <div class="flex items-start space-x-2">
          <Checkbox v-model="data.confirmTerms" id="confirm-terms" class="mt-1" />
          <Label for="confirm-terms" class="text-sm">
            Confirmo que la información proporcionada es correcta y acepto los términos y condiciones para la visita
          </Label>
        </div>
      </div>

      <div class="p-4 space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm font-bold">7 asistentes</span>
          <span class="text-sm">$2,100</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-medium">Total:</span>
          <span class="font-bold text-lg">$2,100</span>
        </div>
        <p class="text-xs italic text-muted-foreground mt-2">
          <span class="font-bold">Monto a pagar aproximado.</span> El cálculo es aproximado, al momento de la asistencia se confirmará el número de asistentes así cómo promociones aplicadas.
        </p>
      </div>
    </div>

    <div class="flex space-x-2 mt-6">
      <Button @click="$emit('back')" variant="outline" class="flex-1">
        Anterior
      </Button>
      <Button 
        @click="$emit('complete', data)" 
        class="flex-1 bg-primary hover:bg-primary/90"
        :disabled="selectedWorkshops.length === 0"
      >
        Terminar
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/vue'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import WorkshopContentViewer from '@/components/workshops/WorkshopContentViewer.vue'
import { useWorkshopsStore } from '@/stores/workshops'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete', 'back'])

// Usar el store de talleres
const workshopsStore = useWorkshopsStore()
const selectedWorkshops = computed(() => workshopsStore.selectedWorkshops)
const selectedWorkshopsData = computed(() => workshopsStore.selectedWorkshopsData)

// Opciones para los selects
const informationSources = [
  { value: 'television', label: 'Televisión' },
  { value: 'radio', label: 'Radio' },
  { value: 'prensa', label: 'Prensa' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter (X)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'billboards', label: 'Vallas publicitarias (Billboards)' },
  { value: 'mupis', label: 'Publicidad en paradas de autobús (Mupis)' },
  { value: 'folletos', label: 'Folletos o volantes' },
  { value: 'fachada', label: 'Visualización directa en la fachada del edificio' },
  { value: 'recomendacion', label: 'Recomendación' },
  { value: 'sitio_web', label: 'Sitio web del museo' },
  { value: 'otra', label: 'Otra (especificar)' }
]

const paymentMethods = [
  { value: 'efectivo', label: 'En efectivo (pago en la taquilla)' },
  { value: 'tarjeta', label: 'Tarjeta de crédito y/o débito (únicamente pago en la taquilla)' }
]

// Estado para el modal de contenido
const showContentModal = ref(false)
const selectedWorkshopContent = ref(null)

// Navegación a la vista de talleres
const navigateToWorkshops = () => {
  navigateTo('/workshops')
}

// Visualización de contenido
const openWorkshopContent = (workshop) => {
  selectedWorkshopContent.value = workshop
  showContentModal.value = true
}
</script> 