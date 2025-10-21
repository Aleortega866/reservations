<template>
  <div class="flex flex-col items-center w-full mb-6">
    <!-- Barra de navegación superior -->
    <div class="relative border-b-0 shadow-none w-full mb-4">
      <div class="grid grid-cols-3 gap-4 pb-0 px-2" :class="{ 'pt-10': showTopPadding }">
        <!-- Botón de retroceso (posición absoluta izquierda) -->
        <div class="flex justify-start">
          <Button
            v-if="showBack"
            variant="ghost"
            size="icon"
            class="text-primary z-10"
            @click="$emit('go-back')"
          >
            <Icon
              icon="ri:arrow-left-line"
              class="text-primary"
              style="height: 25px !important; width: 25px !important"
            />
          </Button>
        </div>

        <!-- Logo centrado -->
        <div v-if="showLogo" class="flex justify-center mb-3">
          <img src="/assets/logo-header.svg" alt="logo" class="w-20 h-auto" />
        </div>

        <div class="flex justify-end">
          <!-- Botón de menú (posición absoluta derecha) -->
          <Button
            v-if="showMenuButton"
            variant="ghost"
            size="icon"
            class="w-6 h-6 p-2 bg-primary text-white rounded-full z-10"
            @click="toggleSidebar"
          >
            <Icon
              icon="tabler:dots"
              style="
                color: #fff !important;
                height: 18px !important;
                width: 18px !important;
              "
            />
          </Button>
        </div>
      </div>
    </div>

    <!-- Indicador de pasos -->
    <div class="flex items-center justify-center shadow-lg w-full pb-3 mt-0">
      <template v-for="step in 3" :key="'step-' + step">
        <div class="flex flex-col items-center">
          <div
            :class="[
              'min-w-6 min-h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
              getStepClasses(step),
            ]"
            @click="handleStepClick(step)"
          >
            <!-- Mostrar círculo solo cuando es el paso actual pero no está completo -->
            <span
              v-if="step === props.currentStep && !isStepSaved(step)"
              class="bg-accent w-2.5 h-2.5 rounded-full mx-auto"
            ></span>
            <!-- Mostrar ícono de check si el paso está guardado -->
            <Icon
              v-if="isStepSaved(step)"
              icon="mdi:check"
              :class="['w-4 h-4 transition-all duration-200', getCheckIconClasses(step)]"
            />
            <!-- Mostrar número del paso si no está guardado y no es el paso actual -->
            <span
              v-else-if="!isStepSaved(step) && step !== props.currentStep"
              :class="[
                'text-sm font-bold transition-all duration-200',
                getStepNumberClasses(step),
              ]"
            />
          </div>
          <span
            :class="[
              'text-normal font-bold mt-1 transition-colors duration-200',
              getStepLabelClasses(step),
            ]"
            >{{ step }}</span
          >
        </div>
        <div
          v-if="step < 3"
          :class="[
            'w-16 h-0.5 mx-2 mb-6 self-center transition-colors duration-200',
            getConnectorClasses(step),
          ]"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================================================
// IMPORTACIONES
// ============================================================================
import { onMounted, onUnmounted, watch, computed } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";

// Composables
import { useSidebar } from "@/components/ui/sidebar";
import { useToast } from "@/composables/ui/useToast";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import { useReservationGeneral } from "@/composables/reservations/useReservationGeneral";
import { useReservationSchool } from "@/composables/reservations/useReservationSchool";
import { useReservationCompany } from "@/composables/reservations/useReservationCompany";
import { useReservationSummerCourse } from "@/composables/reservations/useReservationSummerCourse";

// Stores
import { useReservationFormStore } from "@/stores/reservation-form";
import { useReservationStepStatusStore } from "@/stores/reservation-step-status";

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================
const { toggleSidebar } = useSidebar();
const { showError } = useToast();
const reservationStore = useReservationFormStore();
const stepStatusStore = useReservationStepStatusStore();

const {
  isStepComplete,
  canNavigateToStep,
  loadReservationSteps,
  forceReloadAllSteps: forceReloadAllStepsComposable,
} = useReservationStepLoader();

