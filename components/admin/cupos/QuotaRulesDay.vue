<template>
  <div>
    <div
      class="space-y-0 mt-1 overflow-hidden"
      v-auto-animate="{ duration: 200, easing: 'ease-out' }"
    >
      <div class="flex items-center justify-between mb-2" @click="toggleOptions">
        <label class="text-sm block font-normal mb-0">{{ label }}</label>
        <Icon
          v-if="showOptions"
          icon="lucide:chevrons-down-up"
          width="16"
          height="16"
          class="text-muted-foreground"
        />
      </div>

      <!-- Input principal que se expande -->
      <div class="relative mb-0" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
        <Card
          v-if="!showOptions"
          class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2"
          :class="[showOptions ? 'rounded-t-xl rounded-b-none' : 'rounded-full']"
          @click="toggleOptions"
        >
          <CardContent class="flex items-center justify-between py-1 px-1">
            <p class="text-xs font-normal">
              Consulta las reglas de cupos creadas anteriormente
            </p>
            <Icon
              v-if="!showOptions"
              icon="lucide:chevrons-up-down"
              width="16"
              height="16"
              class="text-muted-foreground"
            />
          </CardContent>
        </Card>
      </div>

      <!-- Opciones que se expanden hacia abajo -->
      <div
        v-if="showOptions"
        class="space-y-0 pt-3 px-2 pb-4"
        v-auto-animate="{ duration: 150, easing: 'ease-in-out' }"
      >
        <!-- Selector de fecha usando CalendarField -->
        <div class="relative rounded-md mb-3">
          <CalendarField
            v-model="currentDate"
            :disable-colors="false"
            label="Fecha"
            placeholder="Elige una fecha"
            @update:model-value="handleDateChange"
          />
        </div>

        <!-- Input principal que se expande -->
        <div class="relative">
          <div class="flex items-center justify-between" @click="toggleConsultQuota">
            <label class="text-sm block font-normal pb-1">Horario</label>
          </div>
          <Card
            class="h-10 bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-1 py-1"
            :class="[showConsultQuota ? 'rounded-t-xl rounded-b-none' : 'rounded-full']"
            @click="toggleConsultQuota"
          >
            <CardContent class="flex items-center justify-between py-1 px-2">
              <p class="text-sm" :class="{ 'opacity-60': !showConsultQuota }">
                Consulta el cupo específico por dia
              </p>
              <Icon
                v-if="!showConsultQuota"
                icon="lucide:chevrons-up-down"
                width="16"
                height="16"
              />
              <Icon
                v-if="showConsultQuota"
                icon="lucide:chevrons-down-up"
                width="16"
                height="16"
              />
            </CardContent>
          </Card>
        </div>

        <div
          v-if="showConsultQuota"
          class="max-h-auto overflow-y-auto"
          v-auto-animate="{ duration: 100 }"
        >
          <!-- Loading state -->
          <div v-if="loading" class="p-3 bg-background border border-muted border-t-0">
            <div class="flex items-center justify-center space-x-2">
              <div
                class="ml-2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
              ></div>
              <span class="text-sm text-muted-foreground">Cargando horarios...</span>
            </div>
          </div>

          <!-- Error state -->
          <div
            v-else-if="error"
            class="p-3 bg-background border border-muted border-t-0 rounded-b-md"
          >
            <span class="text-sm text-destructive text-center block">
              Error: {{ error }}
            </span>
          </div>

          <!-- Horarios cargados desde el API -->
          <div
            v-else-if="availableTimeSlots.length > 0"
            v-for="(timeSlot, index) in availableTimeSlots"
            :key="timeSlot.customRuleTimeSlotId"
            class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors"
            :class="[
              index === availableTimeSlots.length - 1 ? 'rounded-b-md' : 'rounded-none',
              index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]',
            ]"
          >
            <div class="w-full flex items-center justify-between space-x-4">
              <div class="w-full flex justify-between items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <!-- Switch por horario -->
                  <Switch
                    :model-value="timeSlot.enable"
                    class="mr-2"
                    @update:model-value="
                      handleToggleTimeSlot(timeSlot.customRuleTimeSlotId)
                    "
                    :disabled="
                      !props.onToggleEnable ||
                      updatingTimeSlot === timeSlot.customRuleTimeSlotId
                    "
                  />
                  <div class="flex space-x-1">
                    <span class="text-sm font-medium text-foreground"> Horario: </span>
                    <span class="text-sm font-medium text-foreground">
                      {{ timeSlot.time }}
                    </span>
                    <!-- Indicador de carga -->
                    <!-- <div v-if="updatingTimeSlot === timeSlot.customRuleTimeSlotId" class="ml-2 mt-1 flex items-center space-x-1">
                                            <div class="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                                            <div class="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                            <div class="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            </div> -->
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-foreground"> Cupo: </span>
                  <div class="flex items-center justify-center space-x-1">
                    <span class="text-sm font-medium text-foreground">
                      {{ timeSlot.slot }}
                    </span>
                    <span class="text-sm font-medium text-foreground"> - </span>
                    <span class="text-sm font-medium text-foreground">
                      {{ timeSlot.overSlot }}
                    </span>
                  </div>
                  <!-- Botón para resetear sobre cupo -->
                  <div class="flex items-center space-x-1">
                    <button
                      @click="handleResetOverSlot(timeSlot.timeSlotId)"
                      :disabled="resettingOverSlot === timeSlot.timeSlotId"
                      class="flex items-center space-x-1 px-2 py-1 text-xs"
                    >
                      <Icon
                        v-if="resettingOverSlot !== timeSlot.timeSlotId"
                        icon="mage:refresh"
                        width="16"
                        height="16"
                        class="text-muted-foreground cursor-pointer"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje si no hay horarios -->
          <div
            v-else-if="!loading && availableTimeSlots.length === 0"
            class="p-3 bg-background border border-muted border-t-0 rounded-b-md"
          >
            <span class="text-sm text-muted-foreground text-center block">
              No hay horarios disponibles para esta fecha
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { Switch } from "@/components/ui/switch";
import { useCustomRules } from "@/composables/business/useCustomRules";
import { formService } from "@/lib/api/services/form/form.service";
import { Icon } from "@iconify/vue";
import CalendarField from "@/components/common/CalendarField.vue";
import type { CustomRuleSchedule } from "@/lib/api/types";

