<template>
  <div class="p-4 space-y-4">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <img src="/assets/mide-logo.svg" alt="Cargando" class="w-16 h-16 animate-pulse" />
      <span class="ml-2 text-sm text-muted-foreground">Cargando datos personales...</span>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
    >
      <p class="text-sm text-destructive">
        Error al cargar los datos:
        {{
          typeof error === "object" && error.message ? error.message : "Error desconocido"
        }}
      </p>
      <Button @click="loadUserData" variant="outline" size="sm" class="mt-2">
        Reintentar
      </Button>
    </div>

    <!-- Content -->
    <div v-else-if="personalData" class="space-y-4">
      <!-- Indicador de recarga -->
      <div v-if="isRefreshing" class="flex items-center justify-center py-4">
        <img
          src="/assets/mide-logo.svg"
          alt="Actualizando"
          class="w-12 h-12 animate-pulse"
        />
        <span class="ml-2 text-sm text-muted-foreground">Actualizando datos...</span>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label class="text-sm font-medium">Nombre de Usuario</Label>
          <div
            class="bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full cursor-pointer transition-colors"
            @click="openEditDialog"
          >
            <span class="text-sm font-semibold">{{ personalData.username }}</span>
            <Button variant="ghost" size="icon">
              <Icon icon="ri:edit-line" class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Apellido(s)</Label>
          <div
            class="bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full"
          >
            <span class="text-sm font-semibold"
              >{{ personalData.lastName }} {{ personalData.maternalLastName }}</span
            >
            <Button variant="ghost" size="icon">
              <Icon icon="uis:lock" class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Fecha de nacimiento</Label>
          <div
            class="bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full"
          >
            <span class="text-sm font-semibold">{{
              formatDate(personalData.dateBirth ?? "")
            }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Nombres</Label>
          <div
            class="bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full"
          >
            <span class="text-sm font-semibold">{{ personalData.firstName }}</span>
            <Button variant="ghost" size="icon">
              <Icon icon="uis:lock" class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Género</Label>
          <div
            class="bg-secondary/40 flex items-center justify-between px-3 py-1 rounded-full"
          >
            <span class="text-sm font-semibold">{{ personalData.gender }}</span>
            <Button variant="ghost" size="icon">
              <Icon icon="uis:lock" class="w-4 h-4d" />
            </Button>
          </div>
        </div>
      </div>

      <div class="space-y-2 mt-6">
        <Label class="text-lg italic font-semibold">Observaciones essxtras</Label>
        <div class="flex items-start space-x-2 p-2 rounded-md">
          <Checkbox
            variant="secondary"
            class="mt-1"
            :model-value="personalData.receiveNewsletters ?? false"
            @update:model-value="handleNewsletterChange"
          />
          <span class="text-sm">
            Me gustaría recibir únicamente información sobre actividades educativas,
            talleres, charlas, sesiones digitales y otros eventos relacionados.
          </span>
        </div>
        <div class="flex items-start space-x-2 p-2 rounded-md">
          <Checkbox
            variant="secondary"
            class="mt-1"
            :model-value="personalData.acceptDataUsage ?? false"
            @update:model-value="handleDataUsageChange"
            :disabled="true"
          />
          <span class="text-sm">
            Autorizo el uso de mis datos personales con fines comerciales.
          </span>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <EditPersonalDataDialog
      ref="editDialogRef"
      @update-personal-data="
        (data) => {
          try {
            handleUpdatePersonalData(data);
          } catch (error) {
            console.error('Error en event handler update-personal-data:', error);
            showError('Error', 'Error al procesar la actualización de datos');
          }
        }
      "
      @update-completed="
        () => {
          try {
            console.log('Actualización completada, recargando datos...');
            // Usar nextTick para asegurar que la actualización se haya completado
            nextTick(() => {
              //loadUserData()
            });
          } catch (error) {
            console.error('Error al recargar datos después de actualización:', error);
            showError('Error', 'Error al recargar los datos actualizados');
          }
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/vue";
import EditPersonalDataDialog from "./EditPersonalDataDialog.vue";
import { useUsers } from "@/composables/auth/useUsers";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/ui/useToast";

import type { PersonalData, GetUserApiResponse } from "@/types/user";

const props = defineProps<{
  personalData?: PersonalData;
}>();

const emit = defineEmits<{
  "update-personal-data": [data: any];
}>();

// Composables
const { searchUserByEmail, isLoading: loading, error } = useUsers();
const authStore = useAuthStore();
const { showError } = useToast();

// Estado local
const editDialogRef = ref();
const localPersonalData = ref<PersonalData | null>(null);
const isRefreshing = ref(false);

// Computed que combina el prop con los datos locales
const personalData = computed(() => {
  try {
    const data = localPersonalData.value || props.personalData || null;
    if (!data) {
      console.warn("personalData computed: No hay datos disponibles");
    }
    return data;
  } catch (error) {
    console.error("Error en personalData computed:", error);
    return null;
  }
});

const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Función para cargar datos del usuario
const loadUserData = async () => {
  try {
    isRefreshing.value = true;
    console.log("Iniciando carga de datos del usuario...");

    // Agregar delay mínimo para mostrar el loading
    const [_, apiResponse] = await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 1500)), // Delay de 1.5 segundos
      (async () => {
        // Obtener el email del usuario autenticado
        const userEmail = authStore.user?.email;

        if (!userEmail) {
          console.error("Error: No se encontró el email del usuario autenticado");
          showError("Error", "No se encontró el email del usuario autenticado");
          return;
        }

        console.log("Cargando datos del usuario con email:", userEmail);

        // Llamar al endpoint GetUserAsync con el email
        return await searchUserByEmail(userEmail);
      })(),
    ]);

    // Validar que la respuesta existe
    if (!apiResponse) {
      console.error("Error: La API no devolvió respuesta");
      showError("Error", "No se recibió respuesta del servidor");
      return;
    }

    // La API devuelve una estructura con code, isValid, comments, response
    if (apiResponse && typeof apiResponse === "object" && "isValid" in apiResponse) {
      const response = (apiResponse as unknown) as GetUserApiResponse;

      if (response.isValid && response.response) {
        const userData = response.response;

        // Validar que userData existe
        if (!userData) {
          console.error("Error: userData es null o undefined");
          showError("Error", "Los datos del usuario están incompletos");
          return;
        }

        // Mapear los datos de la API a la estructura PersonalData
        localPersonalData.value = {
          username: userData.userName || "",
          firstName: userData.name || "",
          lastName: userData.paternalLastName || "",
          maternalLastName: userData.maternalLastName || "",
          dateBirth: userData.dateBirth || "",
          gender: userData.gender || "No especificado",
          receiveNewsletters: userData.enableMarketing || false,
          acceptDataUsage: userData.enableUsePersonalData || false,
          NewEmail: userData.email || "",
        };

        console.log("Datos del usuario cargados:", localPersonalData.value);
        console.log("Respuesta completa de la API:", response);
      } else {
        console.error("Respuesta inválida de la API:", response);
        showError(
          "Error",
          response.comments || "No se pudieron cargar los datos del usuario"
        );
      }
    } else {
      // Fallback para estructura directa (por si acaso)
      const userData = apiResponse as any;
      if (userData && userData.userName) {
        localPersonalData.value = {
          username: userData.userName || "",
          firstName: userData.name || "",
          lastName: userData.paternalLastName || "",
          maternalLastName: userData.maternalLastName || "",
          dateBirth: userData.dateBirth || "",
          gender: userData.gender || "No especificado",
          receiveNewsletters: userData.enableMarketing || false,
          acceptDataUsage: userData.enableUsePersonalData || false,
        };
        console.log("Datos del usuario cargados (fallback):", localPersonalData.value);
      } else {
        console.error("Estructura de respuesta inesperada:", apiResponse);
        showError("Error", "No se pudieron cargar los datos del usuario");
      }
    }
  } catch (err) {
    console.error("Error al cargar datos del usuario:", err);
    showError("Error", "No se pudieron cargar los datos del usuario");
  } finally {
    isRefreshing.value = false;
    console.log("Carga de datos del usuario completada");
  }
};

