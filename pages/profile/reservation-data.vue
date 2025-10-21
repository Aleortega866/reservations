<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Header -->
      <ProfileHeader
        :current-screen="'reservations-data'"
        :title="'Instituciones guardadas'"
        :show-back-button="true"
        @go-back="goBack"
      />

      <!-- Contenido -->
      <div class="w-full lg:max-w-2xl lg:mx-auto p-4 pt-12 space-y-4 flex-1">
      <div class="space-y-2">
        <h3 class="text-sm font-medium mb-1">Escuelas y centros educativos</h3>
        <!-- Selector de instituciones -->
        <ClientOnly>
          <div>
            <div
              class="py-3 px-4 bg-secondary/40 cursor-pointer hover:bg-secondary/80 transition-colors mb-0"
              :class="showInstitutionSelector ? 'rounded-t-md' : 'rounded-full'"
              @click="toggleInstitutionSelector"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold">{{ institutionHeaderText }}</span>
                <Icon v-if="showInstitutionSelector" icon="mdi:chevron-down-up" />
                <Icon v-else icon="mdi:chevron-up-down" />
              </div>
            </div>
            <div ref="institutionSelector" v-auto-animate class="mt-0 space-y-0">
              <!-- Botón para agregar nueva institución -->
              <div
                v-if="showInstitutionSelector"
                class="p-3 bg-background border-0 overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors rounded-none"
              >
                <AddInstitutionDialog @add-institutions="addInstitution">
                  <template #trigger>
                    <div
                      class="bg-primary/15 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors -mx-3 -my-3 px-3 py-3 rounded-none"
                    >
                      <span class="text-sm text-primary">
                        Agregar una nueva institución
                      </span>
                      <Icon icon="gridicons:add" class="w-6 h-6 text-primary" />
                    </div>
                  </template>
                </AddInstitutionDialog>
              </div>
              <!-- Indicador de carga -->
              <div
                v-if="showInstitutionSelector && loading"
                class="px-4 py-3 text-center"
              >
                <div class="flex items-center justify-center space-x-2">
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
                  ></div>
                  <span class="text-sm text-muted-foreground"
                    >Cargando instituciones...</span
                  >
                </div>
              </div>

              <!-- Lista de instituciones -->
              <div
                v-else-if="showInstitutionSelector && visitorInstitutions.length === 0"
                class="w-full h-full px-4 py-3 text-center bg-secondary/10"
              >
                <span class="text-sm text-muted-foreground"
                  >No hay instituciones disponibles</span
                >
              </div>

              <div
                v-else-if="showInstitutionSelector"
                v-for="(inst, index) in visitorInstitutions"
                :key="getOptionKey(inst.institutionName)"
                :class="[
                  'px-4 py-2 cursor-pointer border-t-1 border-secondary transition-colors',
                  index % 2 === 0
                    ? 'bg-secondary/20 hover:bg-secondary/40'
                    : 'bg-secondary/10 hover:bg-secondary/40',
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">
                    {{ inst.institutionName }}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-5 w-5 text-destructive hover:bg-destructive hover:text-white ml-2"
                    @click.stop="removeInstitution(inst)"
                    :disabled="deletingInstitutionId === Number(inst.id)"
                  >
                    <div
                      v-if="deletingInstitutionId === Number(inst.id)"
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
                    ></div>
                    <Icon icon="material-symbols:delete-outline" class="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>

      <div class="space-y-2">
        <h3 class="text-sm font-medium mb-1">Gestionar Empresas</h3>
        <!-- Selector de empresas -->
        <ClientOnly>
          <div>
            <div
              class="py-3 px-4 bg-secondary/40 cursor-pointer hover:bg-muted/80 transition-colors mb-0"
              :class="showCompanySelector ? 'rounded-t-md' : 'rounded-full'"
              @click="toggleCompanySelector"
            >
              <div class="flex items-center justify-between">
                <!-- <span class="text-sm text-muted-foreground">{{ selectedCompany || 'Selecciona una empresa' }}</span> -->
                <span class="text-sm font-semibold">{{ companyHeaderText }}</span>
                <Icon v-if="showCompanySelector" icon="mdi:chevron-down-up" />
                <Icon v-else icon="mdi:chevron-up-down" />
              </div>
            </div>
            <div ref="companySelector" v-auto-animate class="mt-0 space-y-0">
              <!-- Botón para agregar nueva empresa -->
              <div
                v-if="showCompanySelector"
                class="p-3 bg-background border-0 overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors rounded-0"
              >
                <AddCompanyDialog
                  @add-company="addCompany"
                  @company-created-success="onCompanyCreatedSuccess"
                >
                  <template #trigger>
                    <div
                      class="bg-primary/15 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors -mx-3 -my-3 px-3 py-3 rounded-none"
                    >
                      <span class="text-sm text-primary"> Agregar nueva empresa </span>
                      <Icon icon="gridicons:add" class="w-6 h-6 text-primary" />
                    </div>
                  </template>
                </AddCompanyDialog>
              </div>

              <!-- Indicador de carga -->
              <div v-if="showCompanySelector && loading" class="px-4 py-3 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
                  ></div>
                  <span class="text-sm text-muted-foreground">Cargando empresas...</span>
                </div>
              </div>

              <!-- Lista de empresas -->
              <div
                v-else-if="showCompanySelector && visitorCompanies.length === 0"
                class="w-full h-full px-4 py-3 text-center bg-secondary/10"
              >
                <span class="text-sm text-muted-foreground"
                  >No hay empresas disponibles</span
                >
              </div>

              <div
                v-else-if="showCompanySelector"
                v-for="(company, index) in visitorCompanies"
                :key="getOptionKey(company.companyName)"
                :class="[
                  'px-4 py-2 cursor-pointer border-t-1 border-secondary transition-colors',
                  index % 2 === 0
                    ? 'bg-secondary/20 hover:bg-secondary/40'
                    : 'bg-secondary/10 hover:bg-secondary/40',
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">
                    {{ company.companyName }}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-5 w-5 text-destructive hover:bg-destructive hover:text-white ml-22"
                    @click.stop="removeCompany(company)"
                    :disabled="deletingCompanyId === Number(company.id)"
                  >
                    <div
                      v-if="deletingCompanyId === Number(company.id)"
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
                    ></div>
                    <Icon v-else icon="material-symbols:delete-outline" class="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
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

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import AddInstitutionDialog from "@/components/profile/AddInstitutionDialog.vue";
import AddCompanyDialog from "@/components/profile/AddCompanyDialog.vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/ui/useToast";
import ProfileHeader from "@/components/profile/ProfileHeader.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import { useApiVisitor } from "@/lib/api/composables/visitor";
import { useAuth } from "@/lib/api/composables/auth";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

