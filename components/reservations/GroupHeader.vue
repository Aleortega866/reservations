<template>
  <div class="flex items-center gap-3 my-6">
    <div class="">
      <!-- Icono de estado -->
      <div class="flex items-center gap-2">
        <span class="font-semibold text-gray-800 text-xl">
          {{ groupName }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps({
  groupName: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});

// ============================================================================
// GROUP COLORS AND ICONS
// ============================================================================

const getGroupColor = (groupName: string): string => {
  const colorMap: Record<string, string> = {
    Confirmada: "bg-green-500",
    "Sin Confirmar": "bg-yellow-500",
    Cancelada: "bg-red-500",
    Modificada: "bg-blue-500",
    Reagendada: "bg-purple-500",
    Incompleta: "bg-orange-500",
    Creada: "bg-gray-500",
  };

  return colorMap[groupName] || "bg-gray-400";
};

const getGroupIcon = (groupName: string): string => {
  const iconMap: Record<string, string> = {
    Confirmada: "material-symbols:check-circle",
    "Sin Confirmar": "material-symbols:pending",
    Cancelada: "material-symbols:cancel",
    Modificada: "material-symbols:edit",
    Reagendada: "material-symbols:schedule",
    Incompleta: "material-symbols:incomplete-circle",
    Creada: "material-symbols:add-circle",
  };

  return iconMap[groupName] || "material-symbols:help";
};
</script>
