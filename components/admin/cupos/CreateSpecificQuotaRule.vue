<template>
  <div v-auto-animate="{ duration: 200, easing: 'ease-out' }">
    <!-- Contenido principal -->
    <div v-if="!showConflictDialog">
      <div class="flex items-center justify-between" @click="toggleOptions">
        <label class="text-sm block font-normal">{{ label }}</label>
        <Icon
          v-if="showOptions"
          icon="lucide:chevrons-down-up"
          width="16"
          height="16"
          class="text-muted-foreground"
        />
      </div>

      <div
        class="space-y-0 mt-1 overflow-hidden"
        v-auto-animate="{ duration: 200, easing: 'ease-out' }"
      >
        <!-- Input principal que se expande -->
        <div class="relative mb-3" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
          <Card
            v-if="!showOptions"
            class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2"
            :class="[showOptions ? 'rounded-t-xl rounded-b-none' : 'rounded-full']"
            @click="toggleOptions"
          >
            <CardContent class="flex items-center justify-between py-1 px-2">
              <p class="text-xs font-normal">
                Consulta las reglas para cupo creadas anteriormete
              </p>
              <ChevronsUpDown class="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        <!-- Opciones que se expanden hacia abajo -->
        <div
          v-if="showOptions"
          class="space-y-0 overflow-y-hidden"
          v-auto-animate="{ duration: 150, easing: 'ease-in-out' }"
        >
          <!-- Checkbox para rango de fechas -->
          <div class="relative rounded-md mb-3">
            <div class="flex items-center space-x-2">
              <Checkbox
                :model-value="isDateRange"
                @update:model-value="toggleDateRange"
                class="w-4 h-4 rounded-full"
              />
              <label
                class="text-sm font-medium text-foreground cursor-pointer"
                @click="toggleDateRange"
              >
                Rango de fechas
              </label>
            </div>
          </div>

          <!-- Campo de fecha usando CalendarField -->
          <div class="relative rounded-md mb-3">
            <CalendarField
              v-model="startDate"
              :label="isDateRange ? 'Fecha de inicio' : 'Fecha'"
              placeholder="Elige una fecha"
              :min-date="new Date()"
              @update:model-value="handleDateChange"
            />
          </div>

          <!-- Campo de fecha final usando CalendarField -->
          <div
            v-if="isDateRange"
            class="relative rounded-md mb-3"
            v-auto-animate="{ duration: 200 }"
          >
            <CalendarField
              v-model="endDate"
              label="Fecha de fin"
              placeholder="Elige la fecha de fin"
              :min-date="startDate || new Date()"
              @update:model-value="handleEndDateChange"
            />
          </div>

          <!-- Input principal que se expande -->
          <div class="relative rounded-full">
            <div class="flex items-center justify-between" @click="toggleConsultQuota">
              <label class="text-sm block font-semibold pb-2">Horarios Disponibles</label>
            </div>
            <Card
              class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2 rounded-full"
              :class="[
                showConsultQuota ? 'rounded-t-xl rounded-b-none' : 'rounded-full',
                selectedTimeSlots.length > 0 ? 'bg-secondary/40' : 'bg-secondary/10',
              ]"
              @click="toggleConsultQuota"
            >
              <CardContent class="flex items-center justify-between py-1 px-2">
                <p class="text-xs text-muted-foreground">
                  {{ selectedTimeSlotsText }}
                </p>

                <Icon
                  v-if="!showConsultQuota"
                  icon="lucide:chevrons-up-down"
                  width="16"
                  height="16"
                  class="text-muted-foreground"
                />
                <Icon
                  v-if="showConsultQuota"
                  icon="lucide:chevrons-down-up"
                  width="16"
                  height="16"
                  class="text-muted-foreground"
                />
              </CardContent>
            </Card>
          </div>

          <div
            v-if="showConsultQuota"
            class="bg-secondary/10 max-h-auto overflow-y-auto pb-4"
            v-auto-animate="{ duration: 100 }"
          >
            <!-- Checkbox para seleccionar todos los horarios -->
            <div class="p-3 border-0">
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
            <div class="grid grid-cols-3 gap-2 px-3">
              <div
                v-for="(timeSlot, index) in timeSlots"
                :key="timeSlot.id"
                class="flex border-0 transition-colors"
                :class="index === timeSlots.length - 1 ? 'rounded-b-md' : 'rounded-none'"
              >
                <div
                  class="bg-background w-9/12 flex items-center justify-between space-x-4 border-1 border-secondary px-2 py-0.5ñ rounded-full m-1"
                >
                  <div class="flex items-center justify-center space-x-2 p-0 m-0">
                    <Checkbox
                      variant="secondary"
                      :model-value="isTimeSlotSelected(timeSlot.id)"
                      @update:model-value="toggleTimeSlot(timeSlot.id)"
                      class="w-4 h-4"
                    />
                    <div class="flex space-x-1">
                      <span class="text-sm font-medium text-foreground">
                        {{ timeSlot.time }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Mensaje de carga -->
            <div
              v-if="loading"
              class="p-3 bg-background border border-muted border-t-0 rounded-b-md"
            >
              <span class="text-sm text-muted-foreground text-center block">
                Cargando horarios...
              </span>
            </div>

            <!-- Mensaje de error -->
            <div
              v-if="error"
              class="p-3 bg-background border border-red-200 border-t-0 rounded-b-md"
            >
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

          <!-- Nuevo campo para cupo adicional -->
          <div class="relative rounded-md mt-3">
            <div class="flex items-center justify-between">
              <label class="text-sm block font-semibold pb-2">Cupo Adicional</label>
            </div>

            <Input
              v-model="additionalQuota"
              type="number"
              placeholder="Ingresa el cupo adicional"
              class="w-full"
              min="0"
            />
          </div>

          <!-- Nuevo campo para sobrecupo  -->
          <div class="relative rounded-md mt-3">
            <div class="flex items-center justify-between">
              <label class="text-sm block font-semibold pb-2">Sobre cupo</label>
            </div>

            <Input
              v-model="overQuota"
              type="number"
              placeholder="Ingresa el sobre cupo"
              class="w-full"
              min="0"
            />
          </div>

          <!-- Textarea para mensaje del administrador -->
          <div class="relative rounded-md mt-3">
            <div class="flex items-center justify-between">
              <label class="text-sm block font-semibold pb-2"
                >Mensaje para el usuario</label
              >
            </div>

            <Textarea
              v-model="userMessage"
              placeholder="Escribe un mensaje para el usuario..."
              class="w-full min-h-[100px] resize-none"
              rows="4"
            />
          </div>

          <!-- Textarea para mensaje del administrador -->
          <div class="relative rounded-md mt-3">
            <div class="flex items-center justify-between">
              <label class="text-sm block font-semibold pb-2"
                >Mensaje para el personal Administrador</label
              >
            </div>

            <Textarea
              v-model="adminStaffMessage"
              placeholder="Escribe un mensaje para el personal administrativo..."
              class="w-full min-h-[100px] resize-none"
              rows="4"
            />
          </div>

          <!-- Botón para crear la regla -->
          <div class="mt-4 space-y-2">
            <Button @click="createQuotaRule" class="w-full" :disabled="!canCreateRule">
              Crear Regla de Cupo
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de confirmación de conflictos -->
    <div
      v-if="showConflictDialog"
      class="flex items-center justify-center z-50"
      v-auto-animate="{ duration: 200, easing: 'ease-out' }"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh]">
        <div class="flex items-start space-x-3 mb-1">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-start text-gray-900 mb-2">
              Conflicto de Reglas Existentes
            </h3>
            <p class="text-sm text-start text-gray-700 mb-4">
              {{ conflictData?.conflictMessage }}
            </p>
          </div>
        </div>

        <!-- Detalles de los conflictos -->
        <div class="space-y-3 mb-6">
          <h4 class="text-sm font-medium text-gray-900">
            Detalles de las reglas existentes:
          </h4>
          <div
            v-for="detail in conflictData?.conflictDetails"
            :key="detail.existingRuleId"
            class="p-3 bg-secondary/10 rounded-md"
          >
            <div class="flex justify-end items-start mb-2">
              <span class="text-xs italic">Fecha: {{ detail.dateRange }}</span>
            </div>
            <div class="space-y-1">
              <div
                v-for="timeSlot in detail.conflictingTimeSlots"
                :key="timeSlot"
                class="text-xs px-2 py-2.5 rounded border border-secondary border-0 border-t-1 bg-secondary/10"
              >
                {{ timeSlot }}
              </div>
            </div>
          </div>
        </div>

        <!-- Advertencia -->
        <div class="bg-warning/90 rounded-md p-3 mb-6">
          <div class="flex flex-col items-start space-x-2">
            <div class="flex items-center space-x-2 mb-2">
              <Icon icon="mdi:information" class="w-5 h-5 mt-0 flex-shrink-0" />
              <p class="text-sm font-medium mb-0">Advertencia</p>
            </div>
            <div>
              <p class="text-sm">
                Si continúas, la nueva regla sobrescribirá las reglas existentes para las
                fechas seleccionadas.
              </p>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex flex-col space-y-3 justify-end">
          <Button @click="proceedWithRuleCreation" class="px-4 py-2 bg-primary">
            Sobrescribir reglas
          </Button>
          <Button @click="cancelRuleCreation" variant="outline" class="px-4 py-2">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import CalendarField from "@/components/common/CalendarField.vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { useCustomRules } from "@/composables/business/useCustomRules";