// Router
const router = useRouter();

// Store y composables
const authStore = useAuthStore();
const { showError, showSuccess, showInfo } = useToast();

// Composable para visitor
const {
  visitorInstitutions,
  visitorCompanies,
  getVisitorInstitutions,
  getVisitorCompanies,
  deleteVisitorInstitution,
  deleteVisitorCompany,
  loading,
} = useApiVisitor();

// Auth composable
const { user } = useAuth();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// Estado reactivo
const showInstitutionSelector = ref(false);
const showCompanySelector = ref(false);
const institutionSelector = ref();
const companySelector = ref();
const selectedCompany = ref("");
const deletingCompanyId = ref(null);
const deletingInstitutionId = ref(null);

// Computed properties
const institutionHeaderText = computed(() => {
  if (visitorInstitutions.value.length === 0) {
    return "No hay instituciones educativas";
  } else if (visitorInstitutions.value.length === 1) {
    return visitorInstitutions.value[0].institutionName;
  } else {
    return `${visitorInstitutions.value[0].institutionName} y ${
      visitorInstitutions.value.length - 1
    } más`;
  }
});

const companyHeaderText = computed(() => {
  if (visitorCompanies.value.length === 0) {
    return "No hay empresas";
  } else if (visitorCompanies.value.length === 1) {
    return visitorCompanies.value[0].companyName;
  } else {
    return `${visitorCompanies.value[0].companyName} y ${
      visitorCompanies.value.length - 1
    } más`;
  }
});

// Función para regresar
const goBack = () => {
  router.push("/profile");
};

// Manejar apertura del chat
const handleOpenChat = () => {
  console.log("Abriendo chat...");
  // Aquí puedes implementar la lógica para abrir el chat
};

// Funciones para manejar la interfaz
const toggleInstitutionSelector = async () => {
  showInstitutionSelector.value = !showInstitutionSelector.value;
  if (showCompanySelector.value) {
    showCompanySelector.value = false;
  }

  // Si se está abriendo el selector, cargar las instituciones
  if (showInstitutionSelector.value) {
    try {
      await refreshInstitutions();
    } catch (error) {
      showError(
        "Error al cargar instituciones",
        "No se pudieron cargar las instituciones. Por favor, intenta nuevamente."
      );
    }
  }
};

const toggleCompanySelector = async () => {
  showCompanySelector.value = !showCompanySelector.value;
  if (showInstitutionSelector.value) {
    showInstitutionSelector.value = false;
  }

  // Si se está abriendo el selector, cargar las empresas
  if (showCompanySelector.value) {
    try {
      await refreshCompanies();
    } catch (error) {
      showError(
        "Error al cargar empresas",
        "No se pudieron cargar las empresas. Por favor, intenta nuevamente."
      );
    }
  }
};

const getOptionKey = (name) => {
  return `option-${name}-${Date.now()}`;
};