// ============================================================================
// PROPS Y EMITS
// ============================================================================
const props = defineProps({
  showLogo: {
    type: Boolean,
    default: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    default: "Datos de la Reservación",
  },
  showBack: {
    type: Boolean,
    default: true,
  },
  showDebugControls: {
    type: Boolean,
    default: false,
  },
  showMenuButton: {
    type: Boolean,
    default: true,
  },
  showTopPadding: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "go-back",
  "step-click",
  "data-loaded",
  "steps-loaded",
  "step-completed",
]);

// ============================================================================
// VARIABLES REACTIVAS
// ============================================================================
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================
const currentReservationId = computed(() => {
  const id = reservationStore.reservationId;
  //console.log("🔍 ReservationStepHeader - currentReservationId computed:", id);
  return id;
});

const currentAttendeeType = computed(() => {
  const type = reservationStore.selectedAttendeeType;
  // console.log("🔍 ReservationStepHeader - currentAttendeeType computed:", type);
  return type;
});

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================
const isStepValid = (step: number) => {
  return reservationStore.isStepValid(step);
};

const isStepSaved = (step: number) => {
  const isComplete = isStepComplete.value(step);
  // console.log(`🔍 isStepSaved(${step}):`, isComplete);
  return isComplete;
};

const canNavigateToStepLocal = (step: number) => {
  return canNavigateToStep(step);
};

const markStepCompleteImmediately = (step: number, data: any) => {
  // console.log(`✅ Marcando paso ${step} como completo inmediatamente`);
  stepStatusStore.markStepComplete(step, data);
  emit("step-completed", {
    step,
    data,
    timestamp: new Date().toISOString(),
  });
};

// ============================================================================
// SISTEMA DE EVENTOS - LISTENERS
// ============================================================================
const setupStepSaveListeners = () => {
  console.log("🎧 Configurando listeners de guardado de pasos...");

  window.addEventListener("reservation-step-saved", handleStepSaved);
  window.addEventListener("reservation-general-step-saved", handleStepSaved);
  window.addEventListener("reservation-escolar-step-saved", handleStepSaved);
  window.addEventListener("reservation-empresarial-step-saved", handleStepSaved);
  window.addEventListener("reservation-summer-course-step-saved", handleStepSaved);
  window.addEventListener("reservation-general-step-load", handleStepLoad);
  window.addEventListener("reservation-escolar-step-load", handleStepLoad);
  window.addEventListener("reservation-step-load", handleStepLoad);
  window.addEventListener("reservation-empresarial-step-load", handleStepLoad);
  window.addEventListener("reservation-step-navigated", handleStepNavigated);
  window.addEventListener("reservation-id-set", handleReservationIdSet);
};

const cleanupStepSaveListeners = () => {
  // console.log("🧹 Limpiando listeners de guardado de pasos...");

  window.removeEventListener("reservation-step-saved", handleStepSaved);
  window.removeEventListener("reservation-general-step-saved", handleStepSaved);
  window.removeEventListener("reservation-escolar-step-saved", handleStepSaved);
  window.removeEventListener("reservation-empresarial-step-saved", handleStepSaved);
  window.removeEventListener("reservation-summer-course-step-saved", handleStepSaved);
  window.removeEventListener("reservation-general-step-load", handleStepLoad);
  window.removeEventListener("reservation-escolar-step-load", handleStepLoad);
  window.removeEventListener("reservation-step-load", handleStepLoad);
  window.removeEventListener("reservation-empresarial-step-load", handleStepLoad);
  window.removeEventListener("reservation-step-navigated", handleStepNavigated);
  window.removeEventListener("reservation-id-set", handleReservationIdSet);
};

// ============================================================================
// SISTEMA DE EVENTOS - HANDLERS
// ============================================================================
const handleStepLoad = (event: any) => {
  const { attendeeType, reservationId } = event.detail;

  if (
    reservationId === currentReservationId.value &&
    attendeeType === currentAttendeeType.value
  ) {
    setTimeout(() => {
      forceReloadAllStepsComposable();
    }, 100);
  } else {
    console.log("⚠️ No hay coincidencia de reservación para carga de datos");
  }
};

