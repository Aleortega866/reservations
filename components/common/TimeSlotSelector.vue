<template>
  <div class="w-full">
    <!-- Input principal que se expande -->
    <div class="relative rounded-full">

      <div class="flex items-center justify-between" @click="toggleShowOptions">
        <label class="text-sm block">{{ label }}</label>
      </div>

      <div class="space-y-0 overflow-hidden" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
        <div class="relative overflow-hidden mb-0">
            <Card 
            class="bg-transparent h-10 cursor-pointer border-0 py-1 px-2.5 transition-all duration-100 ease-in-out"
            :class="[
              showOptions ? 'rounded-t-[20px] rounded-b-none' : 'rounded-full',
              selectedTimeSlots.length > 0 ? 'bg-white/20' : 'bg-transparent'
            ]" 
            @click="toggleShowOptions"
            >
            <CardContent class="flex items-center justify-between py-1 px-2">
                <p :class="[
                  selectedTimeSlots.length > 0 ? 'text-base text-[#3C3C3B] font-semibold' : 'text-base text-[#7D7D7D] font-medium'
                ]">
                {{ selectedTimeSlotsText }}
                </p>

                <Icon v-if="!showOptions" icon="material-symbols:unfold-more" width="20" height="20" class="text-[#3C3C3B]" />
                <Icon v-if="showOptions" icon="material-symbols:unfold-less" width="20" height="20" class="text-[#3C3C3B]" />
            </CardContent>
            </Card>
        </div>
      </div>
    </div>

    <div 
      v-if="showOptions" 
     class="space-y-0 overflow-y-hidden bg-input-empty rounded-b-[20px] rounded-0"
      v-auto-animate="{ duration: 150, easing: 'ease-in-out' }"
    >
      <!-- Checkbox para seleccionar todos los horarios -->
      <div v-if="showAllTimeSlots" class="p-3 border-0">
        <div class="flex flex-col justify-start items-start space-x-2">
          <div class="flex justify-start items-center space-x-2 mb-3">
            <Checkbox 
              variant="secondary" 
              :model-value="selectAllTimeSlots" 
              @update:model-value="toggleSelectAll"
              class="w-4 h-4" 
            />
            <label class="text-sm font-medium text-foreground">
              Aplicar todos los horarios
            </label>
          </div>
          <Separator />
        </div>
      </div>

      <!-- Lista de horarios disponibles -->
      <div class="grid grid-cols-3 gap-y-2 p-3">
        <div 
          v-for="(timeSlot, index) in timeSlots" 
          :key="timeSlot.id" 
          class="flex justify-center border-0 transition-colors"
          :class="index === timeSlots.length - 1 ? 'rounded-b-md' : 'rounded-none'"
        >
          <div 
            class="w-9/12 flex items-center justify-center space-x-2 px-1 py-1 rounded-full m-1 cursor-pointer transition-all duration-200"
            :class="[
              isTimeSlotSelected(timeSlot.id) 
                ? 'bg-[#003DA6] text-secondary-foreground shadow-md' 
                : 'bg-background hover:bg-[#003DA6] hover:text-white',
              timeSlot.availability === 'no' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            ]"
            @click="timeSlot.availability !== 'no' && toggleTimeSlot(timeSlot.id)"
          >
            <div class="flex items-center justify-center space-x-2 p-0 m-0">
              <div class="flex items-center justify-center space-x-2">
                <span class="text-base font-semibold">
                  {{ timeSlot.time }}
                </span>
                <div class="size-3 rounded-full"
                :class="[
                  timeSlot.availability === 'high' ? 'bg-[#70BF73]' : '',
                  timeSlot.availability === 'medium' ? 'bg-[#F9D133]' : '',
                  timeSlot.availability === 'low' ? 'bg-[#B3B3B3]' : '',
                  timeSlot.availability === 'no' ? 'bg-muted-foreground/50' : ''
                ]"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showInfoAvailability" class="w-full">
        <!-- Descripcion de disponibilidad -->
        <hr class="w-11/12 border-t-2 border-[#B3B3B3] mx-auto my-7" />
        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 items-center justify-center mb-5 px-2">
          <div class="flex items-center justify-evenly md:justify-center-safe gap-x-5">
            <div class="size-4 bg-[#70BF73] border border-[#1D1D1D] rounded-full"></div>
            <div class="text-base font-medium">Disponibilidad Alta</div>
          </div>
          <div class="flex items-center justify-evenly md:justify-center-safe gap-x-5">
            <div class="size-4 bg-[#F9D133] border border-[#1D1D1D] rounded-full"></div>
            <div class="text-base font-medium">Disponibilidad Media</div>
          </div>
          <div class="flex items-center justify-evenly md:justify-center-safe gap-x-5">
            <div class="size-4 bg-[#EFA35B] border border-[#1D1D1D] rounded-full"></div>
            <div class="text-base font-medium">Disponibilidad Baja</div>
          </div>
          <div class="flex items-center justify-evenly md:justify-center-safe gap-x-5">
            <div class="size-4 bg-[#B3B3B3] border border-[#1D1D1D] rounded-full"></div>
            <div class="text-base font-medium">Día No disponible</div>
          </div>
        </div>
      </div>

      <!-- Mensaje de carga -->
      <div v-if="loading" class="p-3 bg-background border border-muted border-t-0 rounded-b-md">
        <span class="text-sm text-muted-foreground text-center block">
          Cargando horarios...
        </span>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="p-3 bg-background border border-red-200 border-t-0 rounded-b-md">
        <span class="text-sm text-red-600 text-center block">
          {{ error }}
        </span>
      </div>

      <!-- Mensaje si no hay horarios -->
      <div 
        v-if="!loading && !error && timeSlots.length === 0"
        class="p-3 bg-background border border-muted border-t-0 rounded-b-md"
      >
        <span class="text-sm text-muted-foreground text-center block">
          No hay horarios disponibles
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from '@iconify/vue'
import { vAutoAnimate } from "@formkit/auto-animate/vue";

