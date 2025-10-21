<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Gestor de Estados de Reservación</h1>

    <!-- Información de la reservación actual -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <h2 class="text-lg font-semibold mb-2">Reservación Actual</h2>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">ID:</span>
          <span class="text-gray-600">{{ currentReservationId || "No disponible" }}</span>
        </div>
        <div>
          <span class="font-medium">Tipo:</span>
          <span class="text-gray-600">{{
            currentAttendeeType || "No seleccionado"
          }}</span>
        </div>
        <div>
          <span class="font-medium">Pasos completados:</span>
          <span class="text-gray-600">{{ completedStepsCount }}/3</span>
        </div>
        <div>
          <span class="font-medium">Estado:</span>
          <span :class="areAllStepsComplete ? 'text-green-600' : 'text-orange-600'">
            {{ areAllStepsComplete ? "Completa" : "En progreso" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Controles de prueba -->
    <div class="bg-white border rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Controles de Prueba</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Cargar pasos -->
        <div>
          <label class="block text-sm font-medium mb-2"
            >Cargar Pasos de Reservación</label
          >
          <div class="flex gap-2">
            <input
              v-model="testReservationId"
              type="number"
              placeholder="ID de reservación"
              class="flex-1 px-3 py-2 border rounded-md"
            />
            <select v-model="testAttendeeType" class="px-3 py-2 border rounded-md">
              <option value="general">General</option>
              <option value="empresarial">Empresarial</option>
              <option value="curso-verano">Curso de Verano</option>
            </select>
            <button
              @click="loadTestSteps"
              :disabled="isLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isLoading ? "Cargando..." : "Cargar" }}
            </button>
          </div>
          <!-- Botones de prueba rápida -->
          <div class="mt-2 flex gap-2">
            <button
              @click="testCompanyReservation"
              :disabled="isLoading"
              class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Probar Company (ID: 16)
            </button>
            <button
              @click="testGeneralReservation"
              :disabled="isLoading"
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Probar General (ID: 456)
            </button>
            <button
              @click="forceReloadAllSteps"
              :disabled="isLoading"
              class="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Forzar Recarga
            </button>
          </div>
        </div>

        <!-- Marcar pasos como completos -->
        <div>
          <label class="block text-sm font-medium mb-2">Marcar Paso como Completo</label>
          <div class="flex gap-2">
            <select v-model="testStepToMark" class="px-3 py-2 border rounded-md">
              <option value="1">Paso 1</option>
              <option value="2">Paso 2</option>
              <option value="3">Paso 3</option>
            </select>
            <button
              @click="markTestStepComplete"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Marcar Completo
            </button>
            <button
              @click="markTestStepIncomplete"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Marcar Incompleto
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado de los pasos -->
    <div class="bg-white border rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Estado de los Pasos</h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="step in 3"
          :key="step"
          class="border rounded-lg p-4"
          :class="
            getStepVisualState(step).status === 'complete'
              ? 'border-green-200 bg-green-50'
              : getStepVisualState(step).status === 'available'
              ? 'border-blue-200 bg-blue-50'
              : 'border-gray-200 bg-gray-50'
          "
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium">Paso {{ step }}</h4>
            <div class="flex items-center gap-2">
              <Icon
                v-if="getStepVisualState(step).showCheck"
                icon="mdi:check-circle"
                class="w-5 h-5 text-green-600"
              />
              <Icon
                v-else-if="getStepVisualState(step).isClickable"
                icon="mdi:circle-outline"
                class="w-5 h-5 text-blue-600"
              />
              <Icon v-else icon="mdi:lock" class="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div class="text-sm text-gray-600 space-y-1">
            <div>
              <span class="font-medium">Estado:</span>
              {{
                getStepVisualState(step).status === "complete"
                  ? "Completo"
                  : getStepVisualState(step).status === "available"
                  ? "Disponible"
                  : "Bloqueado"
              }}
            </div>
            <div>
              <span class="font-medium">Navegable:</span>
              {{ getStepVisualState(step).isClickable ? "Sí" : "No" }}
            </div>
            <div v-if="getStepData(step)">
              <span class="font-medium">Datos:</span>
              <span class="text-green-600">Disponibles</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="bg-white border rounded-lg p-4">
      <h3 class="text-lg font-semibold mb-4">Resumen</h3>

      <div class="space-y-2 text-sm">
        <div>
          <span class="font-medium">Total de pasos:</span> {{ getStepsSummary().total }}
        </div>
        <div>
          <span class="font-medium">Pasos completados:</span>
          {{ getStepsSummary().completed }}
        </div>
        <div>
          <span class="font-medium">Pasos incompletos:</span>
          {{ getStepsSummary().incomplete }}
        </div>
        <div>
          <span class="font-medium">Progreso:</span> {{ getStepsSummary().percentage }}%
        </div>
        <div>
          <span class="font-medium">Siguiente paso:</span>
          {{
            getStepsSummary().nextStep
              ? `Paso ${getStepsSummary().nextStep}`
              : "Todos completos"
          }}
        </div>
        <div>
          <span class="font-medium">Reservación completa:</span>
          <span
            :class="getStepsSummary().allComplete ? 'text-green-600' : 'text-orange-600'"
          >
            {{ getStepsSummary().allComplete ? "Sí" : "No" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";

// Composable para gestión de pasos
const {
  isLoading,
  currentReservationId,
  currentAttendeeType,
  isStepComplete,
  getStepData,
  areAllStepsComplete,
  completedStepsCount,
  getStepVisualState,
  loadReservationSteps,
  markStepComplete,
  markStepIncomplete,
  getStepsSummary,
} = useReservationStepLoader();

// Variables para controles de prueba
const testReservationId = ref<number | null>(null);
const testAttendeeType = ref<string>("general");
const testStepToMark = ref<number>(1);

// Función para cargar pasos de prueba
const loadTestSteps = async () => {
  if (!testReservationId.value) {
    alert("Por favor ingresa un ID de reservación");
    return;
  }

  await loadReservationSteps(testReservationId.value, testAttendeeType.value);
};

// Función para marcar un paso como completo
const markTestStepComplete = () => {
  markStepComplete(testStepToMark.value, { testData: "Datos de prueba" });
};

// Función para marcar un paso como incompleto
const markTestStepIncomplete = () => {
  markStepIncomplete(testStepToMark.value);
};

// Funciones de prueba rápida
const testCompanyReservation = async () => {
  testReservationId.value = 16;
  testAttendeeType.value = "empresarial";
  await loadTestSteps();
};

const testGeneralReservation = async () => {
  testReservationId.value = 456;
  testAttendeeType.value = "general";
  await loadTestSteps();
};

// Función para forzar recarga de todos los pasos
const forceReloadAllSteps = async () => {
  if (!testReservationId.value || !testAttendeeType.value) {
    alert("Por favor selecciona un ID de reservación y tipo primero");
    return;
  }

  console.log("🔄 Forzando recarga de todos los pasos...");
  await loadReservationSteps(testReservationId.value, testAttendeeType.value, true);
};
</script>
