<template>
  <div class="container mx-auto p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Prueba de Calendario con Disponibilidad</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Calendario sin disponibilidad -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Calendario Normal</h2>
          <CalendarField
            v-model="selectedDate1"
            label="Selecciona una fecha"
            placeholder="Fecha sin disponibilidad"
          />
          <div class="text-sm text-gray-600">
            <p><strong>Fecha seleccionada:</strong> {{ selectedDate1 ? selectedDate1.toLocaleDateString('es-MX') : 'Ninguna' }}</p>
          </div>
        </div>

        <!-- Calendario con disponibilidad -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Calendario con Disponibilidad</h2>
          <CalendarField
            v-model="selectedDate2"
            label="Selecciona una fecha disponible"
            placeholder="Fecha con disponibilidad"
            :show-availability="true"
          />
          <div class="text-sm text-gray-600">
            <p><strong>Fecha seleccionada:</strong> {{ selectedDate2 ? selectedDate2.toLocaleDateString('es-MX') : 'Ninguna' }}</p>
          </div>
        </div>
      </div>

      <!-- Leyenda de colores -->
      <div class="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Leyenda de Disponibilidad</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-green-500 rounded border"></div>
            <div>
              <p class="font-medium text-sm">Disponibilidad Alta</p>
              <p class="text-xs text-gray-500">100% disponible</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-yellow-500 rounded border"></div>
            <div>
              <p class="font-medium text-sm">Disponibilidad Media</p>
              <p class="text-xs text-gray-500">50-99% disponible</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-red-500 rounded border"></div>
            <div>
              <p class="font-medium text-sm">Disponibilidad Baja</p>
              <p class="text-xs text-gray-500">1-49% disponible</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-gray-400 rounded border"></div>
            <div>
              <p class="font-medium text-sm">No Disponible</p>
              <p class="text-xs text-gray-500">0% disponible</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de la API -->
      <div class="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Información de la API</h3>
        <div class="text-sm text-gray-700 space-y-2">
          <p><strong>Endpoint:</strong> GET /api/Form/GetMonthlyAvailabilityAsync?month=9&year=2025</p>
          <p><strong>Datos de ejemplo:</strong> Septiembre 2025 con días 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 30 disponibles</p>
          <p><strong>Colores:</strong> Verde (#22c55e) para todos los días disponibles</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CalendarField from '@/components/common/CalendarField.vue'

// Configurar la página
definePageMeta({
  title: 'Prueba de Calendario con Disponibilidad'
})

const selectedDate1 = ref<Date | null>(null)
const selectedDate2 = ref<Date | null>(null)
</script>