interface TimeSlot {
  customRuleTimeSlotId: number;
  timeSlotId: number;
  time: string;
  enable: boolean;
  slot: number;
  overSlot: number;
}

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
}>();

const showOptions = ref(props.autoOpen);
const showQuotaRulesDialog = ref(false);
const showConsultQuota = ref(false);

const currentDate = ref();
const availableTimeSlots = ref<TimeSlot[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const updatingTimeSlot = ref<number | null>(null);
const resettingOverSlot = ref<number | null>(null);

// Composable para manejar reglas personalizadas
const {
  customRules,
  customRuleSchedules,
  customRuleScheduleOptions,
  loading: customRulesLoading,
  error: customRulesError,
  loadCustomRulesByDate,
  clearData: clearCustomRulesData,
} = useCustomRules();

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
      availableTimeSlots.value = [];
      error.value = null;
    }
  }
);

// Watcher para monitorear cambios en currentDate
watch(
  () => currentDate.value,
  (newDate) => {
    console.log("👀 Watcher detectó cambio en currentDate:", newDate);
    console.log("👀 formattedDate actual:", formattedDate.value);
  }
);

const toggleOptions = () => {
  showOptions.value = !showOptions.value;
};

const handleToggleEnable = async (id: number) => {
  if (props.onToggleEnable) {
    try {
      await props.onToggleEnable(id);
    } catch (error) {
      console.error("Error al cambiar el estado del formulario:", error);
    }
  }
};

const handleToggleTimeSlot = async (customRuleTimeSlotId: number) => {
  console.log("🔄 Cambiando estado del horario:", customRuleTimeSlotId);

  // Mostrar estado de carga para este horario específico
  updatingTimeSlot.value = customRuleTimeSlotId;

  try {
    // Llamada al API para actualizar el estado del horario
    const response = await formService.updateCustomRuleTimeSlotStatus(
      customRuleTimeSlotId
    );
    console.log("✅ Respuesta del API al actualizar horario:", response);

    // Recargar los horarios para reflejar el cambio
    const dateString = currentDate.value.toISOString().split("T")[0];
    await loadTimeSlotsForDate(dateString);

    console.log("✅ Estado del horario actualizado exitosamente");
  } catch (err) {
    console.error("❌ Error al actualizar el estado del horario:", err);
    // Mostrar error al usuario
    error.value = err instanceof Error ? err.message : "Error al actualizar el horario";
  } finally {
    // Limpiar estado de carga
    updatingTimeSlot.value = null;
  }
};

