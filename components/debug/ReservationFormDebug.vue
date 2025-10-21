<template>
  <div
    v-if="showDebug"
    class="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50"
  >
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-bold">Debug Formulario</h3>
      <button @click="showDebug = false" class="text-gray-400 hover:text-white">×</button>
    </div>

    <div class="space-y-2">
      <div><strong>Tipo:</strong> {{ selectedAttendeeType || "No seleccionado" }}</div>
      <div><strong>Paso:</strong> {{ currentStep }}/3</div>
      <div><strong>Formulario iniciado:</strong> {{ isFormStarted ? "Sí" : "No" }}</div>
      <div>
        <strong>Puede mostrar formulario:</strong> {{ canShowForm ? "Sí" : "No" }}
      </div>

      <div class="border-t border-gray-600 pt-2">
        <strong>Datos guardados:</strong>
        <div class="mt-1">
          <div>Paso 1: {{ Object.keys(getStepData(1)).length }} campos</div>
          <div>Paso 2: {{ Object.keys(getStepData(2)).length }} campos</div>
          <div>Paso 3: {{ Object.keys(getStepData(3)).length }} campos</div>
        </div>
      </div>

      <div class="border-t border-gray-600 pt-2 space-x-2 space-y-2">
        <button @click="resetForm" class="bg-red-600 px-2 py-1 rounded text-xs">
          Resetear Formulario
        </button>

        <button
          @click="testSetGeneral"
          class="bg-green-600 text-white px-2 py-1 rounded text-xs"
        >
          Set General
        </button>
        <button
          @click="testSetEscolar"
          class="bg-blue-600 text-white px-2 py-1 rounded text-xs"
        >
          Set Escolar
        </button>
        <button
          @click="testSetEmpresarial"
          class="bg-purple-600 text-white px-2 py-1 rounded text-xs"
        >
          Set Empresarial
        </button>
        <button
          @click="testReset"
          class="bg-red-600 text-white px-2 py-1 rounded text-xs"
        >
          Reset
        </button>
        <button
          @click="clearLocalStorage"
          class="bg-orange-600 text-white px-2 py-1 rounded text-xs"
        >
          Limpiar localStorage
        </button>
      </div>
    </div>
  </div>

  <!-- Botón para mostrar debug -->
  <button
    v-if="!showDebug"
    @click="showDebug = true"
    class="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full text-xs z-50"
    title="Mostrar debug"
  >
    🐛
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useReservationFormStore } from "@/stores/reservation-form";

const reservationFormStore = useReservationFormStore();

const showDebug = ref(false);

const store = useReservationFormStore();

const selectedAttendeeType = computed(() => store.selectedAttendeeType);
const currentStep = computed(() => store.currentStep);
const isFormStarted = computed(() => store.isFormStarted);
const canShowForm = computed(() => store.canShowForm);

const getStepData = (step: number) => store.getStepData(step);
const resetForm = () => store.resetForm();

// Funciones de prueba
const testSetGeneral = () => {
  console.log("🧪 Test: Estableciendo tipo general");
  reservationFormStore.setAttendeeType("general");
};

const testSetEscolar = () => {
  console.log("🧪 Test: Estableciendo tipo escolar");
  reservationFormStore.setAttendeeType("escolar");
};

const testSetEmpresarial = () => {
  console.log("🧪 Test: Estableciendo tipo empresarial");
  reservationFormStore.setAttendeeType("empresarial");
};

const testReset = () => {
  console.log("🧪 Test: Reseteando formulario");
  reservationFormStore.resetForm();
};

const clearLocalStorage = () => {
  console.log("🧪 Test: Limpiando localStorage");
  if (typeof window !== "undefined") {
    localStorage.removeItem("mide_reservationForm");
    console.log("✅ localStorage limpiado");
    // Recargar la página para ver el estado limpio
    location.reload();
  }
};
</script>