// Tipos
interface TimeSlot {
  id: string;
  time: string;
  availability: string;
}

interface Props {
  modelValue?: string[];
  label?: string;
  timeSlots?: TimeSlot[];
  loading?: boolean;
  error?: string;
  showAllTimeSlots?: boolean;
  showInfoAvailability?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Horarios Disponibles',
  timeSlots: () => [
    { id: '1', time: '09:00', availability: 'high' },
    { id: '2', time: '10:00', availability: 'high' },
    { id: '3', time: '11:00', availability: 'high' },
    { id: '4', time: '12:00', availability: 'medium' },
    { id: '5', time: '13:00', availability: 'low' },
    { id: '6', time: '14:00', availability: 'no' },
    { id: '7', time: '15:00', availability: 'no' },
    { id: '8', time: '16:00', availability: 'no' },
    { id: '9', time: '17:00', availability: 'no' }
  ],
  loading: false,
  error: ''
});

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

// Variables reactivas
const showOptions = ref(false);
const selectedTimeSlots = ref<string[]>([]);

// Computed properties
const selectAllTimeSlots = computed(() => {
  return selectedTimeSlots.value.length > 0;
});

const selectedTimeSlotsText = computed(() => {
  if (selectedTimeSlots.value.length === 0) {
    return 'Selecciona un horario disponible';
  }
  // Buscar el horario seleccionado para mostrar su tiempo
  const selectedSlot = props.timeSlots.find(slot => slot.id === selectedTimeSlots.value[0]);
  return selectedSlot ? `Horario seleccionado: ${selectedSlot.time}` : 'Horario seleccionado';
});

// Funciones
const toggleShowOptions = () => {
  showOptions.value = !showOptions.value;
};

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    // Seleccionar el primer horario disponible
    const firstAvailableSlot = props.timeSlots.find((slot: TimeSlot) => slot.availability !== 'no');
    selectedTimeSlots.value = firstAvailableSlot ? [firstAvailableSlot.id] : [];
  } else {
    selectedTimeSlots.value = [];
  }
  emit('update:modelValue', selectedTimeSlots.value);
};

const isTimeSlotSelected = (id: string) => {
  return selectedTimeSlots.value.includes(id);
};

const toggleTimeSlot = (id: string) => {
  // Solo se puede seleccionar un horario a la vez
  selectedTimeSlots.value = [id];
  emit('update:modelValue', selectedTimeSlots.value);
  toggleShowOptions()
};

// Observar cambios en modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedTimeSlots.value = [...newValue];
    } else {
      selectedTimeSlots.value = [];
    }
  },
  { immediate: true }
);
</script>