import { useTimeSlots } from "@/composables/business/useTimeSlots";
import { formService } from "@/lib/api/services/form/form.service";
import { Icon } from "@iconify/vue";
import type { ValidationRule } from "@/lib/api/types/form";
import { useToast } from "@/composables/ui/useToast";

// Composable para toasts
const { showSuccess, showError, showInfo } = useToast();

interface Formulario {
  id: number;
  description: string;
  enable: boolean;
  horario?: string;
  maxcupo?: string;
  currentcupo?: string;
}

interface Props {
  modelValue: number[] | number;
  label: string;
  placeholder?: string;
  cupoOptions: readonly Formulario[];
  autoOpen?: boolean;
  multiple?: boolean;
  onToggleEnable?: (id: number) => Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Seleccionar formularios...",
  autoOpen: false,
  multiple: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: number[] | number];
  "update-cupo": [cupo: Formulario];
  "new-cupo": [cupo: Formulario];
  "delete-cupo": [cupo: Formulario];
  "add-quota-rules": [];
  "consult-quota": [];
  "create-rule": [];
  "create-quota-rule": [rule: any];
}>();

const showOptions = ref(props.autoOpen);
const showConsultQuota = ref(false);

const startDate = ref(new Date());
const endDate = ref(new Date());
const isDateRange = ref(false);
const selectedDate = ref("");
const selectedEndDate = ref("");
const additionalQuota = ref<number | null>(null);
const overQuota = ref<number | null>(null);
const userMessage = ref<string>("");
const adminStaffMessage = ref<string>("");

