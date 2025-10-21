<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          <span class="block text-primary font-bold text-base mt-1">
            Configurar Rangos de Horas
          </span>
        </DialogTitle>
        <DialogDescription>
          Define los rangos de tiempo disponibles para las reservaciones
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <!-- Configuración general -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-foreground">Configuración General</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Hora de Inicio</label>
              <Input v-model="config.startTime" type="time" placeholder="08:00" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Hora de Fin</label>
              <Input v-model="config.endTime" type="time" placeholder="18:00" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Duración de Sesión (minutos)</label>
              <Input
                v-model="config.sessionDuration"
                type="number"
                placeholder="60"
                min="15"
                step="15"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium"
                >Intervalo entre Sesiones (minutos)</label
              >
              <Input
                v-model="config.interval"
                type="number"
                placeholder="30"
                min="0"
                step="15"
              />
            </div>
          </div>
        </div>

        <!-- Días de la semana -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-foreground">Días Disponibles</h3>

          <div class="grid gap-3">
            <div
              v-for="day in weekDays"
              :key="day.id"
              class="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-muted rounded-md space-y-3 sm:space-y-0"
            >
              <div class="flex items-center space-x-3">
                <Switch v-model="day.enabled" @update:model-value="toggleDay(day.id)" />
                <span class="text-sm font-medium">{{ day.name }}</span>
              </div>

              <div
                v-if="day.enabled"
                class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2"
              >
                <span class="text-xs text-muted-foreground">Horario especial:</span>
                <div class="flex items-center space-x-2">
                  <Input
                    v-model="day.specialStartTime"
                    type="time"
                    class="w-24"
                    placeholder="09:00"
                  />
                  <span class="text-xs text-muted-foreground">-</span>
                  <Input
                    v-model="day.specialEndTime"
                    type="time"
                    class="w-24"
                    placeholder="17:00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de pausas -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground">Pausas y Recesos</h3>
            <Button variant="outline" size="sm" @click="addBreak"> Agregar Pausa </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(breakItem, index) in breaks"
              :key="index"
              class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 p-3 border border-muted rounded-md"
            >
              <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                <Input v-model="breakItem.startTime" type="time" placeholder="12:00" />
                <Input v-model="breakItem.endTime" type="time" placeholder="13:00" />
                <Input v-model="breakItem.description" placeholder="Almuerzo" />
              </div>
              <Button
                variant="outline"
                size="sm"
                @click="removeBreak(index)"
                class="w-full sm:w-auto"
              >
                Eliminar
              </Button>
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
import { ref } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/composables/ui/useToast";

interface WeekDay {
  id: number;
  name: string;
  enabled: boolean;
  specialStartTime?: string;
  specialEndTime?: string;
}

interface Break {
  startTime: string;
  endTime: string;
  description: string;
}

interface TimeConfig {
  startTime: string;
  endTime: string;
  sessionDuration: string;
  interval: string;
}

const emit = defineEmits(["save", "update:open"]);

const isOpen = defineModel("open", { type: Boolean, default: false });

const loading = ref(false);
const { showSuccess, showError } = useToast();

const config = ref<TimeConfig>({
  startTime: "08:00",
  endTime: "18:00",
  sessionDuration: "60",
  interval: "30",
});

const weekDays = ref<WeekDay[]>([
  { id: 1, name: "Lunes", enabled: true },
  { id: 2, name: "Martes", enabled: true },
  { id: 3, name: "Miércoles", enabled: true },
  { id: 4, name: "Jueves", enabled: true },
  { id: 5, name: "Viernes", enabled: true },
  { id: 6, name: "Sábado", enabled: false },
  { id: 7, name: "Domingo", enabled: false },
]);

const breaks = ref<Break[]>([
  { startTime: "12:00", endTime: "13:00", description: "Almuerzo" },
]);

const toggleDay = (dayId: number) => {
  const day = weekDays.value.find((d) => d.id === dayId);
  if (day) {
    day.enabled = !day.enabled;
  }
};

const addBreak = () => {
  breaks.value.push({
    startTime: "",
    endTime: "",
    description: "",
  });
};

const removeBreak = (index: number) => {
  breaks.value.splice(index, 1);
};

const saveConfiguration = async () => {
  loading.value = true;

  try {
    // Aquí iría la llamada a la API para guardar la configuración
    const configuration = {
      general: config.value,
      weekDays: weekDays.value,
      breaks: breaks.value,
    };

    console.log("Guardando configuración de horarios:", configuration);

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess("Éxito", "La configuración de horarios se guardó correctamente");
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
