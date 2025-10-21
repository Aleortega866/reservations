<template>
  <div>
    <div class="space-y-0 mt-1" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
      <!-- Input principal que se expande -->
      <div class="relative" :class="showOptions ? 'rounded-t-md' : 'rounded-md'">
        <Card
          class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2"
          :class="[showOptions ? 'rounded-t-xl rounded-b-none' : 'rounded-full']"
          @click="toggleOptions"
        >
          <CardContent class="flex items-center justify-between py-1 px-1">
            <p class="text-sm font-semibold">Codigos de vinculación</p>
            <Icon
              v-if="showOptions"
              icon="lucide:chevrons-down-up"
              width="16"
              height="16"
              class="text-muted-foreground"
            />
            <Icon
              v-else
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
        class="space-y-0"
        v-auto-animate="{ duration: 150, easing: 'ease-in-out' }"
      >
        <!-- Botón de agregar nuevo código -->
        <div
          class="p-3 bg-primary/20 hover:bg-primary/30 transition-colors cursor-pointer"
          @click="openAddDialog"
        >
          <div class="flex items-center justify-between space-x-2 px-2">
            <span class="text-sm text-muted-foreground font-medium"
              >Agregar nuevo código</span
            >
            <Icon icon="lucide:plus" width="16" height="16" class="text-primary" />
          </div>
        </div>

        <!-- Spinner de carga -->
        <div
          v-if="props.loading"
          class="p-8 bg-background border border-muted border-t-0 rounded-b-md flex justify-center items-center"
        >
          <div class="relative">
            <div class="w-8 h-8 rounded-full border-4 border-gray-200"></div>
            <div
              class="w-8 h-8 rounded-full border-4 border-primary border-t-transparent absolute top-0 left-0 animate-spin"
            ></div>
          </div>
        </div>

        <!-- Lista de opciones -->
        <div v-else class="max-h-auto overflow-y-auto" v-auto-animate="{ duration: 100 }">
          <div
            v-for="(option, index) in props.options"
            :key="option.value"
            class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors"
            :class="[
              index === props.options.length - 1 ? 'rounded-b-md' : 'rounded-none',
              index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]',
            ]"
          >
            <div class="grid grid-cols-6 gap-4 items-center overflow-hidden">
              <div class="flex items-center space-x-2 col-span-3">
                <!-- Switch por item -->
                <Switch
                  :model-value="switchStates[option.value]"
                  @update:model-value="(value) => handleSwitchChange(option, value)"
                  class="mr-2"
                />
                <span class="ps-2 text-sm truncate text-muted-foreground cursor-pointer">
                  {{ option.label }}
                </span>
              </div>
              <div class="flex items-center justify-start space-x-2 col-span-2">
                <span class="text-sm text-muted-foreground font-bold">
                  {{ option.maxcupo }}
                </span>
                <span class="text-sm text-gray-400"> / </span>
                <span class="text-sm text-muted-foreground italic">
                  {{ option.currentcupo }}
                </span>
              </div>
              <div class="flex items-center justify-end space-x-3 col-span-1">
                <Icon
                  @click.stop="openEditDialog(option)"
                  icon="lucide:pencil"
                  width="16"
                  height="16"
                  class="text-primary hover:text-primary cursor-pointer transition-colors"
                />
                <Icon
                  @click.stop="openDeleteDialog(option)"
                  icon="lucide:trash-2"
                  width="16"
                  height="16"
                  class="text-destructive hover:text-primary cursor-pointer transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- Mensaje si no hay opciones -->
          <div
            v-if="props.options.length === 0"
            class="p-3 bg-background border border-muted border-t-0 rounded-b-md"
          >
            <span class="text-sm text-muted-foreground text-center block">
              No hay opciones disponibles
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de edición -->
    <EditPromotionCodeDialog
      v-if="selectedPromotion"
      v-model:open="showEditDialog"
      :promotion="selectedPromotion"
      @updated="handlePromotionUpdated"
    />

    <!-- Diálogo de agregar nuevo código -->
    <CreatePromotionCodeDialog
      v-model:open="showAddDialog"
      @created="handlePromotionCreated"
    />

    <!-- Diálogo de confirmación de eliminación -->
    <DeletePairingCodeDialog
      v-model:open="showDeleteDialog"
      :pairing-code="selectedPairingCode"
      @deleted="handlePairingCodeDeleted"
    />

    <!-- Diálogo de éxito para mostrar el código creado -->
    <SuccessPromotionCodeDialog
      :is-open="showSuccessDialog"
      :code-promotion="codePromotion"
      @update:is-open="showSuccessDialog = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { Switch } from "@/components/ui/switch";

