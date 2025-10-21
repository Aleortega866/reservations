<template>
  <div class="pt-4 px-4 pb-24">
    <div class="space-y-4">
      <WorkshopInfoHeader />

      <div v-for="(workshop, index) in workshops" :key="workshop.id" class="relative">
        <WorkshopCard
          :title="workshop.title"
          :expandable="true"
          :expanded="index === 0"
          :class="[
            selectedWorkshops.includes(workshop.id)
              ? 'ring-1 ring-primary border-muted-foreground'
              : '',
            isWorkshopDisabled(workshop.id)
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer',
          ]"
          @click="handleWorkshopClick(workshop.id)"
        >
          <template #media>
            <div
              class="w-full h-32 bg-muted rounded-lg flex items-center justify-center mb-4"
            >
              <Icon
                icon="lucide:play"
                width="32"
                height="32"
                class="text-muted-foreground"
              />
            </div>
          </template>

          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium">{{ workshop.location }}</span>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ workshop.description }}
            </p>
            <p class="text-xs text-muted-foreground">
              <strong>Duración:</strong> {{ workshop.duration }}
            </p>

            <TimeSlotSelector
              :time-slots="workshop.timeSlots"
              :selected-slots="selectedTimeSlots[workshop.id] || []"
              @select="(time: string) => selectTimeSlot(workshop.id, time)"
            />
          </div>
        </WorkshopCard>

        <div
          v-if="selectedWorkshops.includes(workshop.id)"
          class="absolute bottom-4 right-4 w-6 h-6 bg-muted-foreground rounded-full flex items-center justify-center z-10"
        >
          <Icon icon="lucide:check" width="16" height="16" class="text-white" />
        </div>
      </div>

      <Button
        @click="$emit('finish')"
        class="w-full bg-muted-foreground hover:bg-muted-foreground/90 text-background transition-all"
        :disabled="selectedWorkshops.length === 0"
        :class="selectedWorkshops.length > 0 ? 'bg-primary hover:bg-primary/90' : ''"
      >
        {{
          selectedWorkshops.length === 0
            ? "Selecciona al menos un taller"
            : `Terminar (${selectedWorkshops.length}/${maxWorkshops} seleccionado${
                selectedWorkshops.length > 1 ? "s" : ""
              })`
        }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import WorkshopCard from "./WorkshopCard.vue";
import TimeSlotSelector from "./TimeSlotSelector.vue";
import WorkshopInfoHeader from "./WorkshopInfoHeader.vue";
import { useToast } from "@/composables/ui/useToast";

interface Workshop {
  id: string;
  title: string;
  location: string;
  description: string;
  duration: string;
  timeSlots: string[];
}

const props = defineProps<{
  workshops: Workshop[];
  selectedTimeSlots: Record<string, string[]>;
  maxWorkshops?: number;
}>();

const emit = defineEmits<{
  (e: "selectTimeSlot", workshop: string, time: string): void;
  (e: "selectWorkshop", workshopId: string): void;
  (e: "finish"): void;
}>();

const selectedWorkshops = ref<string[]>([]);
const maxWorkshops = props.maxWorkshops || 3;
const { showWarning } = useToast();

const isWorkshopDisabled = (workshopId: string) => {
  return (
    !selectedWorkshops.value.includes(workshopId) &&
    selectedWorkshops.value.length >= maxWorkshops
  );
};

const handleWorkshopClick = (workshopId: string) => {
  if (isWorkshopDisabled(workshopId)) {
    showWarning(
      "Límite alcanzado",
      `Solo puedes seleccionar un máximo de ${maxWorkshops} taller${
        maxWorkshops > 1 ? "es" : ""
      } por solicitud.`
    );
    return;
  }
  toggleWorkshopSelection(workshopId);
};

const toggleWorkshopSelection = (workshopId: string) => {
  const index = selectedWorkshops.value.indexOf(workshopId);
  if (index > -1) {
    selectedWorkshops.value.splice(index, 1);
  } else {
    if (selectedWorkshops.value.length < maxWorkshops) {
      selectedWorkshops.value.push(workshopId);
    }
  }
  emit("selectWorkshop", workshopId);
};

const selectTimeSlot = (workshop: string, time: string) => {
  emit("selectTimeSlot", workshop, time);
};
</script>