const handleResetOverSlot = async (customRuleTimeSlotId: number) => {
  console.log("🔄 Reseteando sobre cupo para horario:", customRuleTimeSlotId);

  // Validar que el ID sea válido
  if (!customRuleTimeSlotId || customRuleTimeSlotId <= 0) {
    console.error("❌ ID de horario inválido:", customRuleTimeSlotId);
    error.value = "ID de horario inválido. No se puede resetear el sobre cupo.";
    return;
  }

  // Mostrar estado de carga para esta operación específica
  resettingOverSlot.value = customRuleTimeSlotId;

  try {
    // Llamada al API para resetear el sobre cupo
    const response = await formService.resetCustomRuleOverSlot(customRuleTimeSlotId);
    console.log("✅ Respuesta del API al resetear sobre cupo:", response);

    // Recargar los horarios para reflejar el cambio
    const dateString = currentDate.value.toISOString().split("T")[0];
    await loadTimeSlotsForDate(dateString);

    console.log("✅ Sobre cupo reseteado exitosamente");
  } catch (err) {
    console.error("❌ Error al resetear el sobre cupo:", err);
    // Mostrar error al usuario
    error.value = err instanceof Error ? err.message : "Error al resetear el sobre cupo";
  } finally {
    // Limpiar estado de carga
    resettingOverSlot.value = null;
  }
};

const openQuotaRulesDialog = () => {
  showQuotaRulesDialog.value = true;
};

const handleConsultQuota = () => {
  emit("consult-quota");
};

const handleCreateRule = () => {
  emit("create-rule");
};

const openAddDialog = () => {
  emit("add-quota-rules");
};

const toggleConsultQuota = () => {
  showConsultQuota.value = !showConsultQuota.value;
};

// Función para formatear la fecha (computed para reactividad)
const formattedDate = computed(() => {
  console.log("🔄 Computed formattedDate ejecutándose con fecha:", currentDate.value);
  const formatted = currentDate.value.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  console.log("🔄 formattedDate resultado:", formatted);
  return formatted;
});

const handleDateChange = async (newDate: Date | null) => {
  console.log("🔄 handleDateChange llamado con fecha:", newDate);

  if (!newDate) {
    console.log("❌ No se seleccionó fecha válida");
    return;
  }

  console.log("📅 currentDate antes:", currentDate.value);

  // Forzar la actualización del currentDate usando nextTick para asegurar reactividad
  await nextTick();
  currentDate.value = new Date(newDate);

  console.log("📅 currentDate después:", currentDate.value);
  console.log("📅 formattedDate después:", formattedDate.value);

  // Cargar reglas personalizadas para la fecha seleccionada
  const dateString = newDate.toISOString().split("T")[0];
  console.log("📅 Fecha formateada:", dateString);
  await loadTimeSlotsForDate(dateString);
};

// Nueva función para cargar horarios específicos para una fecha
const loadTimeSlotsForDate = async (dateString: string) => {
  console.log("🚀 loadTimeSlotsForDate iniciado para fecha:", dateString);
  loading.value = true;
  error.value = null;
  availableTimeSlots.value = [];

  try {
    console.log("📡 Haciendo petición al API...");
    // Usar el servicio real del API
    const response = await formService.getCustomRuleSchedulesByDate(dateString);
    console.log("✅ Respuesta del API:", response);

    // Verificar si la respuesta tiene la estructura esperada
    if (
      response &&
      (response as any).availableTimeSlots &&
      Array.isArray((response as any).availableTimeSlots)
    ) {
      // Convertir los horarios al formato esperado por el componente
      availableTimeSlots.value = (response as any).availableTimeSlots.map(
        (schedule: any) => ({
          customRuleTimeSlotId: schedule.customRuleTimeSlotId,
          timeSlotId: schedule.timeSlotId,
          time: schedule.time,
          enable: schedule.enable,
          slot: schedule.slot,
          overSlot: schedule.overSlot,
        })
      );
    } else {
      console.warn("⚠️ La respuesta del API no tiene la estructura esperada:", response);
      availableTimeSlots.value = [];
    }

    console.log("🎯 Horarios procesados:", availableTimeSlots.value);
  } catch (err) {
    console.error("❌ Error en loadTimeSlotsForDate:", err);
    error.value = err instanceof Error ? err.message : "Error al cargar los horarios";
    console.error("Error loading time slots:", err);
  } finally {
    loading.value = false;
    console.log("🏁 loadTimeSlotsForDate completado");
  }
};

const handleReloadTimeSlot = async (customRuleTimeSlotId: number) => {
  console.log("🔄 handleReloadTimeSlot llamado con:", customRuleTimeSlotId);
  await loadTimeSlotsForDate(currentDate.value.toISOString().split("T")[0]);
};
</script>