// Variables para validación de reglas existentes
const validationRules = ref<ValidationRule[]>([]);
const validationLoading = ref(false);
const validationError = ref<string | null>(null);
const hasExistingRules = ref(false);
const showConflictDialog = ref(false);
const conflictData = ref<any>(null);

// Composable para manejar reglas personalizadas
const { clearData: clearCustomRulesData } = useCustomRules();

// Composable para manejar horarios
const {
  timeSlots,
  selectedTimeSlots,
  selectAllTimeSlots,
  loading,
  error,
  loadTimeSlots,
  toggleSelectAll,
  toggleTimeSlot,
  isTimeSlotSelected,
} = useTimeSlots();

// Computed para validar si se puede crear la regla
const canCreateRule = computed(() => {
  const hasValidDates = isDateRange.value
    ? startDate.value && endDate.value && endDate.value >= startDate.value
    : startDate.value;

  return (
    hasValidDates &&
    selectedTimeSlots.value.length > 0 &&
    additionalQuota.value >= 0 &&
    overQuota.value >= 0
  );
});

// Computed para mostrar los horarios seleccionados
const selectedTimeSlotsText = computed(() => {
  // Debug: mostrar la estructura de los timeSlots
  if (timeSlots.value.length > 0) {
    console.log("🔍 Estructura del primer timeSlot:", timeSlots.value[0]);
  }

  if (selectAllTimeSlots.value) {
    return "Todos los horarios seleccionados";
  }

  if (selectedTimeSlots.value.length === 0) {
    return "Selecciona los horarios para aplicar la regla";
  }

  if (selectedTimeSlots.value.length === 1) {
    const timeSlot = timeSlots.value.find((ts) => ts.id === selectedTimeSlots.value[0]);
    // Intentar usar time, startTime, o una combinación
    const timeDisplay =
      (timeSlot as any)?.time ||
      (timeSlot?.startTime && timeSlot?.endTime
        ? `${timeSlot.startTime} - ${timeSlot.endTime}`
        : "Horario no disponible");
    return timeSlot
      ? `Horario seleccionado: ${timeDisplay}`
      : "Selecciona los horarios para aplicar la regla";
  }

  if (selectedTimeSlots.value.length <= 3) {
    const selectedTimes = selectedTimeSlots.value
      .map((id) => {
        const timeSlot = timeSlots.value.find((ts) => ts.id === id);
        return (
          (timeSlot as any)?.time ||
          (timeSlot?.startTime && timeSlot?.endTime
            ? `${timeSlot.startTime} - ${timeSlot.endTime}`
            : null)
        );
      })
      .filter(Boolean);
    return `Horarios seleccionados: ${selectedTimes.join(", ")}`;
  }

  // Si hay más de 3 horarios, mostrar los primeros 3 y indicar cuántos más
  const selectedTimes = selectedTimeSlots.value
    .slice(0, 3)
    .map((id) => {
      const timeSlot = timeSlots.value.find((ts) => ts.id === id);
      return (
        (timeSlot as any)?.time ||
        (timeSlot?.startTime && timeSlot?.endTime
          ? `${timeSlot.startTime} - ${timeSlot.endTime}`
          : null)
      );
    })
    .filter(Boolean);
  const remainingCount = selectedTimeSlots.value.length - 3;
  return `Horarios seleccionados: ${selectedTimes.join(", ")} y ${remainingCount} más`;
});

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(
  () => props.autoOpen,
  (newValue: boolean) => {
    showOptions.value = newValue;
  }
);

