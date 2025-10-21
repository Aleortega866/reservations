<template>
  <div class="min-h-screen flex flex-col">
    <!-- Desktop Navigation usando el componente reutilizable -->
    <ClientOnly>
      <DesktopNavigation
        v-if="isDesktop"
        title="Reservaciones"
        :show-back-button="isDesktop"
        :show-new-reservation-button="true"
        :show-material-button="true"
        :show-shadow="false"
        :show-logo="false"
        @go-back="handleGoBack"
        @new-reservation="handleNewReservation"
        @material-click="navigateToMaterialDidactico"
      />
    </ClientOnly>
    <!-- Header -->
    <ReservationStepHeader
      :currentStep="currentStep"
      :showBack="isMobile"
      :showMenuButton="isMobile"
      :showTopPadding="isMobile"
      :showDebugControls="true"
      :showLogo="isMobile"
      @go-back="handleGoBack"
      @step-click="handleStepClick"
      @data-loaded="handleDataLoaded"
      title="Datos de la Reservación"
    />
    <div class="w-full mx-0 lg:max-w-2xl lg:mx-auto pt-3 mb-16 space-y-4 flex-1">
      <div class="px-4">
        <ReservationActionButtons
          v-if="shouldShowActionButtons"
          :is-loading="isCreating"
          :reservation-id="currentReservationId"
          @material-action="handleMaterialAction"
          @reservation-confirmed="handleReservationConfirmed"
          @reservation-cancelled="handleReservationCancelled"
        />

        <!-- <ReservationWithStepManager /> -->
        <!-- <ReservationStepManagerExample /> -->

        <!-- Componente selector de formularios (solo en paso 1) -->
        <ReservationFormChoose
          v-if="currentStep === 1"
          :disabled="isSelectDisabled"
          @setting-attendee-type="handleAttendeeTypeSettings"
        />

        <!-- Campos dinámicos según el tipo de asistente (solo cliente para evitar mismatches de SSR con estado persistido) -->
        <ClientOnly>
          <div v-if="canShowForm" class="space-y-4">
            <!-- VISITA GENERAL -->
            <GeneralForm
              v-if="selectedAttendeeType === 'general'"
              :header-data="headerData"
              @form-changed="handleFormChanged"
            />

            <!-- VISITA ESCOLAR -->
            <EscolarForm
              v-if="selectedAttendeeType === 'escolar'"
              :header-data="headerData"
              @form-changed="handleFormChanged"
            />

            <!-- VISTA EMPRESARIAL-->
            <EmpresarialForm
              v-if="selectedAttendeeType === 'empresarial'"
              :header-data="headerData"
              @form-changed="handleFormChanged"
            />

            <!-- VISITA CURSO DE VERANO -->
            <SummerCourseForm
              v-if="selectedAttendeeType === 'curso-verano'"
              :header-data="headerData"
              @form-changed="handleFormChanged"
            />
          </div>
        </ClientOnly>

        <div v-if="!isReservationStep()" class="text-center py-8">
          <p class="text-gray-600">Inicializando formulario de reservación...</p>
        </div>
      </div>

      <!-- Componente de debug (solo en desarrollo) -->
      <!-- <ReservationFormDebug /> -->

      <!-- Alerta personalizada de salida del formulario -->
      <ExitFormAlert
        :is-open="showAlert"
        :loading="alertLoading"
        :message="alertProps.message"
        :continue-text="alertProps.continueText"
        :save-text="alertProps.saveText"
        :discard-text="alertProps.discardText"
        @continue="handleContinue"
        @save="handleSave"
        @discard="handleDiscard"
        @close="handleClose"
      />
    </div>
    <!-- Bottom Navigation -->
    <BottomNavigation
      :showReservationButton="false"
      @open-chat="handleOpenChat"
      :reservation-id="currentReservationId"
      :are-all-steps-complete="areAllStepsComplete"
      @cancel-reservation="handleCancelReservation"
      @cancel-option-selected="handleCancelOptionSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { useReservationStepNavigation } from "@/composables/reservations/useReservationStepNavigation";