const openEditDialog = () => {
  try {
    if (!localPersonalData.value) {
      console.error("Error: localPersonalData.value es null o undefined");
      showError("Error", "No se pudieron cargar los datos del usuario");
      return;
    }

    // Obtener los datos completos del usuario desde la API
    const userEmail = authStore.user?.email;
    if (userEmail) {
      searchUserByEmail(userEmail)
        .then((apiResponse: any) => {
          try {
            if (
              apiResponse &&
              typeof apiResponse === "object" &&
              "isValid" in apiResponse
            ) {
              const response = (apiResponse as unknown) as GetUserApiResponse;
              if (response.isValid && response.response) {
                response.response.NewEmail = response.response.email;
                if (
                  editDialogRef.value &&
                  typeof editDialogRef.value.openWithData === "function"
                ) {
                  editDialogRef.value.openWithData(
                    localPersonalData.value,
                    response.response
                  );
                } else {
                  console.error("El modal de edición no está disponible en este momento");
                  showError("Error", "El modal de edición no está disponible");
                }
              } else {
                if (
                  editDialogRef.value &&
                  typeof editDialogRef.value.openWithData === "function"
                ) {
                  editDialogRef.value.openWithData(localPersonalData.value);
                } else {
                  console.error("El modal de edición no está disponible en este momento");
                  showError("Error", "El modal de edición no está disponible");
                }
              }
            } else {
              if (
                editDialogRef.value &&
                typeof editDialogRef.value.openWithData === "function"
              ) {
                editDialogRef.value.openWithData(localPersonalData.value);
              } else {
                console.error("El modal de edición no está disponible en este momento");
                showError("Error", "El modal de edición no está disponible");
              }
            }
          } catch (error) {
            console.error("Error al procesar respuesta de la API:", error);
            showError("Error", "Error al procesar los datos del usuario");
          }
        })
        .catch((error) => {
          console.error("Error al obtener datos del usuario:", error);
          if (
            editDialogRef.value &&
            typeof editDialogRef.value.openWithData === "function"
          ) {
            editDialogRef.value.openWithData(localPersonalData.value);
          } else {
            showError("Error", "Error al cargar los datos del usuario");
          }
        });
    } else {
      if (editDialogRef.value && typeof editDialogRef.value.openWithData === "function") {
        editDialogRef.value.openWithData(localPersonalData.value);
      } else {
        console.error("El modal de edición no está disponible en este momento");
        showError("Error", "El modal de edición no está disponible");
      }
    }
  } catch (error) {
    console.error("Error en openEditDialog:", error);
    showError("Error", "Error al abrir el diálogo de edición");
  }
};