import EditPromotionCodeDialog from "./EditPromotionCodeDialog.vue";
import CreatePromotionCodeDialog from "./CreatePromotionCodeDialog.vue";
import DeletePairingCodeDialog from "./DeletePairingCodeDialog.vue";
import SuccessPromotionCodeDialog from "./SuccessPromotionCodeDialog.vue";
import type { LinkingCode } from "@/lib/api/types/promotion";
import { usePromotions } from "@/composables/business/usePromotions";

interface Option {
  value: string;
  label: string;
  price: string;
  description?: string;
  maxcupo: string;
  currentcupo: string;
  id?: number;
  code?: string;
  startDate?: string;
  endDate?: string;
}

interface Props {
  modelValue: string[] | string;
  label: string;
  placeholder?: string;
  options: Option[];
  autoOpen?: boolean;
  multiple?: boolean;
  loading?: boolean;
  linkingCodes?: LinkingCode[];
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Seleccionar opciones...",
  autoOpen: false,
  multiple: true,
  loading: false,
  linkingCodes: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string[] | string];
  "update-ticket": [ticket: Option];
  "add-ticket": [ticket: { code: string; maxCupo: string }];
  "promotion-created": [promotion: any];
  "promotion-updated": [promotion: any];
  "toggle": [isOpen: boolean];
}>();

const showOptions = ref(props.autoOpen);
const showEditDialog = ref(false);
const showAddDialog = ref(false);
const showDeleteDialog = ref(false);
const showSuccessDialog = ref(false);
const selectedTicket = ref<Option | null>(null);
const selectedPromotion = ref<LinkingCode | null>(null);
const selectedPairingCode = ref<LinkingCode | null>(null);
const switchStates = reactive<{ [key: string]: boolean }>({});
const codePromotion = ref<string>("");

// Composable para manejar promociones
const { activateLinkingCode } = usePromotions();

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(
  () => props.autoOpen,
  (newValue: boolean) => {
    showOptions.value = newValue;
  }
);

// Inicializar estados del switch basándose en los códigos de vinculación
watch(
  () => props.linkingCodes,
  (newCodes: any) => {
    if (newCodes && newCodes.length > 0) {
      newCodes.forEach((code: any) => {
        if (code.id) {
          const key = code.id.toString();
          // Solo actualizar si no existe o si es diferente
          if (!(key in switchStates) || switchStates[key] !== code.enable) {
            switchStates[key] = code.enable;
          }
        }
      });
    }
  },
  { immediate: true, deep: true }
);

const toggleOptions = () => {
  showOptions.value = !showOptions.value;
  // Emitir evento al componente padre para cargar datos si se está abriendo
  emit("toggle", showOptions.value);
};

// Abrir diálogo de edición
const openEditDialog = (ticket: Option) => {
  selectedTicket.value = ticket;

  console.log("Opening edit dialog for ticket:", ticket);

  // Buscar el código de vinculación real en los datos de la API
  if (ticket.id && props.linkingCodes) {
    const realPromotion = props.linkingCodes.find((code) => code.id === ticket.id);

    if (realPromotion) {
      selectedPromotion.value = realPromotion;
      console.log("Found real promotion data:", realPromotion);
    } else {
      console.warn("No real promotion data found for id:", ticket.id);
      // Fallback: crear objeto con datos disponibles
      selectedPromotion.value = {
        id: ticket.id,
        code: ticket.code || "",
        name: ticket.label,
        ticketPrice: parseFloat(ticket.price),
        maxTickets: ticket.maxcupo === "Sin límite" ? null : parseInt(ticket.maxcupo),
        startDate: ticket.startDate || "",
        endDate: ticket.endDate || "",
        description: ticket.description || null,
        messageUser: null,
        messageAdmin: null,
        status: "Activo",
        enable: true,
        userModifiedId: 1,
        dateModified: new Date().toISOString(),
      };
      console.log("Created fallback promotion object:", selectedPromotion.value);
    }
  } else {
    console.error("No ticket.id or linkingCodes available");
  }

  showEditDialog.value = true;
};

