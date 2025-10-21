<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header con gestión de pasos -->
    <ReservationStepHeader
      :current-step="currentStep"
      title="Reservación con Gestor de Estados"
      @go-back="goBack"
      @step-click="handleStepClick"
      @steps-loaded="handleStepsLoaded"
    />

    <!-- Contenido principal -->
    <div class="container mx-auto px-4 py-6">
      <!-- Información de estado -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Estado de la Reservación</h2>
            <p class="text-sm text-gray-600">
              {{ completedStepsCount }}/3 pasos completados ({{
                Math.round((completedStepsCount / 3) * 100)
              }}%)
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div
              v-for="step in 3"
              :key="step"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="
                getStepVisualState(step).status === 'complete'
                  ? 'bg-green-100 text-green-800'
                  : getStepVisualState(step).status === 'available'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-500'
              "
            >
              <Icon
                v-if="getStepVisualState(step).showCheck"
                icon="mdi:check"
                class="w-4 h-4"
              />
              <span v-else>{{ step }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de pasos -->
      <div class="bg-white rounded-lg shadow-sm border">
        <!-- Paso 1: Información básica -->
        <div v-if="currentStep === 1" class="p-6">
          <h3 class="text-xl font-semibold mb-4">Paso 1: Información Básica</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Fecha de visita</label>
              <input
                v-model="step1Data.visitDate"
                type="date"
                class="w-full px-3 py-2 border rounded-md"
                @input="updateStep1Data"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Objetivo de la visita</label>
              <select
                v-model="step1Data.visitObjective"
                class="w-full px-3 py-2 border rounded-md"
                @change="updateStep1Data"
              >
                <option value="">Seleccionar objetivo</option>
                <option value="educativo">Educativo</option>
                <option value="recreativo">Recreativo</option>
                <option value="investigacion">Investigación</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-between">
            <button @click="goBack" class="px-4 py-2 text-gray-600 hover:text-gray-800">
              ← Anterior
            </button>
            <button
              @click="saveStep1"
              :disabled="!canSaveStep1"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Guardar y Continuar
            </button>
          </div>
        </div>

        <!-- Paso 2: Información del representante -->
        <div v-if="currentStep === 2" class="p-6">
          <h3 class="text-xl font-semibold mb-4">
            Paso 2: Información del Representante
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nombre completo</label>
              <input
                v-model="step2Data.fullName"
                type="text"
                class="w-full px-3 py-2 border rounded-md"
                @input="updateStep2Data"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Email</label>
              <input
                v-model="step2Data.email"
                type="email"
                class="w-full px-3 py-2 border rounded-md"
                @input="updateStep2Data"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Teléfono</label>
              <input
                v-model="step2Data.phone"
                type="tel"
                class="w-full px-3 py-2 border rounded-md"
                @input="updateStep2Data"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-between">
            <button
              @click="goToStep(1)"
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Anterior
            </button>
            <button
              @click="saveStep2"
              :disabled="!canSaveStep2"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Guardar y Continuar
            </button>
          </div>
        </div>

        <!-- Paso 3: Confirmación -->
        <div v-if="currentStep === 3" class="p-6">
          <h3 class="text-xl font-semibold mb-4">Paso 3: Confirmación</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Método de pago</label>
              <select
                v-model="step3Data.paymentMethodId"
                class="w-full px-3 py-2 border rounded-md"
                @change="updateStep3Data"
              >
                <option value="">Seleccionar método</option>
                <option value="1">Efectivo</option>
                <option value="2">Tarjeta</option>
                <option value="3">Transferencia</option>
              </select>
            </div>

            <div class="flex items-center">
              <input
                v-model="step3Data.isTermsAccepted"
                type="checkbox"
                id="terms"
                class="mr-2"
                @change="updateStep3Data"
              />
              <label for="terms" class="text-sm">
                Acepto los términos y condiciones
              </label>
            </div>
          </div>

          <div class="mt-6 flex justify-between">
            <button
              @click="goToStep(2)"
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Anterior
            </button>
            <button
              @click="saveStep3"
              :disabled="!canSaveStep3"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Finalizar Reservación
            </button>
          </div>
        </div>
      </div>

      <!-- Debug info -->
      <div v-if="showDebug" class="mt-6 bg-gray-100 rounded-lg p-4">
        <h4 class="font-semibold mb-2">Debug Info</h4>
        <pre class="text-xs">{{
          JSON.stringify({ currentStep, stepStatus, completedStepsCount }, null, 2)
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import ReservationStepHeader from "@/components/reservations/ReservationStepHeader.vue";
import { useReservationStepIntegration } from "@/composables/reservations/useReservationStepIntegration";
import { useToast } from "@/composables/ui/useToast";

// Composable para gestión integrada de pasos
const {
  isStepComplete,
  getStepVisualState,
  completedStepsCount,
  stepStatus,
  markStepCompleteFromStore,
  initializeIntegration,
} = useReservationStepIntegration();

const { showSuccess, showError } = useToast();

// Estado del componente
const currentStep = ref(1);
const showDebug = ref(false);

// Datos de los pasos
const step1Data = ref({
  visitDate: "",
  visitObjective: "",
});

const step2Data = ref({
  fullName: "",
  email: "",
  phone: "",
});

const step3Data = ref({
  paymentMethodId: "",
  isTermsAccepted: false,
});

// Computed para validación
const canSaveStep1 = computed(() => {
  return step1Data.value.visitDate && step1Data.value.visitObjective;
});

const canSaveStep2 = computed(() => {
  return step2Data.value.fullName && step2Data.value.email;
});

const canSaveStep3 = computed(() => {
  return step3Data.value.paymentMethodId && step3Data.value.isTermsAccepted;
});

// Métodos
const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const goToStep = (step: number) => {
  currentStep.value = step;
};

const handleStepClick = (step: number) => {
  currentStep.value = step;
};

const handleStepsLoaded = (data: any) => {
  console.log("✅ Pasos cargados:", data);
  showSuccess(
    "Estado cargado",
    `Se cargaron ${data.completedSteps} de ${data.totalSteps} pasos`
  );
};

const updateStep1Data = () => {
  // Aquí podrías actualizar el store correspondiente
  console.log("Actualizando datos del paso 1:", step1Data.value);
};

const updateStep2Data = () => {
  console.log("Actualizando datos del paso 2:", step2Data.value);
};

const updateStep3Data = () => {
  console.log("Actualizando datos del paso 3:", step3Data.value);
};

const saveStep1 = async () => {
  try {
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Marcar como completo en el sistema de pasos
    markStepCompleteFromStore(1, step1Data.value);

    showSuccess("Paso 1 guardado", "La información básica se ha guardado correctamente");
    currentStep.value = 2;
  } catch (error) {
    showError("Error", "No se pudo guardar el paso 1");
  }
};

const saveStep2 = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    markStepCompleteFromStore(2, step2Data.value);

    showSuccess(
      "Paso 2 guardado",
      "La información del representante se ha guardado correctamente"
    );
    currentStep.value = 3;
  } catch (error) {
    showError("Error", "No se pudo guardar el paso 2");
  }
};

const saveStep3 = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    markStepCompleteFromStore(3, step3Data.value);

    showSuccess(
      "Reservación completada",
      "¡Tu reservación se ha completado exitosamente!"
    );
  } catch (error) {
    showError("Error", "No se pudo completar la reservación");
  }
};

// Inicializar integración al montar el componente
onMounted(async () => {
  await initializeIntegration();
});
</script>