const handleStepSaved = (event: any) => {
  const { step, attendeeType, reservationId, data } = event.detail;

  /* console.log("🎉 Paso guardado exitosamente:", {
    step,
    attendeeType,
    reservationId,
    hasData: !!data,
    currentReservationId: currentReservationId.value,
    currentAttendeeType: currentAttendeeType.value,
  });*/

  if (
    reservationId === currentReservationId.value &&
    attendeeType === currentAttendeeType.value
  ) {
    //console.log("✅ Coincidencia de reservación, marcando paso como completo");
    markStepCompleteImmediately(step, data);

    // SOLO emitir data-loaded si el paso guardado NO es el paso actual
    // Esto evita que los datos del paso 2 sobrescriban los datos del paso 3
    // cuando navegas del paso 2 al paso 3
    if (step === 2 && data && props.currentStep === 2) {
      //console.log("🔄 Enviando datos del paso 2 al formulario:", data);
      emit("data-loaded", { step: 2, data, source: "step-saved" });
    }

    if (step === 3 && data && props.currentStep === 3) {
      //  console.log("🔄 Enviando datos del paso 3 al formulario:", data);
      emit("data-loaded", { step: 3, data, source: "step-saved" });
    }

    setTimeout(() => {
      // console.log("🔄 Recargando estado de pasos después de guardado exitoso");
      forceReloadAllStepsComposable();
    }, 500);
  } else {
    //console.log("⚠️ No hay coincidencia de reservación, pero recargando estado de todos modos");
    setTimeout(() => {
      // console.log("🔄 Recargando estado de pasos (sin coincidencia)");
      forceReloadAllStepsComposable();
    }, 1000);
  }
};

const handleReservationIdSet = (event: any) => {
  const { reservationId, attendeeType } = event.detail;

  /*console.log("🆔 ID de reservación establecido:", {
    reservationId,
    attendeeType,
    currentReservationId: currentReservationId.value,
    currentAttendeeType: currentAttendeeType.value,
  });*/

  if (
    reservationId === currentReservationId.value &&
    attendeeType === currentAttendeeType.value
  ) {
    // console.log("✅ Coincidencia de reservación en ID establecido, cargando pasos");
    setTimeout(() => {
      loadStepsIfNeeded(true);
    }, 500);
  }
};

const handleStepNavigated = (event: any) => {
  const { attendeeType, reservationId } = event.detail;

  if (
    reservationId === currentReservationId.value &&
    attendeeType === currentAttendeeType.value
  ) {
    setTimeout(() => {
      checkAndReloadStepsIfNeeded();
    }, 500);
  }
};

// ============================================================================
// SISTEMA DE CARGA DE PASOS
// ============================================================================
const checkAndReloadStepsIfNeeded = async () => {
  const attendeeType = currentAttendeeType.value;
  const reservationId = currentReservationId.value;

  if (!attendeeType || !reservationId) {
    //  console.log("🔍 No hay reservación activa para verificar");
    return;
  }

  /*console.log("🔍 Verificando si hay pasos que deberían estar completos:", {
    reservationId,
    attendeeType,
    currentStep: props.currentStep,
  });*/

  if (props.currentStep > 1) {
    const isStep1Complete = isStepSaved(1);
    //console.log("🔍 Paso 1 debería estar completo, estado actual:", isStep1Complete);

    if (!isStep1Complete) {
      //   console.log("🔄 Paso 1 no está marcado como completo, recargando estado...");
      await forceReloadAllStepsComposable();
    }
  }

  if (props.currentStep > 2) {
    const isStep2Complete = isStepSaved(2);
    //console.log("🔍 Paso 2 debería estar completo, estado actual:", isStep2Complete);

    if (!isStep2Complete) {
      //  console.log("🔄 Paso 2 no está marcado como completo, recargando estado...");
      await forceReloadAllStepsComposable();
    }
  }
};

const loadStepsIfNeeded = async (forceReload: boolean = false) => {
  const attendeeType = currentAttendeeType.value;
  const reservationId = currentReservationId.value;

  if (!attendeeType) {
    //console.log("ℹ️ No hay tipo de asistente seleccionado, no se cargan pasos");
    return;
  }

  if (!reservationId) {
    //  console.log("ℹ️ No hay ID de reservación en el store, no se cargan pasos");
    return;
  }

  /* console.log(
    `🔄 Cargando pasos para reservación ${reservationId} (${attendeeType})${
      forceReload ? " [FORZADO]" : ""
    }`
  );*/

  try {
    /*console.log(
      "🚨 ADVERTENCIA: loadReservationSteps ejecutándose desde ReservationStepHeader.vue",
      {
        reservationId,
        attendeeType,
        forceReload,
        stackTrace: new Error().stack,
      }
    );*/
    const result = await loadReservationSteps(reservationId, attendeeType, forceReload);

    if (result.success) {
      emit("steps-loaded", {
        reservationId,
        attendeeType,
        completedSteps: result.completedSteps,
        totalSteps: result.totalSteps,
      });
    } else {
      console.warn("⚠️ Error al cargar pasos:", result.error);
    }
  } catch (error) {
    console.error("❌ Error al cargar pasos:", error);
  }
};