const handleUpdatePersonalData = (data: any) => {
  try {
    console.log("handleUpdatePersonalData ejecutado con datos:", data);

    // Validar que data existe
    if (!data) {
      console.error("Error: data es undefined o null en handleUpdatePersonalData");
      return;
    }

    // Emitir evento al componente padre
    emit("update-personal-data", data);
    loadUserData();
    console.log("Evento update-personal-data emitido");
  } catch (error) {
    console.error("Error en handleUpdatePersonalData:", error);
    showError("Error", "Error al actualizar los datos personales");
  }
};

// Función para manejar el cambio del checkbox de newsletters
const handleNewsletterChange = async (value: boolean | string) => {
  try {
    console.log("Cambio de newsletter:", value);

    if (!localPersonalData.value) {
      console.error("Error: No hay datos del usuario disponibles");
      showError("Error", "No se pudieron cargar los datos del usuario");
      return;
    }

    // Obtener el email del usuario
    const userEmail = authStore.user?.email;
    if (!userEmail) {
      console.error("Error: No se encontró el email del usuario");
      showError("Error", "No se encontró el email del usuario");
      return;
    }

    // Usar la función del composable
    const { updateUserNewsletterPreference } = useUsers();
    const result = await updateUserNewsletterPreference(userEmail, Boolean(value));

    if (result) {
      // Actualizar el estado local
      if (localPersonalData.value) {
        localPersonalData.value.receiveNewsletters = Boolean(value);
      }
      console.log("Newsletter actualizado exitosamente");
    }
  } catch (error) {
    console.error("Error al actualizar newsletter:", error);
    showError("Error", "No se pudo actualizar la preferencia de newsletter");
  }
};

// Función para manejar el cambio del checkbox de uso de datos
const handleDataUsageChange = async (value: boolean | string) => {
  try {
    console.log("Cambio de uso de datos:", value);

    if (!localPersonalData.value) {
      console.error("Error: No hay datos del usuario disponibles");
      showError("Error", "No se pudieron cargar los datos del usuario");
      return;
    }

    // Obtener el email del usuario
    const userEmail = authStore.user?.email;
    if (!userEmail) {
      console.error("Error: No se encontró el email del usuario");
      showError("Error", "No se encontró el email del usuario");
      return;
    }

    // Usar la función del composable
    const { updateUserDataUsagePreference } = useUsers();
    const result = await updateUserDataUsagePreference(userEmail, Boolean(value));

    if (result) {
      // Actualizar el estado local
      if (localPersonalData.value) {
        localPersonalData.value.acceptDataUsage = Boolean(value);
      }
      console.log("Uso de datos actualizado exitosamente");
    }
  } catch (error) {
    console.error("Error al actualizar uso de datos:", error);
    showError("Error", "No se pudo actualizar la preferencia de uso de datos");
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  console.log("🔄 PersonalDataScreen montado - iniciando carga de datos...");
  loadUserData();
});
</script>
