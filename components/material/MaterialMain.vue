<template>
  <div class="p-4 space-y-4">
    <h1 class="text-sm font-medium mb-1">Consulta material didáctico</h1>

    <div v-if="!selectedDate">
      <h4 class="text-sm font-semibold mt-4 mb-2">Proximas visitas</h4>
      <Select v-model="selectedDate" @update:model-value="onDateSelect" class="w-full">
        <SelectTrigger class="w-full">
          <SelectValue
            placeholder="Consulta desde las reservaciones para futuras visitas"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="(visit, idx) in visits" :key="idx" :value="visit">
            {{ formatDate(visit.date) }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>


  </div>
</template>

<script setup>
import { ref } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from '@iconify/vue'

const router = useRouter();
const showDates = ref(false);
const selectedDate = ref(null);

const visits = [
  {
    date: "2025-05-26",
    materials: [
      {
        type: "image",
        src: "https://via.placeholder.com/300x180.png?text=Imagen+1",
        title: "Material de Matemáticas",
        description: "Ejercicios de álgebra para secundaria.",
      },
      {
        type: "video",
        src: "https://www.w3schools.com/html/mov_bbb.mp4",
        title: "Video de Ciencias",
        description: "Explicación sobre la fotosíntesis.",
      },
    ],
  },
  {
    date: "2025-05-15",
    materials: [
      {
        type: "image",
        src: "https://via.placeholder.com/300x180.png?text=Imagen+2",
        title: "Material de Historia",
        description: "Línea del tiempo de la Revolución Mexicana.",
      },
    ],
  },
];

function onDateSelect(visit) {
  // Navegar a la página de material-visita con los parámetros de la fecha
  navigateTo({
    path: '/material/material-visita',
    query: {
      date: visit.date,
      formattedDate: formatDate(visit.date)
    }
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('es-ES', { month: 'long' });
  const year = date.getFullYear();
  
  // Capitalizar la primera letra del mes
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  
  return `${day} ${capitalizedMonth} ${year}`;
}
</script>