// Watcher para limpiar datos cuando se cierre el componente
watch(
  () => showOptions.value,
  (newValue: boolean) => {
    if (!newValue) {
      clearCustomRulesData();
      error.value = null;
      // Limpiar estado de validación
      validationRules.value = [];
      validationError.value = null;
      hasExistingRules.value = false;
      showConflictDialog.value = false;
      conflictData.value = null;
    }
  }
);

const toggleOptions = () => {
  showOptions.value = !showOptions.value;
};

const toggleDateRange = async () => {
  isDateRange.value = !isDateRange.value;

  // Si se desactiva el rango de fechas, limpiar la fecha final
  if (!isDateRange.value) {
    endDate.value = new Date();
    selectedEndDate.value = "";
  } else {
    // Si se activa el rango de fechas, dejar la fecha final vacía
    endDate.value = new Date();
    selectedEndDate.value = "";
  }

  // Validar reglas existentes después del cambio
  if (startDate.value) {
    await validateExistingRules();
  }
};

const toggleConsultQuota = async () => {
  showConsultQuota.value = !showConsultQuota.value;

  // Cargar horarios cuando se abre la sección
  if (showConsultQuota.value && timeSlots.value.length === 0) {
    await loadTimeSlots();
  }
};

const handleDateChange = async (newDate: Date | null) => {
  if (!newDate) return;

  // Forzar la actualización del currentDate usando nextTick para asegurar reactividad
  await nextTick();
  startDate.value = new Date(newDate);
  selectedDate.value = newDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Si el rango de fechas está activado y la fecha final es anterior a la nueva fecha de inicio,
  // actualizar la fecha final
  if (isDateRange.value && endDate.value < newDate) {
    endDate.value = new Date(newDate);
    selectedEndDate.value = newDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Validar reglas existentes para la fecha seleccionada
  await validateExistingRules();

  // Cargar reglas personalizadas para la fecha seleccionada
  const dateString = newDate.toISOString().split("T")[0];
  await loadTimeSlotsForDate(dateString);
};

const handleEndDateChange = async (newDate: Date | null) => {
  if (!newDate) return;

  // Verificar que la fecha final no sea anterior a la fecha de inicio
  if (newDate < startDate.value) {
    console.warn("La fecha final no puede ser anterior a la fecha de inicio");
    return;
  }

  await nextTick();
  endDate.value = new Date(newDate);
  selectedEndDate.value = newDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Validar reglas existentes para el rango de fechas
  await validateExistingRules();
};

// Nueva función para cargar horarios específicos para una fecha
const loadTimeSlotsForDate = async (dateString: string) => {
  console.log("🚀 loadTimeSlotsForDate iniciado para fecha:", dateString);
};

// Función para validar reglas existentes
const validateExistingRules = async () => {
  if (!startDate.value) return null;

  validationLoading.value = true;
  validationError.value = null;
  hasExistingRules.value = false;

  try {
    // Formatear fechas en formato RFC 3339 (date-time)
    const startDateString = startDate.value.toISOString();

    // Preparar parámetros de consulta
    const queryParams: any = {
      isDateRange: isDateRange.value,
      startDate: startDateString,
    };

    // Solo agregar EndDate si IsDateRange es true
    if (isDateRange.value && endDate.value) {
      queryParams.endDate = endDate.value.toISOString();
    }

    console.log("📅 Validando reglas con fechas:", queryParams);

    const apiResponse = await formService.getValidationRules(queryParams);

    // Verificar si hay conflictos según la respuesta del endpoint
    hasExistingRules.value = apiResponse?.response?.hasConflict || false;

    if (hasExistingRules.value) {
      console.log(
        "⚠️ Se encontraron reglas existentes para las fechas seleccionadas:",
        apiResponse
      );
    } else {
      console.log("✅ No se encontraron reglas existentes para las fechas seleccionadas");
    }

    return apiResponse;
  } catch (error) {
    console.error("❌ Error al validar reglas existentes:", error);
    validationError.value = "Error al verificar reglas existentes";
    return null;
  } finally {
    validationLoading.value = false;
  }
};

// Función para crear la regla de cupo
const createQuotaRule = async () => {
  if (!canCreateRule.value) {
    return;
  }

  // Validar que no puedes crear reglas en dias lunes
  const dayOfWeek = startDate.value.getDay();
  if (dayOfWeek === 1) {
    showError("Error al crear regla", "No puedes crear reglas en dias lunes");
    return;
  }

  // Validar reglas existentes antes de crear
  const apiResponse = await validateExistingRules();

  if (apiResponse && apiResponse.response?.hasConflict) {
    // Mostrar diálogo de confirmación con los conflictos
    conflictData.value = {
      hasConflict: true,
      conflictMessage:
        apiResponse.response.conflictMessage ||
        `Ya existen reglas configuradas en el rango seleccionado.`,
      conflictDetails: apiResponse.response.conflictDetails || [],
    };
    showConflictDialog.value = true;
    return;
  }

  // Si no hay conflictos, crear la regla directamente
  await proceedWithRuleCreation();
};

// Función para proceder con la creación de la regla
const proceedWithRuleCreation = async () => {
  const ruleData = {
    isDateRange: isDateRange.value,
    startDate: startDate.value,
    endDate: isDateRange.value ? endDate.value : null,
    applyToAllTimeSlots: selectAllTimeSlots.value,
    selectedTimeSlotIds: selectAllTimeSlots.value ? [] : selectedTimeSlots.value,
    cupo: additionalQuota.value,
    overSlot: overQuota.value,
    userMessage: userMessage.value,
    adminMessage: adminStaffMessage.value,
  };

  console.log("📋 Creando regla de cupo:", ruleData);

  // Emitir el evento con los datos de la regla
  emit("create-quota-rule", ruleData);

  // Limpiar el formulario
  additionalQuota.value = 0;
  overQuota.value = 0;
  userMessage.value = "";
  adminStaffMessage.value = "";
  selectedTimeSlots.value = [];
  selectAllTimeSlots.value = false;

  // Limpiar estado de validación
  validationRules.value = [];
  validationError.value = null;
  hasExistingRules.value = false;
  showConflictDialog.value = false;
  conflictData.value = null;
};

// Función para cancelar la creación de la regla
const cancelRuleCreation = () => {
  showConflictDialog.value = false;
  conflictData.value = null;
};

// Cargar horarios al montar el componente si está abierto
onMounted(async () => {
  if (showConsultQuota.value) {
    await loadTimeSlots();
  }
});
</script>
