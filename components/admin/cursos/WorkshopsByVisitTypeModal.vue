<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          <span class="block text-primary font-bold text-base mt-1">
            Talleres Elegibles por Tipo de Visita
          </span>
        </DialogTitle>
        <DialogDescription>
          Configura qué talleres estarán disponibles para cada tipo de visita
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 sm:gap-6 py-4">
        <!-- Tipos de visita -->
        <div v-for="visitType in visitTypes" :key="visitType.id" class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground">{{ visitType.name }}</h3>
            <Switch
              v-model="visitType.enabled"
              @update:model-value="toggleVisitType(visitType.id)"
            />
          </div>

          <div v-if="visitType.enabled" class="space-y-2">
            <div class="text-xs text-muted-foreground">
              Selecciona los talleres disponibles para este tipo de visita:
            </div>
            <div class="grid gap-2">
              <div
                v-for="workshop in availableWorkshops"
                :key="workshop.id"
                class="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border border-muted rounded-md hover:bg-muted/30"
              >
                <Checkbox
                  :model-value="isWorkshopSelected(visitType.id, workshop.id)"
                  @update:model-value="toggleWorkshop(visitType.id, workshop.id)"
                />
                <div class="flex-1 min-w-0">
                  <span class="text-sm font-medium break-words">{{
                    workshop.description
                  }}</span>
                  <div class="text-xs text-muted-foreground mt-1">
                    <span class="block sm:inline"
                      >Duración: {{ workshop.duration }} min</span
                    >
                    <span class="block sm:inline sm:ml-2"
                      >Capacidad: {{ workshop.currentCapacity }}/{{
                        workshop.maxCapacity
                      }}</span
                    >
                  </div>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                  <span
                    :class="workshop.isActive ? 'text-green-600' : 'text-red-600'"
                    class="text-xs font-medium"
                  >
                    {{ workshop.isActive ? "Activo" : "Inactivo" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-6">
        <Button variant="outline" @click="isOpen = false"> Cancelar </Button>
        <Button @click="saveConfiguration" :disabled="loading">
          <span v-if="loading" class="flex items-center gap-2">
            <div
              class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            ></div>
            Guardando...
          </span>
          <span v-else>Guardar Configuración</span>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/composables/ui/useToast";

interface VisitType {
  id: number;
  name: string;
  enabled: boolean;
}

interface Workshop {
  id: number;
  description: string;
  duration: number;
  maxCapacity: number;
  currentCapacity: number;
  isActive: boolean;
}

interface WorkshopSelection {
  visitTypeId: number;
  workshopId: number;
}

const emit = defineEmits(["save", "update:open"]);

const isOpen = defineModel("open", { type: Boolean, default: false });

const loading = ref(false);
const { showSuccess, showError } = useToast();

// Datos de ejemplo - en producción vendrían de la API
const visitTypes = ref<VisitType[]>([
  { id: 1, name: "Visita Escolar", enabled: true },
  { id: 2, name: "Visita Empresarial", enabled: true },
  { id: 3, name: "Visita General", enabled: false },
]);

const availableWorkshops = ref<Workshop[]>([
  {
    id: 1,
    description: "Taller de Robótica",
    duration: 60,
    maxCapacity: 20,
    currentCapacity: 15,
    isActive: true,
  },
  {
    id: 2,
    description: "Taller de Programación",
    duration: 90,
    maxCapacity: 15,
    currentCapacity: 8,
    isActive: true,
  },
  {
    id: 3,
    description: "Taller de Diseño 3D",
    duration: 120,
    maxCapacity: 12,
    currentCapacity: 5,
    isActive: true,
  },
  {
    id: 4,
    description: "Taller de Electrónica",
    duration: 75,
    maxCapacity: 18,
    currentCapacity: 12,
    isActive: false,
  },
]);

const workshopSelections = ref<WorkshopSelection[]>([]);

const toggleVisitType = (visitTypeId: number) => {
  const visitType = visitTypes.value.find((vt) => vt.id === visitTypeId);
  if (visitType) {
    visitType.enabled = !visitType.enabled;
    if (!visitType.enabled) {
      // Remover todas las selecciones de talleres para este tipo de visita
      workshopSelections.value = workshopSelections.value.filter(
        (selection) => selection.visitTypeId !== visitTypeId
      );
    }
  }
};

const toggleWorkshop = (visitTypeId: number, workshopId: number) => {
  const existingSelection = workshopSelections.value.find(
    (selection) =>
      selection.visitTypeId === visitTypeId && selection.workshopId === workshopId
  );

  if (existingSelection) {
    // Remover selección
    workshopSelections.value = workshopSelections.value.filter(
      (selection) =>
        !(selection.visitTypeId === visitTypeId && selection.workshopId === workshopId)
    );
  } else {
    // Agregar selección
    workshopSelections.value.push({ visitTypeId, workshopId });
  }
};

const isWorkshopSelected = (visitTypeId: number, workshopId: number): boolean => {
  return workshopSelections.value.some(
    (selection) =>
      selection.visitTypeId === visitTypeId && selection.workshopId === workshopId
  );
};

const saveConfiguration = async () => {
  loading.value = true;

  try {
    // Aquí iría la llamada a la API para guardar la configuración
    const configuration = {
      visitTypes: visitTypes.value,
      workshopSelections: workshopSelections.value,
    };

    console.log("Guardando configuración:", configuration);

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess("Éxito", "La configuración se guardó correctamente");
    emit("save", configuration);
    isOpen.value = false;
  } catch (error) {
    console.error("Error al guardar la configuración:", error);
    showError("Error", "No se pudo guardar la configuración");
  } finally {
    loading.value = false;
  }
};
</script>