const debouncedLoadSteps = (forceReload: boolean = false) => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(() => {
    loadStepsIfNeeded(forceReload);
    debounceTimeout = null;
  }, 300);
};

// ============================================================================
// SISTEMA DE NAVEGACIÓN DE PASOS
// ============================================================================
const handleStepClick = async (step: number) => {
  // console.log("🔍 handleStepClick ejecutado:", { step, currentStep: props.currentStep });

  if (step === props.currentStep) return;

  if (canNavigateToStepLocal(step)) {
    //   console.log("🔍 canNavigateToStepLocal es true para paso:", step);
    /*   console.log("🔍 Condiciones:", {
      step,
      currentStep: props.currentStep,
      isStepSaved: isStepSaved(step),
      isAnterior: step < props.currentStep,
      isPosterior: step > props.currentStep,
    });*/

    if (step < props.currentStep && isStepSaved(step)) {
      //   console.log("🔍 Cargando datos de paso anterior:", step);
      await loadStepData(step);
    } else if (step > props.currentStep && isStepSaved(step)) {
      //   console.log("🔍 Cargando datos de paso posterior:", step);
      await loadStepData(step);
    }
    emit("step-click", step);
  } else {
    const stepName = step === 2 ? "segundo" : "tercero";
    const previousStepName = step === 2 ? "primero" : "segundo";
    showError(
      "Paso no disponible",
      `Debes completar y guardar el ${previousStepName} paso antes de acceder al ${stepName} paso.`
    );
  }
};

const loadStepData = async (step: number) => {
  try {
    const attendeeType = reservationStore.selectedAttendeeType;

    if (!attendeeType) {
      console.warn("No hay tipo de asistente seleccionado");
      return;
    }

    // Cargar datos según el tipo de asistente y el paso
    // Solo inicializamos el composable correspondiente al tipo actual
    if (attendeeType === "general") {
      const { currentReservationId, store } = useReservationGeneral();
      const reservationId = currentReservationId.value;

      if (!reservationId) {
        console.warn("No hay ID de reservación disponible");
        return;
      }

      let result = null;
      if (step === 1) {
        result = await store.loadStep1(reservationId);
      } else if (step === 2) {
        result = await store.loadStep2(reservationId);
      } else if (step === 3) {
        result = await store.loadStep3(reservationId);
      }

      if (result) {
        emit("data-loaded", { step, data: result, source: "header" });
      }
    } else if (attendeeType === "escolar") {
      const { currentReservationId, store } = useReservationSchool();
      const reservationId = currentReservationId.value;

      if (!reservationId) {
        console.warn("No hay ID de reservación disponible");
        return;
      }

      let result = null;
      if (step === 1) {
        result = await store.loadStep1(reservationId);
      } else if (step === 2) {
        result = await store.loadStep2(reservationId);
      } else if (step === 3) {
        result = await store.loadStep3(reservationId);
      }

      if (result) {
        emit("data-loaded", { step, data: result, source: "header" });
      }
    } else if (attendeeType === "empresarial") {
      const { currentReservationId, store } = useReservationCompany();
      const reservationId = currentReservationId.value;

      if (!reservationId) {
        console.warn("No hay ID de reservación disponible");
        return;
      }

      let result = null;
      if (step === 1) {
        result = await store.loadStep1(reservationId);
      } else if (step === 2) {
        result = await store.loadStep2(reservationId);
      } else if (step === 3) {
        result = await store.loadStep3(reservationId);
      }

      if (result) {
        emit("data-loaded", { step, data: result, source: "header" });
      }
    } else if (attendeeType === "curso-verano") {
      const { currentReservationId, store } = useReservationSummerCourse();
      const reservationId = currentReservationId.value;

      if (!reservationId) {
        console.warn("No hay ID de reservación disponible");
        return;
      }

      let result = null;
      if (step === 1) {
        result = await store.loadStep1(reservationId);
      } else if (step === 2) {
        result = await store.loadStep2(reservationId);
      } else if (step === 3) {
        result = await store.loadStep3(reservationId);
      }

      if (result) {
        emit("data-loaded", { step, data: result, source: "header" });
      }
    }
  } catch (error) {
    console.error(`❌ Error al cargar datos del paso ${step}:`, error);
    showError("Error", `No se pudieron cargar los datos del paso ${step}`);
  }
};

