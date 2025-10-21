<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Header -->
      <AdminHeader
        title="Gestión de costos y promociones"
        showBackButton
        showMoreButton
        @goBack="goBack"
      />
      <!-- Contenido -->
      <div class="w-full mx-0 lg:max-w-2xl lg:mx-auto p-4 pt-12 mb-16 space-y-4 flex-1">
      <section>
        <TicketCostList
          label="Modifica aquí los costos de los boletos"
          v-auto-animate="{ duration: 100, easing: 'ease-out' }"
          :modelValue="selectedTickets"
          :options="ticketOptions"
          :loading="costsLoading"
          @update:modelValue="updateSelectedTickets"
          @update-ticket="handleTicketUpdate"
          @success="handleSuccess"
        />
      </section>

      <section>
        <PairingCodeList
          label="Gestion codigos de vinculación"
          v-auto-animate="{ duration: 100, easing: 'ease-out' }"
          :modelValue="selectedTickets"
          :options="pairingCodeOptions"
          :loading="promotionsLoading"
          :linkingCodes="linkingCodesData"
          @update:modelValue="updateSelectedTickets"
          @promotion-created="handlePromotionCreated"
          @promotion-updated="handlePromotionUpdated"
          @toggle="handlePairingCodeToggle"
        />
      </section>
    </div>
      <!-- Bottom Navigation -->
      <BottomNavigation
        :showReservationButton="true"
        @open-chat="handleOpenChat"
        :showFooter="true"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import AdminHeader from "@/components/admin/AdminHeader.vue";
import TicketCostList from "@/components/admin/costos/TicketCostList.vue";
import PairingCodeList from "@/components/admin/costos/PairingCodeList.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import { useCostService } from "@/composables/business/useCost";
import { usePromotionService } from "@/composables/business/usePromotions";
import type { Cost, LinkingCode } from "~/lib/api/types";
import { useToast } from "@/composables/ui/useToast";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

// ============================================================================
// COMPOSABLES DE SERVICIOS
// ============================================================================

// Composable de costos
const {
  costs,
  loading: costsLoading,
  error: costsError,
  getAllCosts,
  createCost,
  updateCost,
  archiveCost,
  deleteCost,
} = useCostService();

// Composable de promociones
const {
  linkingCodes,
  loading: promotionsLoading,
  error: promotionsError,
  getAllLinkingCodes,
  createLinkingCode,
  updateLinkingCode,
  deleteLinkingCode,
} = usePromotionService();

// ============================================================================
// ESTADOS DEL COMPONENTE
// ============================================================================

// Estado para controlar la visibilidad de la lista
const showTicketList = ref(false);

// Estado para los tickets seleccionados
const selectedTickets = ref<string[]>([]);

// Composable para notificaciones
const { showSuccess, showError } = useToast();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

// Convertir los costos de la API al formato esperado por TicketCostList
const ticketOptions = computed(() => {
  if (!costs.value || costs.value.length === 0) {
    return [];
  }

  return costs.value.map((cost: Cost) => {
    const option: any = {
      value: cost.id.toString(),
      label: cost.cost || `Costo ${cost.id}`,
      price: cost.amount.toFixed(2),
      description: `Fecha efectiva: ${new Date(cost.effectiveDate).toLocaleDateString(
        "es-ES"
      )}`,
      status: cost.isArchived ? "Inactivo" : "Activo",
      id: cost.id,
    };
    return option;
  });
});

// Convertir los códigos de vinculación de la API al formato esperado por PairingCodeList
const pairingCodeOptions = computed(() => {
  if (!linkingCodes.value || linkingCodes.value.length === 0) {
    return [];
  }

  return linkingCodes.value
    .filter((code: LinkingCode) => code.id != null) // Filtrar códigos sin ID válido
    .map((code: LinkingCode) => {
      const option: any = {
        value: code.id?.toString() || "",
        label: code.name || "",
        price: code.ticketPrice?.toFixed(2) || "0.00",
        maxcupo: code.maxTickets?.toString() || "Sin límite",
        currentcupo: "0", // La API no devuelve currentTickets, usamos 0 como valor por defecto
        description: code.description || "",
        status: code.enable ? "Activo" : "Inactivo",
        startDate: code.startDate || "",
        endDate: code.endDate || "",
        code: code.code || "", // Agregamos el código para referencia
        id: code.id,
      };
      return option;
    });
});

// Convertir el readonly a mutable para el template
const linkingCodesData = computed(() => [...linkingCodes.value]);

// ============================================================================
// MÉTODOS
// ============================================================================

const router = useRouter();

const goBack = () => {
  router.back();
};

const updateSelectedTickets = (tickets: string[] | string) => {
  if (Array.isArray(tickets)) {
    selectedTickets.value = tickets;
  } else {
    selectedTickets.value = [tickets];
  }
};

const editTicket = (ticket: any) => {
  // Aquí puedes agregar la lógica para editar el ticket
  console.log("Editar ticket:", ticket);
};

const handleTicketUpdate = async (updatedTicket: any) => {
  console.log("Ticket actualizado:", updatedTicket);
};

const handleSuccess = async (data: { id: number; newAmount: number }) => {
  console.log("Actualización exitosa:", data);

  try {
    // Recargar los costos para mostrar los datos actualizados
    await getAllCosts();
  } catch (err) {
    console.error("Error recargando costos después de la actualización:", err);
    showError("Error", "No se pudieron recargar los costos actualizados");
  }
};

// Manejar creación de promoción
const handlePromotionCreated = async (promotion: any) => {
  console.log("Promoción creada:", promotion);

  try {
    // Recargar los códigos de vinculación para mostrar el nuevo código
    await getAllLinkingCodes();
    showSuccess("Éxito", "Código de promoción creado exitosamente");
  } catch (err) {
    console.error("Error recargando códigos después de la creación:", err);
    showError("Error", "No se pudieron recargar los códigos de vinculación");
  }
};

// Manejar actualización de promoción
const handlePromotionUpdated = async (promotion: any) => {
  console.log("Promoción actualizada:", promotion);

  // No necesitamos recargar los datos ya que el composable actualiza el estado local
  // Solo mostramos un mensaje de éxito si es necesario
  // showSuccess("Éxito", "Código de promoción actualizado exitosamente");
};

// Manejar toggle de la lista de códigos de vinculación
const handlePairingCodeToggle = async (isOpen: boolean) => {
  console.log("Toggle de lista de códigos:", isOpen);

  // Si se está abriendo la lista, cargar los datos
  if (isOpen && linkingCodes.value.length === 0) {
    try {
      await getAllLinkingCodes();
      console.log("✅ Códigos de vinculación cargados:", linkingCodes.value.length);
    } catch (err) {
      console.error("❌ Error cargando códigos de vinculación:", err);
      showError("Error", "No se pudieron cargar los códigos de vinculación");
    }
  }
};

// ============================================================================
// CICLO DE VIDA
// ============================================================================

onMounted(async () => {
  console.log("🔄 Componente admin/costos montado - iniciando carga de datos");

  try {
    // Solo cargar costos al montar el componente
    // Los códigos de vinculación se cargarán cuando se abra la lista
    console.log("📡 Ejecutando getAllCosts()");

    await getAllCosts();

    console.log("✅ Datos cargados exitosamente:");
    console.log("   - Costos cargados:", costs.value?.length || 0, "elementos");
  } catch (err) {
    console.error("❌ Error cargando datos:", err);
  }
});

// Manejar apertura del chat
const handleOpenChat = () => {
  console.log("Abriendo chat...");
  // Aquí puedes implementar la lógica para abrir el chat
};
</script>