// Abrir diálogo de agregar nuevo código
const openAddDialog = () => {
  showAddDialog.value = true;
};

// Manejar guardado del ticket
const handleSaveTicket = (updatedTicket: Option) => {
  emit("update-ticket", updatedTicket);
  showEditDialog.value = false;
  selectedTicket.value = null;
};

// Manejar agregado de nuevo ticket
const handleAddTicket = (data: { code: string; maxCupo: string }) => {
  emit("add-ticket", data);
  showAddDialog.value = false;
};

// Manejar creación de promoción
const handlePromotionCreated = (promotion: any) => {
  console.log("Promoción creada recibida:", promotion);
  emit("promotion-created", promotion);
  showAddDialog.value = false;

  // Mostrar el diálogo de éxito con el código generado
  if (promotion) {
    // El código puede estar en promotion.code o promotion.name
    const codeToShow = promotion || "Código creado exitosamente";
    codePromotion.value = codeToShow;
    showSuccessDialog.value = true;
    console.log("Abriendo diálogo de éxito con código:", codeToShow);
  } else {
    console.warn("No se recibió objeto de promoción válido");
  }
};

// Manejar actualización de promoción
const handlePromotionUpdated = (promotion: LinkingCode) => {
  emit("promotion-updated", promotion);
  showEditDialog.value = false;
  selectedPromotion.value = null;
  selectedTicket.value = null;
};

// Abrir diálogo de eliminación
const openDeleteDialog = (option: Option) => {
  // Buscar el código de vinculación real en los datos de la API
  if (option.id && props.linkingCodes) {
    const realPromotion = props.linkingCodes.find((code) => code.id === option.id);

    if (realPromotion) {
      selectedPairingCode.value = realPromotion;
      console.log("Found real promotion data for deletion:", realPromotion);
    } else {
      console.warn("No real promotion data found for deletion with id:", option.id);
      // Fallback: crear objeto con datos disponibles
      selectedPairingCode.value = {
        id: option.id,
        code: option.code || "",
        name: option.label,
        ticketPrice: parseFloat(option.price),
        maxTickets: option.maxcupo === "Sin límite" ? null : parseInt(option.maxcupo),
        startDate: option.startDate || "",
        endDate: option.endDate || "",
        description: option.description || null,
        messageUser: null,
        messageAdmin: null,
        status: "Activo",
        enable: true,
        userModifiedId: 1,
        dateModified: new Date().toISOString(),
      };
      console.log(
        "Created fallback promotion object for deletion:",
        selectedPairingCode.value
      );
    }
  } else {
    console.error("No ticket.id or linkingCodes available for deletion");
    return;
  }

  showDeleteDialog.value = true;
};

// Manejar eliminación de código de emparejamiento
const handlePairingCodeDeleted = (pairingCode: LinkingCode) => {
  console.log("Pairing code deleted:", pairingCode);
  // Aquí puedes emitir un evento para que el componente padre actualice la lista
  // o llamar directamente al servicio de eliminación
  emit("promotion-updated", pairingCode); // Reutilizamos el evento existente
  showDeleteDialog.value = false;
  selectedPairingCode.value = null;
};

// Manejar cambio de estado del switch
const handleSwitchChange = async (option: Option, newValue: boolean) => {
  try {
    if (!option.id) {
      console.error("No se puede cambiar el estado: ID no disponible");
      return;
    }

    // Actualizar el estado local inmediatamente para feedback visual
    switchStates[option.value] = newValue;

    const result = await activateLinkingCode({
      id: option.id,
      enable: newValue,
    });

    if (result) {
      // Confirmar el estado después de la respuesta exitosa
      switchStates[option.value] = result.enable;
    } else {
      // Revertir si no hubo respuesta exitosa
      switchStates[option.value] = !newValue;
    }
  } catch (error) {
    console.error("❌ Error al cambiar el estado del código:", error);
    // Revertir el cambio en caso de error
    switchStates[option.value] = !newValue;
  }
};
</script>