// Funciones para cargar datos
const refreshInstitutions = async () => {
  try {
    // console.log("🔄 Cargando instituciones...");
    // console.log("👤 Usuario actual:", user.value);
    // console.log("📧 Email del usuario:", user.value?.email);

    await getVisitorInstitutions({ visitorId: user.value?.userId });

    // console.log("✅ Instituciones cargadas:", visitorInstitutions.value);
  } catch (error) {
    console.error("❌ Error al cargar instituciones:", error);
    throw error;
  }
};

const refreshCompanies = async () => {
  try {
    // console.log("🔄 Cargando empresas...");
    // console.log("👤 Usuario actual:", user.value);
    // console.log("🆔 ID del usuario:", user.value?.userId);

    await getVisitorCompanies({ visitorId: user.value?.userId });

    // console.log("✅ Empresas cargadas:", visitorCompanies.value);
  } catch (error) {
    console.error("❌ Error al cargar empresas:", error);
    throw error;
  }
};

// Funciones para manejar instituciones
const addInstitution = async (institutions) => {
  try {
    // console.log("🔄 Recargando instituciones después de agregar:", institutions);

    // Recargar el listado de instituciones para mostrar las nuevas
    await refreshInstitutions();

    // Cerrar el selector de instituciones
    showInstitutionSelector.value = false;

    // Mostrar mensaje de éxito
    const count = Array.isArray(institutions) ? institutions.length : 1;
    showSuccess(
      "Éxito",
      `Se agregó${count > 1 ? "ron" : ""} ${count} institución${
        count > 1 ? "es" : ""
      } exitosamente`
    );

    // console.log("✅ Listado de instituciones actualizado");
  } catch (error) {
    console.error("❌ Error al recargar instituciones:", error);
    showError("Error", "No se pudo actualizar el listado de instituciones");
  }
};

const removeInstitution = async (institution) => {
  try {
    deletingInstitutionId.value = Number(institution.id);

    // Esperar 1 segundo antes de mostrar el mensaje
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showInfo("Eliminando institución...", {
      description: "Esta acción no se puede deshacer",
      duration: 1000,
    });

    console.log("Eliminando institución:", institution);

    await deleteVisitorInstitution({ id: institution.id });
    await refreshInstitutions();

    showSuccess("Éxito", "Institución eliminada");
  } catch (error) {
    console.error("Error al eliminar institución:", error);
    showError("Error", "No se pudo eliminar la institución");
  } finally {
    deletingInstitutionId.value = null;
  }
};

// Funciones para manejar empresas
const addCompany = async (company) => {
  try {
    //console.log("Agregando empresa:", company);

    // Aquí puedes implementar la lógica para agregar una empresa
    // Por ahora, solo actualizamos el estado local
    // visitorCompanies.value.push(company)

    showCompanySelector.value = false;
    showSuccess("Éxito", "Empresa agregada");
  } catch (error) {
    console.error("Error al agregar empresa:", error);
    showError("Error", "No se pudo agregar la empresa");
  }
};

const onCompanyCreatedSuccess = async (payload) => {
  try {
    // Actualizar la selección de la empresa
    selectedCompany.value = payload?.name || "";

    // Asegurar que la lista esté abierta para mostrar la nueva empresa
    showCompanySelector.value = true;

    // Refrescar las empresas
    await getVisitorCompanies({ visitorId: user.value?.userId });

    showSuccess(
      "Empresa agregada",
      `La empresa "${payload.name}" ha sido agregada a tu lista`
    );
  } catch (error) {
    console.error("Error al procesar empresa creada:", error);
    showError("Error", "No se pudo actualizar la lista de empresas");
  }
};

const removeCompany = async (company) => {
  if (!company) return;
  try {
    deletingCompanyId.value = Number(company.id);

    // Esperar 1 segundo antes de mostrar el mensaje
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showInfo("Eliminando empresa...", {
      description: "Esta acción no se puede deshacer",
      duration: 1000,
    });

    await deleteVisitorCompany({ id: company.id });
    await refreshCompanies();

    showSuccess("Éxito", "Empresa eliminada");
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    showError("Error", "No se pudo eliminar la empresa");
  } finally {
    deletingCompanyId.value = null;
  }
};

// Cargar datos cuando se monta el componente
onMounted(async () => {
  //  console.log("🚀 Componente montado");
  //  console.log("👤 Usuario en onMounted:", user.value);
  // console.log("🔐 Auth store:", authStore.user);

  // Verificar si el usuario está autenticado antes de cargar datos
  if (!user.value) {
    console.warn("⚠️ Usuario no autenticado, no se pueden cargar datos");
    return;
  }

  // Cargar datos iniciales
  try {
    await Promise.all([refreshInstitutions(), refreshCompanies()]);
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
  }
});

// Configuración de la página
// Nota: La autenticación se maneja mediante el middleware global auth.global.ts
// No es necesario especificar el middleware aquí
definePageMeta({});
</script>