// ============================================================================
// FUNCIONES DE ESTILOS CSS
// ============================================================================
const getStepClasses = (step: number) => {
  const isCurrent = step === props.currentStep;
  const canNavigate = canNavigateToStepLocal(step);
  const isSaved = isStepSaved(step);

  if (isCurrent) {
    if (isSaved) {
      return "bg-accent border-accent cursor-pointer hover:border-accent/80";
    } else {
      return "bg-background border-accent cursor-pointer hover:border-accent/80";
    }
  } else if (canNavigate) {
    if (isSaved) {
      return "bg-white border-accent cursor-pointer hover:border-accent/80";
    } else {
      return "bg-muted-foreground/10 border-accent cursor-pointer hover:border-accent/80 hover:bg-muted-foreground/20";
    }
  } else {
    return "bg-muted-foreground/5 border-accent/50 cursor-not-allowed opacity-60";
  }
};

const getStepLabelClasses = (step: number) => {
  const isCurrent = step === props.currentStep;
  const canNavigate = canNavigateToStepLocal(step);

  if (isCurrent) {
    return "text-accent";
  } else if (canNavigate) {
    return "text-muted-foreground hover:text-accent/80";
  } else {
    return "text-muted-foreground/50";
  }
};

const getConnectorClasses = (step: number) => {
  const isNextStepValid = isStepValid(step + 1);
  const canNavigateToNext = canNavigateToStepLocal(step + 1);

  if (isNextStepValid || canNavigateToNext) {
    return "bg-muted-foreground";
  } else {
    return "bg-muted-foreground/30";
  }
};

const getCheckIconClasses = (step: number) => {
  const isCurrent = step === props.currentStep;
  const isSaved = isStepSaved(step);

  if (isSaved) {
    return isCurrent ? "text-white" : "text-accent";
  } else {
    return "text-muted-foreground/40";
  }
};

const getStepNumberClasses = (step: number) => {
  const isCurrent = step === props.currentStep;
  const canNavigate = canNavigateToStepLocal(step);

  if (isCurrent) {
    return "text-white";
  } else if (canNavigate) {
    return "text-muted-foreground";
  } else {
    return "text-muted-foreground/50";
  }
};

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================
onMounted(() => {
  setupStepSaveListeners();

  if (currentReservationId.value && currentAttendeeType.value) {
    /*console.log("🔄 Cargando pasos al montar componente:", {
      reservationId: currentReservationId.value,
      attendeeType: currentAttendeeType.value,
    });*/
    loadStepsIfNeeded();
  }
});

onUnmounted(() => {
  cleanupStepSaveListeners();
});

// ============================================================================
// WATCHERS
// ============================================================================
watch(
  () => currentAttendeeType.value,
  (newType: string | null, oldType: string | null) => {
    if (newType && newType !== oldType) {
      // console.log("🔄 Tipo de asistente cambió en header, recargando pasos:", newType);
      debouncedLoadSteps(true);
    }
  }
);

watch(
  () => currentReservationId.value,
  (newId: number | null, oldId: number | null) => {
    if (newId && newId !== oldId) {
      // console.log("🔄 ID de reservación cambió en header, recargando pasos:", newId);
      debouncedLoadSteps(true);
    }
  }
);

watch(
  () => props.currentStep,
  (newStep: number, oldStep: number) => {
    if (newStep !== oldStep) {
      //console.log("🔄 Paso actual cambió:", { oldStep, newStep });
      setTimeout(() => {
        checkAndReloadStepsIfNeeded();
      }, 1000);
    }
  }
);
</script>