import { useReservationFormStore } from "@/stores/reservation-form";
import { useReservationGeneral } from "@/composables/reservations/useReservationGeneral";
import { useReservationSchool } from "@/composables/reservations/useReservationSchool";
import { useReservationCompany } from "@/composables/reservations/useReservationCompany";
import { useReservationSummerCourse } from "@/composables/reservations/useReservationSummerCourse";
import { computed, onMounted, ref } from "vue";
import { useExitFormAlert } from "@/composables/ui/useExitFormAlert";
import { useReservationStepIntegration } from "@/composables/reservations/useReservationStepIntegration";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import { useReservationStoreCleanup } from "@/composables/utils/useStoreCleanup";
import { onBeforeRouteLeave, useRouter } from "vue-router";
// Componentes
import ReservationStepHeader from "@/components/reservations/ReservationStepHeader.vue";
import ReservationFormChoose from "@/components/reservations/screens/ReservationFormChoose.vue";
import GeneralForm from "@/components/reservations/formtypes/general/GeneralForm.vue";
import EscolarForm from "@/components/reservations/formtypes/escolar/EscolarForm.vue";
import EmpresarialForm from "@/components/reservations/formtypes/empresarial/EmpresarialForm.vue";
import SummerCourseForm from "@/components/reservations/formtypes/summer-course/SummerCourseForm.vue";
import ReservationActionButtons from "@/components/reservations/formtypes/empresarial/steps/components/ReservationActionButtons.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import DesktopNavigation from "@/components/app/DesktopNavigation.vue";
import ExitFormAlert from "@/components/common/ExitFormAlert.vue";

// Router
const router = useRouter();

// Device detection
const { isMobile, isDesktop } = useDevice();

// Lógica de pasos
const { currentStep, goToStep } = useReservationStepNavigation();

// Store del formulario de reservaciones
const reservationFormStore = useReservationFormStore();

// Composable para limpiar stores
const { clearAllStores } = useReservationStoreCleanup();

// Sistema de gestión de pasos
const { initializeIntegration } = useReservationStepIntegration();
const { areAllStepsComplete, isStepComplete } = useReservationStepLoader();

// Ya no necesitamos obtener parámetros de la ruta
// Los datos se manejan completamente a través del store y localStorage

// Función para mapear códigos de la API a tipos del frontend
const mapReservationTypeCode = (code: string): string => {
  const typeMapping: Record<string, string> = {
    VE: "empresarial",
    GE: "general",
    VES: "escolar",
    CV: "curso-verano",
    // Mapeos adicionales para códigos que pueden venir de la persistencia
    vg: "general", // Código abreviado para general
    em: "empresarial", // Código abreviado para empresarial
    ves: "escolar", // Código abreviado para escolar
    cv: "curso-verano", // Código abreviado para curso-verano
    vcv: "curso-verano", // Variante de curso-verano
  };

  return typeMapping[code] || code.toLowerCase();
};

const handleMaterialAction = () => {
  console.log("🔍 handleMaterialAction llamado");
};

const handleReservationConfirmed = (reservationId: number) => {
  console.log("✅ Reservación confirmada:", reservationId);
  // Aquí puedes agregar lógica adicional después de confirmar la reservación
  // Por ejemplo, actualizar el estado, mostrar un mensaje, etc.
};

const handleReservationCancelled = (reservationId: number) => {
  console.log("❌ Reservación cancelada:", reservationId);
  // Aquí puedes agregar lógica adicional después de cancelar la reservación
  // Por ejemplo, actualizar el estado, mostrar un mensaje, etc.
};

const isCreating = ref(false);
const currentReservationId = ref<number | null>(null);

// Computed para determinar si se deben mostrar los botones de acción
const shouldShowActionButtons = computed(() => {
  // Verificar condiciones básicas primero
  const allStepsComplete = areAllStepsComplete.value;
  const attendeeType = selectedAttendeeType.value;
  const reservationId = currentReservationId.value;

  // Obtener el estado actual de cada paso para debug
  const step1Complete = isStepComplete.value(1);
  const step2Complete = isStepComplete.value(2);
  const step3Complete = isStepComplete.value(3);

  console.log("🔍 shouldShowActionButtons - Estado:", {
    step1: step1Complete,
    step2: step2Complete,
    step3: step3Complete,
    allStepsComplete,
    attendeeType,
    reservationId,
  });

  // Condición 1: Debe haber un ID de reservación
  if (!reservationId) {
    console.log("❌ No mostrar botones: sin ID de reservación");
    return false;
  }

  // Condición 2: Debe haber un tipo de asistente
  if (!attendeeType) {
    console.log("❌ No mostrar botones: sin tipo de asistente");
    return false;
  }

  // Condición 3: Todos los pasos deben estar completos
  if (!allStepsComplete) {
    console.log("❌ No mostrar botones: pasos incompletos", {
      step1: step1Complete,
      step2: step2Complete,
      step3: step3Complete,
    });
    return false;
  }

  console.log("✅ Mostrar botones: todas las condiciones cumplidas");
  return true;
});

