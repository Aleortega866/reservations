<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-4">Ejemplo de Calendario con Disponibilidad</h2>
      <p class="text-gray-600 mb-6">
        Este ejemplo muestra cómo usar el componente CalendarField con disponibilidad habilitada.
        Los colores en la parte inferior de cada día indican el nivel de disponibilidad.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Calendario sin disponibilidad -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Calendario Normal</h3>
        <CalendarField
          v-model="selectedDate1"
          label="Selecciona una fecha"
          placeholder="Fecha sin disponibilidad"
        />
        <p class="text-sm text-gray-500">Fecha seleccionada: {{ selectedDate1 || 'Ninguna' }}</p>
      </div>

      <!-- Calendario con disponibilidad -->
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">Calendario con Disponibilidad</h3>
        <CalendarField
          v-model="selectedDate2"
          label="Selecciona una fecha disponible"
          placeholder="Fecha con disponibilidad"
          :show-availability="true"
        />
        <p class="text-sm text-gray-500">Fecha seleccionada: {{ selectedDate2 || 'Ninguna' }}</p>
      </div>
    </div>

    <!-- Leyenda de colores -->
    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
      <h4 class="font-semibold mb-3">Leyenda de Disponibilidad</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-green-500 rounded"></div>
          <span class="text-sm">Disponibilidad Alta</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-yellow-500 rounded"></div>
          <span class="text-sm">Disponibilidad Media</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-red-500 rounded"></div>
          <span class="text-sm">Disponibilidad Baja</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-gray-400 rounded"></div>
          <span class="text-sm">No Disponible</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CalendarField from '@/components/common/CalendarField.vue'

const selectedDate1 = ref<Date | null>(null)
const selectedDate2 = ref<Date | null>(null)
</script>
