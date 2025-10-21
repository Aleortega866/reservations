<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent
      class="sm:max-w-[500px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh] overflow-hidden"
    >
      <DialogHeader class="p-6 pb-0">
        <DialogTitle class="text-lg text-start font-semibold"
          >Gestionar cupo temporal</DialogTitle
        >
      </DialogHeader>

      <div class="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        <section>
          <QuotaRulesDay
            label="Consultar cupo específico por día"
            v-auto-animate="{ duration: 100, easing: 'ease-out' }"
            :modelValue="selectedCupo"
            :cupoOptions="scheduleOptions"
            :onToggleEnable="handleToggleEnableCupo"
            @update:modelValue="updateSelectedCupo"
            @update-cupo="handleUpdateCupo"
            @new-cupo="handleNewCupo"
            @delete-cupo="handleDeleteCupo"
            @add-quota-rules="handleAddQuotaRules"
          />

          <!-- Mostrar estado de carga -->
          <div v-if="schedulesLoading" class="p-4 text-center">
            <p class="text-muted-foreground">Cargando horarios...</p>
          </div>

          <!-- Mostrar error si existe -->
          <div
            v-if="schedulesError"
            class="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
          >
            <p class="text-destructive text-sm">{{ schedulesError }}</p>
          </div>
        </section>

        <!-- Nueva sección para crear reglas específicas -->
        <section>
          <!-- Diálogo para crear reglas específicas -->
          <CreateSpecificQuotaRule
            label="Crear nueva regla específica"
            v-auto-animate="{ duration: 100, easing: 'ease-out' }"
            :modelValue="selectedCupo"
            :cupoOptions="scheduleOptions"
            :onToggleEnable="handleToggleEnableCupo"
            @update:modelValue="updateSelectedCupo"
            @update-cupo="handleUpdateCupo"
            @new-cupo="handleNewCupo"
            @delete-cupo="handleDeleteCupo"
            @add-quota-rules="handleAddQuotaRules"
            @create-quota-rule="handleCreateQuotaRule"
          />
        </section>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ref, onMounted } from "vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { useSchedules } from "@/composables/business/useSchedules";
import { useToast } from "@/composables/ui/useToast";
import { formService } from "@/lib/api/services/form/form.service";
import type { CreateCustomRuleRequest } from "@/lib/api/types";
import QuotaRulesDay from "@/components/admin/cupos/QuotaRulesDay.vue";
import CreateSpecificQuotaRule from "@/components/admin/cupos/CreateSpecificQuotaRule.vue";

// Composable para manejar horarios
const {
  scheduleOptions,
  loading: schedulesLoading,
  error: schedulesError,
  initialize: initializeSchedules,
  toggleScheduleEnableStatus,
} = useSchedules();

// Composable para toasts
const { showSuccess, showError, showInfo } = useToast();

// Cargar horarios al montar el componente
onMounted(async () => {
  await initializeSchedules();
});

// Estado para los cupos seleccionados
const selectedCupo = ref<number[]>([]);

const updateSelectedCupo = (cupo: number[] | number) => {
  if (Array.isArray(cupo)) {
    selectedCupo.value = cupo;
  } else {
    selectedCupo.value = [cupo];
  }
};

const handleUpdateCupo = async (cupo: any) => {
  try {
    showInfo("Actualizando cupo", "Procesando los cambios...", { duration: 2000 });

    // Aquí se implementaría la lógica para actualizar en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 2000));

    showSuccess(
      "Cupo actualizado",
      `El cupo "${cupo.description || cupo.name}" se ha actualizado correctamente`
    );
    console.log("Cupo actualizado:", cupo);
  } catch (error) {
    showError("Error al actualizar", "No se pudo actualizar el cupo");
    console.error("Error al actualizar cupo:", error);
  }
};

const handleNewCupo = async (cupo: any) => {
  try {
    showInfo("Creando cupo", "Procesando la creación...");

    // Aquí se implementaría la lógica para crear en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess(
      "Cupo creado",
      `El cupo "${cupo.description || cupo.name}" se ha creado exitosamente`
    );
    console.log("Nuevo cupo creado:", cupo);
  } catch (error) {
    showError("Error al crear", "No se pudo crear el cupo");
    console.error("Error al crear cupo:", error);
  }
};

const handleDeleteCupo = async (cupo: any) => {
  try {
    showInfo("Eliminando cupo", "Procesando la eliminación...");

    // Aquí se implementaría la lógica para eliminar en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess(
      "Cupo eliminado",
      `El cupo "${cupo.description || cupo.name}" se ha eliminado correctamente`
    );
    console.log("Cupo eliminado:", cupo);
  } catch (error) {
    showError("Error al eliminar", "No se pudo eliminar el cupo");
    console.error("Error al eliminar cupo:", error);
  }
};

const handleToggleEnableCupo = async (id: number) => {
  try {
    showInfo("Cambiando estado", "Actualizando el estado del horario...", {
      duration: 2000,
    });

    await toggleScheduleEnableStatus(id);

    // El mensaje de éxito se maneja dentro del composable
    console.log(`Estado del horario ${id} actualizado exitosamente`);
  } catch (error) {
    setTimeout(() => {
      showError("Error al cambiar estado", "Ocurrió un error inesperado");
    }, 2000);
    console.error("Error al cambiar el estado del horario:", error);
  }
};

const handleAddQuotaRules = () => {
  showInfo("Reglas de cupo", "Abriendo configuración de reglas específicas de cupo...");
  console.log("Abriendo diálogo de reglas de cupo");
  // Aquí se implementaría la lógica para abrir el diálogo de reglas de cupo
};

const handleCreateQuotaRule = async (ruleData: any) => {
  try {
    console.log("=== CREANDO REGLA DE CUPO ===");
    console.log("Datos de la regla:", ruleData);

    showInfo("Creando regla de cupo", "Procesando la creación de la regla...");

    // Llamar al servicio real de la API
    const createdRule = await formService.createCustomRule(ruleData);

    showSuccess("Regla creada", "La regla de cupo se ha creado exitosamente");
    console.log("Regla de cupo creada exitosamente:", createdRule);

    // Cerrar el diálogo después de crear la regla
    handleClose();
  } catch (error) {
    showError("Error al crear regla", "No se pudo crear la regla de cupo");
    console.error("Error al crear regla de cupo:", error);
  }
};

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
}>();

const handleClose = () => {
  emit("update:isOpen", false);
};
</script>