// Función para cargar una reservación existente
const loadExistingReservation = async (
  reservationId: string,
  reservationType: string
): Promise<Boolean> => {
  try {
    if (reservationId && reservationType) {
      // Ejecutar codigo
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error al cargar reservación:", error);
    // Fallback a nueva sesión
    return false;
  }
};

// Inicializar sesión al cargar la página
onMounted(async () => {
  // Verificar si hay una reservación existente en el store
  const existingReservationId = reservationFormStore.reservationId;
  const existingAttendeeType = reservationFormStore.selectedAttendeeType;

  const loadedReservation: Boolean = await loadExistingReservation(
    existingReservationId?.toString(),
    existingAttendeeType
  );

  if (!loadedReservation) {
    // Inicializar nueva sesión limpia

    reservationFormStore.initializeNewSession();

    return;
  }

  // Reiniciar cualquier formulario
  reservationFormStore.resetForm();

  // Cargar los datos de la reservación según el tipo mapeado
  // Establecer el ID de la reservación en el store
  reservationFormStore.setReservationId(parseInt(existingReservationId?.toString()));
  // Mapear el tipo correctamente
  const mappedType = mapReservationTypeCode(existingAttendeeType);
  reservationFormStore.setAttendeeType(mappedType);
  await loadReservationData(parseInt(existingReservationId?.toString()), mappedType);
  currentReservationId.value = parseInt(existingReservationId?.toString());
});

// Función para cargar los datos de la reservación según el tipo
const loadReservationData = async (reservationId: number, reservationType: string) => {
  try {
    // Obtener el paso actual desde el store
    const currentStep = reservationFormStore.currentStep;

    let result = null;

    // Solo inicializar el composable correspondiente al tipo actual
    if (reservationType === "general") {
      const { store } = useReservationGeneral();
      if (currentStep === 1) {
        result = await store.loadStep1(reservationId);
      } else if (currentStep === 2) {
        result = await store.loadStep2(reservationId);
      } else if (currentStep === 3) {
        result = await store.loadStep3(reservationId);
      }
    } else if (reservationType === "escolar") {
      const { store } = useReservationSchool();
      if (currentStep === 1) {
        result = await store.loadStep1(reservationId);
      } else if (currentStep === 2) {
        result = await store.loadStep2(reservationId);
      } else if (currentStep === 3) {
        result = await store.loadStep3(reservationId);
      }
    } else if (reservationType === "empresarial") {
      const { store } = useReservationCompany();
      if (currentStep === 1) {
        result = await store.loadStep1(reservationId);
      } else if (currentStep === 2) {
        result = await store.loadStep2(reservationId);
      } else if (currentStep === 3) {
        result = await store.loadStep3(reservationId);
      }
    } else if (reservationType === "curso-verano") {
      const { store } = useReservationSummerCourse();
      if (currentStep === 1) {
        result = await store.loadStep1(reservationId);
      } else if (currentStep === 2) {
        result = await store.loadStep2(reservationId);
      } else if (currentStep === 3) {
        result = await store.loadStep3(reservationId);
      }
    } else {
      console.warn("Tipo de reservación no reconocido:", reservationType);
    }

    // Si se cargaron datos exitosamente, emitir el evento data-loaded con el paso correcto
    if (result) {
      // PRIMERO: Marcar el paso actual como completo ANTES de cualquier otra operación
      const { markStepComplete } = useReservationStepLoader();
      markStepComplete(currentStep, result);

      // Pequeño delay para asegurar que el marcado se complete antes de otras operaciones
      await new Promise((resolve) => setTimeout(resolve, 100));

      handleDataLoaded({
        step: currentStep,
        data: result,
        source: "existing-reservation",
      });

      // Inicializar el sistema de gestión de pasos para cargar los pasos restantes
      await initializeIntegration(false); // false = no forzar recarga ya que ya cargamos el paso actual
    }
  } catch (error) {
    console.error("Error al cargar datos de la reservación:", error);
    throw error;
  }
};

// Router guard para interceptar navegación cuando hay cambios sin guardar
onBeforeRouteLeave(async (_to, _from, next) => {
  // ALERTA DESACTIVADA TEMPORALMENTE
  // Verificar si hay cambios sin guardar antes de navegar
  // if (shouldShowAlert()) {
  //   const result = await showExitAlert();

  //   if (result === "continue") {
  //     // No navegar, quedarse en la página actual
  //     next(false);
  //   } else if (result === "save") {
  //     // Permitir navegación después de guardar
  //     next();
  //   } else if (result === "discard") {
  //     // Permitir navegación sin guardar (ya se limpiaron los stores)
  //     next();
  //   }
  // } else {
  // No hay cambios sin guardar, permitir navegación
  next();
  // }
});

// Configurar limpieza automática de stores
// useStoreCleanup({
//   cleanupRoutes: ["/auth/login", "/profile", "/admin", "/notifications"],
//   showAlertOnNavigation: true,
//   preserveProgress: true,
// });

// Composable para alerta personalizada de salida del formulario
const {
  shouldShowAlert,
  showExitAlert,
  markAsUnsaved,
  markFormStarted,
  showAlert,
  alertLoading,
  handleContinue,
  handleSave,
  handleDiscard,
  handleClose,
  alertProps,
} = useExitFormAlert();

// Estado reactivo para data del header
const headerData = ref({});

// Computed properties del store
const selectedAttendeeType = computed(() => reservationFormStore.selectedAttendeeType);
const canShowForm = computed(() => reservationFormStore.canShowForm);

// Computed para determinar si el select debe estar deshabilitado
const isSelectDisabled = computed(() => {
  // Si hay un ID de reservación (reservación existente), deshabilitar
  if (reservationFormStore.reservationId) {
    return true;
  }

  // Si el paso 1 ya está guardado, deshabilitar
  if (reservationFormStore.formData.step1.saved === true) {
    return true;
  }
  return false;
});

// Visualiza el tipo de formulario a cargar
const handleAttendeeTypeSettings = (newAttendeeType: string) => {
  reservationFormStore.setAttendeeType(newAttendeeType);
  markFormStarted(); // Marcar que el formulario ha comenzado
};

// Manejar cambios en el formulario
const handleFormChanged = () => {
  markAsUnsaved(); // Marcar que hay cambios sin guardar
};

// Manejar data cargada desde el header
const handleDataLoaded = (data: any) => {
  // Actualizar headerData siempre, pero priorizar datos del paso actual
  if (data.step === currentStep.value) {
    headerData.value = data;
  } else if (data.step === 1 && currentStep.value > 1) {
    // Si estamos en paso 2 o 3 y recibimos datos del paso 1, actualizar también
    // Esto es necesario para mostrar información básica de la reservación

    headerData.value = data;
  } else if (data.step === 2 && data.source === "step-saved") {
    // Si recibimos datos del paso 2 desde un evento de guardado, actualizar siempre
    // Esto es necesario para setear los datos del paso 2 después de modificar el paso 1

    headerData.value = data;
  } else if (data.step === 3 && data.source === "step-saved") {
    // Si recibimos datos del paso 3 desde un evento de guardado, actualizar siempre
    // Esto es necesario para setear los datos del paso 3 después de modificar el paso 2

    headerData.value = data;
  } else {
    // Agregar un delay para casos edge donde el componente aún no está listo
    setTimeout(() => {
      if (
        data.step === currentStep.value ||
        (data.step === 1 && currentStep.value > 1) ||
        (data.step === 2 && data.source === "step-saved") ||
        (data.step === 3 && data.source === "step-saved")
      ) {
        console.log("✅ Actualizando headerData después del delay");
        headerData.value = data;
        console.log("🔍 headerData actualizado:", headerData.value);
      }
    }, 500);
  }
};

const isReservationStep = () => {
  return [1, 2, 3].includes(currentStep.value);
};

const handleGoBack = async () => {
  // ALERTA DESACTIVADA TEMPORALMENTE
  // Verificar si hay cambios sin guardar antes de navegar
  // if (shouldShowAlert()) {
  //   const result = await showExitAlert();

  //   if (result === "continue") {
  //     return; // No navegar, quedarse en la página actual
  //   }
  //   // Si es 'save' o 'discard', continuar con la navegación
  // } else {
  console.log("✅ No hay cambios sin guardar, navegando normalmente");
  // }

  if (currentStep.value > 1) {
    goToStep(currentStep.value - 1);
  } else {
    // Si estamos en el paso 1, regresar a la página de reservaciones
    router.push("/reservations");
  }
};

const handleStepClick = async (step: number) => {
  // ALERTA DESACTIVADA TEMPORALMENTE
  // Verificar si hay cambios sin guardar antes de navegar
  // if (shouldShowAlert()) {
  //   const result = await showExitAlert();
  //   if (result === "continue") {
  //     return; // No navegar, quedarse en la página actual
  //   }
  //   // Si es 'save' o 'discard', continuar con la navegación
  // }

  // Navegar al paso seleccionado
  goToStep(step);
};

const handleOpenChat = () => {
  console.log("Abriendo chat...");
};

const handleNewReservation = () => {
  console.log("🆕 Iniciando nueva reservación - limpiando stores");

  // Limpiar completamente todos los stores antes de navegar
  clearAllStores();

  // Redirigir a la nueva página de flujo de reservación
  router.push("/reservations/formulario-reservacion");
};

const navigateToMaterialDidactico = () => {
  // Navegar a la nueva página de material didáctico
  // router.push('/reservations/material-didactico')
};

const handleCancelReservation = () => {
  console.log("❌ Cancelando reservación");
  // Aquí puedes implementar la lógica para cancelar la reservación
};

const handleCancelOptionSelected = (option: string) => {
  console.log("🔍 Opción de cancelación seleccionada:", option);
  console.log("📄 ID de reservación:", currentReservationId.value);
};
</script>

<style scoped></style>
