<template>
  <div id="card-wrapper" class="relative">
    <template v-if="reservation.status === 'Confirmada'">
      <div class="size-10 absolute -top-4 right-3 z-10">
        <button
          class="size-10 rounded-full bg-white border-[#FFD040] border-2 flex items-center justify-center shadow-lg"
        >
          <Icon
            icon="material-symbols:calendar-check-outline"
            height="24"
            width="24"
            style="color: #3c3c3b"
          />
        </button>
      </div>
    </template>
    <template v-else-if="reservation.status === 'Incompleta'">
      <div class="size-10 absolute -top-4 right-3 z-10">
        <button
          class="size-10 rounded-full bg-white border-[#FFD040] border-2 flex items-center justify-center shadow-lg"
        >
          <Icon
            icon="material-symbols:nest-clock-farsight-analog-rounded"
            height="24"
            width="24"
            style="color: #3c3c3b"
          />
        </button>
      </div>
    </template>
    <template v-else-if="reservation.status === 'Modificada'">
      <div class="size-10 absolute -top-4 right-3 z-10">
        <button
          class="size-10 rounded-full bg-white border-[#FFD040] border-2 flex items-center justify-center shadow-lg"
        >
          <Icon
            icon="material-symbols:edit-rounded"
            height="24"
            width="24"
            style="color: #3c3c3b"
          />
        </button>
      </div>
    </template>
    <template v-else-if="reservation.status === 'Asistió'">
      <div class="size-10 absolute -top-4 right-3 z-10">
        <button
          class="size-10 rounded-full bg-white border-[#FFD040] border-2 flex items-center justify-center shadow-lg"
        >
          <Icon
            icon="material-symbols:mark-chat-read-outline"
            height="24"
            width="24"
            style="color: #3c3c3b"
          />
        </button>
      </div>
    </template>
    <Card
      class="bg-[#E5ECF6] shadow-[4px_4px_16px_rgba(0,0,0,0.3)] p-0 overflow-hidden relative rounded-[30px] border-none"
    >
      <CardContent class="p-0 pb-0">
        <div class="flex gap-4 px-6 pt-5 pb-0">
          <!-- Sección de información principal -->
          <div class="w-full">
            <div class="flex gap-x-5 text-start">
              <div class="grid grid-1 gap-y-1.5">
                <div class="flex items-center gap-2">
                  <p class="w-28 text-sm text-[#3C3C3B] font-normal italic truncate">
                    Estatus:
                  </p>
                  <p class="text-base text-[#3C3C3B] font-semibold">
                    {{ reservation.status || "N/A" }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <p class="w-28 text-sm text-[#3C3C3B] font-normal italic truncate">
                    Tipo:
                  </p>
                  <p class="text-base text-[#3C3C3B] font-medium">
                    {{ reservation.reservationType || "N/A" }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <p class="w-28 text-sm text-[#3C3C3B] font-normal italic truncate">
                    ID:
                  </p>
                  <p class="text-base text-[#3C3C3B] font-medium">
                    {{ reservation.folio || "N/A" }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <p class="w-28 text-sm text-[#3C3C3B] font-normal italic truncate">
                    Fecha:
                  </p>
                  <p class="text-base text-[#3C3C3B] font-medium">
                    {{ formatDate(reservation.reservationDate) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <p class="w-28 text-sm text-[#3C3C3B] font-normal italic truncate">
                    Asistentes:
                  </p>
                  <p class="text-base text-[#3C3C3B] font-medium">
                    {{ reservation.totalPeople >= 0 ? reservation.totalPeople : "N/A" }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <p class="w-28 text-sm text-[#3C3C3B] font-normal italic truncate">
                    Visitante:
                  </p>
                  <p class="text-base text-[#3C3C3B] font-medium">
                    {{ reservation.visitor || "N/A" }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <p class="w-28 text-sm text-[#3C3C3B] font-normal italic truncate">
                    Total:
                  </p>
                  <p class="text-base text-[#3C3C3B] font-medium">
                    {{
                      (reservation?.totalCost || 0)?.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <hr class="w-full border-t-2 border-[#3C3C3B] mx-auto mt-3.5" />

            <!-- Accordion para materiales -->
            <AccordionRoot type="single" collapsible class="w-full py-4">
              <AccordionItem value="materials" class="border-none">
                <AccordionTrigger
                  class="w-full flex items-center justify-between text-sm text-[#3C3C3B] font-normal italic hover:no-underline cursor-pointer py-2"
                >
                  Materiales
                  <Icon
                    icon="material-symbols:unfold-more"
                    width="18"
                    height="18"
                    class="AccordionChevron font-semibold"
                    style="color: #7d7d7d"
                  />
                </AccordionTrigger>
                <AccordionContent
                  class="pt-2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
                >
                  <div class="grid grid-cols-2">
                    <div>
                      <div
                        class="w-full flex flex-col gap-y-3 border-r-2 border-[#3C3C3B] pr-6"
                      >
                        <div class="text-lg text-[#3C3C3B] font-medium">Postales</div>
                        <div class="flex items-center gap-x-2">
                          <div
                            class="w-fit h-auto bg-[#652F6C] shadow-[4px_4px_16px_rgba(0,0,0,0.3)] rounded-full p-2 cursor-pointer"
                          >
                            <Icon
                              icon="material-symbols:download-rounded"
                              width="24"
                              height="24"
                              class="font-semibold"
                              style="color: #ffffff"
                            />
                          </div>
                          <span class="text-sm text-[#3C3C3B] font-normal"
                            >Descargar todo</span
                          >
                        </div>
                        <div class="flex items-center gap-x-2">
                          <div
                            class="w-fit h-auto bg-[#652F6C] shadow-[4px_4px_16px_rgba(0,0,0,0.3)] rounded-full p-2 cursor-pointer"
                          >
                            <Icon
                              icon="material-symbols:visibility-outline"
                              width="24"
                              height="24"
                              class="font-semibold"
                              style="color: #ffffff"
                            />
                          </div>
                          <span class="text-sm text-[#3C3C3B] font-normal">Ver más</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div class="w-full flex flex-col gap-y-3 pl-6">
                        <div class="text-lg text-[#3C3C3B] font-medium">
                          Menú de visita
                        </div>
                        <div class="flex items-center gap-x-2">
                          <div
                            class="w-fit h-auto bg-[#652F6C] shadow-[4px_4px_16px_rgba(0,0,0,0.3)] rounded-full p-2 cursor-pointer"
                          >
                            <Icon
                              icon="material-symbols:download-rounded"
                              width="24"
                              height="24"
                              class="font-semibold"
                              style="color: #ffffff"
                            />
                          </div>
                          <span class="text-sm text-[#3C3C3B] font-normal"
                            >Descargar todo</span
                          >
                        </div>
                        <div class="flex items-center gap-x-2">
                          <div
                            class="w-fit h-auto bg-[#652F6C] shadow-[4px_4px_16px_rgba(0,0,0,0.3)] rounded-full p-2 cursor-pointer"
                          >
                            <Icon
                              icon="material-symbols:visibility-outline"
                              width="24"
                              height="24"
                              class="font-semibold"
                              style="color: #ffffff"
                            />
                          </div>
                          <span class="text-sm text-[#3C3C3B] font-normal">Ver más</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- <Carousel class="w-full" :opts="{ align: 'start' }">
                  <CarouselContent>
                    <CarouselItem v-for="(file, index) in files" :key="index" class="basis-2/5">
                      <div class="p-0">
                        <div class="rounded-lg border bg-muted-foreground/5 flex items-center justify-center">
                          <div class="text-center">
                            <div class="w-full h-24 mx-auto mb-1 rounded flex items-center justify-center">
                              <Icon v-if="file.type === 'pdf'" icon="lucide:file-text" width="32" height="32" />
                              <Icon v-else-if="file.type === 'image'" icon="lucide:image" width="32" height="32" />
                              <Icon v-else icon="lucide:file-text" width="32" height="32" />
                            </div>
                          </div>
                        </div>
                        <p class="text-xs italic font-light truncate">{{ file.name }}</p>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel> -->
                </AccordionContent>
              </AccordionItem>
            </AccordionRoot>
          </div>
        </div>
        <Button
          v-if="reservation.status !== 'Cancelada'"
          variant="secondary"
          @click="$emit('viewDetails', reservation)"
          class="bg-[#3364B8] w-full text-lg text-[#FFFFFF] font-semibold rounded-none cursor-pointer"
        >
          ver detalle
          <Icon
            icon="material-symbols:visibility-outline"
            width="24"
            height="24"
            class="font-semibold"
          />
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "reka-ui";
import { Icon } from "@iconify/vue";

const props = defineProps({
  reservation: {
    type: Object,
    required: true,
  },
});

defineEmits(["viewDetails"]);

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Datos de ejemplo para los archivos - esto debería venir del backend
const files = computed(() => [
  { name: "documento.pdf", type: "pdf", size: "2.5 MB" },
  { name: "imagen.jpg", type: "image", size: "1.2 MB" },
  { name: "presentacion.pptx", type: "document", size: "5.1 MB" },
  { name: "video.mp4", type: "video", size: "15.3 MB" },
]);

const statusVariant = computed(() => {
  const variants = {
    Confirmada: "secondary",
    Incompleta: "warning",
    Pendiente: "secondary",
    Reagendó: "secondary",
  };
  return variants[props.reservation.status] || "default";
});

const borderColorClass = computed(() => {
  const colors = {
    Confirmada: "border-l-green-500",
    Incompleta: "border-l-orange-500",
    Pendiente: "border-l-yellow-500",
    Reagendó: "border-l-blue-500",
  };
  return colors[props.reservation.status] || "border-l-gray-500";
});
</script>
