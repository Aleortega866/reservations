<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Header -->
      <AdminHeader
        title="Gestión de formularios y disponibilidad"
        showBackButton
        showMoreButton
        @goBack="goBack"
      />
      <!-- Contenido -->
      <div class="w-full mx-0 lg:max-w-2xl lg:mx-auto p-4 pt-12 mb-16 space-y-4 flex-1">
      <section>
        <MainFormulariosList
          v-auto-animate="{ duration: 100, easing: 'ease-out' }"
          :modelValue="selectedFormularios"
          :formularios="formulariosPrincipales"
          :onToggleEnable="handleToggleEnable"
          @update:modelValue="updateSelectedFormularios"
          @update-formulario="handleUpdateFormulario"
          @new-formulario="handleNewFormulario"
          @delete-formulario="handleDeleteFormulario"
        />

        <!-- Mostrar estado de carga -->
        <!-- <div v-if="formTypesLoading" class="p-4 text-center">
          <p class="text-muted-foreground">Cargando formularios...</p>
        </div> -->

        <!-- Mostrar error si existe -->
        <!-- <div v-if="formTypesError" class="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p class="text-destructive text-sm">{{ formTypesError }}</p>
        </div> -->
      </section>

      <section>
        <QuotaList
          v-auto-animate="{ duration: 100, easing: 'ease-out' }"
          :modelValue="selectedCupo"
          :cupoOptions="scheduleOptions"
          :onToggleEnable="handleToggleEnableCupo"
          :overSlot="overSlot"
          :dayId="selectedDayId"
          @update:modelValue="updateSelectedCupo"
          @update-cupo="handleUpdateCupo"
          @new-cupo="handleNewCupo"
          @delete-cupo="handleDeleteCupo"
          @add-quota-rules="handleAddQuotaRules"
          @update-over-slot="handleUpdateOverSlot"
        />

        <!-- Mostrar estado de carga -->
        <!-- <div v-if="schedulesLoading" class="p-4 text-center">
          <p class="text-muted-foreground">Cargando horarios...</p>
        </div> -->

        <!-- Mostrar error si existe -->
        <div
          v-if="schedulesError"
          class="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p class="text-destructive text-sm">{{ schedulesError }}</p>
        </div>
      </section>

      <section>
        <DocumentRequestList
          label="Gestión de solicitudes de documentos"
          v-auto-animate="{ duration: 100, easing: 'ease-out' }"
          :document-requests="documentRequests"
          :auto-open="false"
          @create="openCreateDocumentRequest"
          @edit="openEditDocumentRequest"
          @delete="confirmDeleteDocumentRequest"
          @toggle-enable="toggleEnableDocumentRequest"
        />

        <!-- <div v-if="docReqLoading" class="p-4 text-center">
          <p class="text-muted-foreground">Cargando solicitudes...</p>
        </div> -->
        <div
          v-if="docReqError"
          class="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p class="text-destructive text-sm">{{ docReqError }}</p>
        </div>

        <CreateEditDocumentRequestDialog
          v-model:open="showDocReqDialog"
          :value="editingDocReq"
          @save="handleSaveDocumentRequest"
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
import MainFormulariosList from "@/components/admin/formularios/MainFormsList.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import { useFormTypes } from "@/composables/catalog/useFormTypes";
import { useSchedules } from "@/composables/business/useSchedules";
import { useToast } from "@/composables/ui/useToast";
import QuotaList from "@/components/admin/cupos/Quotalist.vue";
import DocumentRequestList from "@/components/admin/document-request/DocumentRequestList.vue";
import CreateEditDocumentRequestDialog from "@/components/admin/document-request/CreateEditDocumentRequestDialog.vue";
import { useApiDocumentRequest } from "@/lib/api/composables/document-request";
import type {
  DocumentRequestListItem,
  DocumentFormatType,
} from "@/lib/api/types/document-request";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

// Composable para manejar horarios
const {
  scheduleOptions,
  days,
  selectedDayId,
  overSlot,
  disableAllSchedules,
  loading: schedulesLoading,
  error: schedulesError,
  loadDays,
  loadSchedulesByDay,
  toggleScheduleEnableStatus,
  toggleAllSchedulesStatus,
  initialize: initializeSchedules,
  updateOverSlot,
} = useSchedules();

// Composable para manejar tipos de formularios
const {
  formTypes,
  loading: formTypesLoading,
  error: formTypesError,
  loadFormTypes,
  updateFormTypeEnableStatus,
} = useFormTypes();

// Composable para toasts
const { showSuccess, showError, showInfo } = useToast();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// Cargar tipos de formularios y horarios al montar el componente
onMounted(async () => {
  await loadFormTypes();
  await initializeSchedules();

  // Forzar carga de horarios del martes (día 2) para pruebas
  //TODO: Funcionalidad de obtener id de dia
  console.log("Forzando carga de horarios del martes...");
  await loadSchedulesByDay(3);
  await loadDocumentRequests();
});

// Datos de formularios principales - se llenan desde la API
const formulariosPrincipales = computed(() => formTypes.value);

// Estado para los formularios seleccionados
const selectedFormularios = ref<number[]>([]);
const selectedCupo = ref<number[]>([]);
const showDocReqDialog = ref(false);
const editingDocReq = ref<null | {
  id?: number;
  title: string;
  formTypeIds: number[];
  formats: DocumentFormatType[];
}>(null);

const router = useRouter();

const goBack = () => {
  router.back();
};

const updateSelectedFormularios = (formularios: number[] | number) => {
  if (Array.isArray(formularios)) {
    selectedFormularios.value = formularios;
  } else {
    selectedFormularios.value = [formularios];
  }
};

const updateSelectedCupo = (cupo: number[] | number) => {
  if (Array.isArray(cupo)) {
    selectedCupo.value = cupo;
  } else {
    selectedCupo.value = [cupo];
  }
};

const handleUpdateFormulario = async (formulario: any) => {
  try {
    showInfo("Actualizando formulario", "Procesando los cambios...", { duration: 2000 });

    // Aquí se implementaría la lógica para actualizar en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 2000));

    showSuccess(
      "Formulario actualizado",
      `El formulario "${
        formulario.description || formulario.name
      }" se ha actualizado correctamente`
    );
    console.log("Formulario actualizado:", formulario);
  } catch (error) {
    showError("Error al actualizar", "No se pudo actualizar el formulario");
    console.error("Error al actualizar formulario:", error);
  }
};

const handleUpdateCupo = async (cupo: any) => {
  try {
    showInfo("Actualizando cupo", "Procesando los cambios...", { duration: 2000 });

    // Aquí se implementaría la lógica para actualizar en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 2000));

    showSuccess(
      "Cupo actualizado",
      `El cupo "${cupo.description || cupo.name}" se ha actualizado correctamente`
    );
    console.log("Cupo actualizado:", cupo);
  } catch (error) {
    showError("Error al actualizar", "No se pudo actualizar el cupo");
    console.error("Error al actualizar cupo:", error);
  }
};

const handleNewFormulario = async (formulario: any) => {
  try {
    showInfo("Creando formulario", "Procesando la creación...");

    // Aquí se implementaría la lógica para crear en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess(
      "Formulario creado",
      `El formulario "${
        formulario.description || formulario.name
      }" se ha creado exitosamente`
    );
    console.log("Nuevo formulario creado:", formulario);
  } catch (error) {
    showError("Error al crear", "No se pudo crear el formulario");
    console.error("Error al crear formulario:", error);
  }
};

const handleNewCupo = async (cupo: any) => {
  try {
    showInfo("Creando cupo", "Procesando la creación...");

    // Aquí se implementaría la lógica para crear en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess(
      "Cupo creado",
      `El cupo "${cupo.description || cupo.name}" se ha creado exitosamente`
    );
    console.log("Nuevo cupo creado:", cupo);
  } catch (error) {
    showError("Error al crear", "No se pudo crear el cupo");
    console.error("Error al crear cupo:", error);
  }
};

const handleDeleteFormulario = async (formulario: any) => {
  try {
    showInfo("Eliminando formulario", "Procesando la eliminación...");

    // Aquí se implementaría la lógica para eliminar en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess(
      "Formulario eliminado",
      `El formulario "${
        formulario.description || formulario.name
      }" se ha eliminado correctamente`
    );
    console.log("Formulario eliminado:", formulario);
  } catch (error) {
    showError("Error al eliminar", "No se pudo eliminar el formulario");
    console.error("Error al eliminar formulario:", error);
  }
};

const handleDeleteCupo = async (cupo: any) => {
  try {
    showInfo("Eliminando cupo", "Procesando la eliminación...");

    // Aquí se implementaría la lógica para eliminar en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess(
      "Cupo eliminado",
      `El cupo "${cupo.description || cupo.name}" se ha eliminado correctamente`
    );
    console.log("Cupo eliminado:", cupo);
  } catch (error) {
    showError("Error al eliminar", "No se pudo eliminar el cupo");
    console.error("Error al eliminar cupo:", error);
  }
};

const handleToggleEnable = async (id: number) => {
  try {
    showInfo("Cambiando estado", "Actualizando el estado del formulario...", {
      duration: 2000,
    });

    const result = await updateFormTypeEnableStatus(id);

    if (result) {
      // Buscar el formulario para obtener su descripción
      const formulario = formulariosPrincipales.value.find((f: any) => f.id === id);
      const nombre = formulario?.description || `Formulario ${id}`;
      const estado = formulario?.enable ? "habilitado" : "deshabilitado";

      setTimeout(() => {
        showSuccess(
          "Estado actualizado",
          `El formulario "${nombre}" ha sido ${estado} correctamente`
        );
      }, 2000);
      console.log(`Estado del formulario ${id} actualizado exitosamente`);
    } else {
      setTimeout(() => {
        showError("Error al actualizar", "No se pudo cambiar el estado del formulario");
      }, 2000);
      console.error(`Error al actualizar el estado del formulario ${id}`);
    }
  } catch (error) {
    setTimeout(() => {
      showError("Error al cambiar estado", "Ocurrió un error inesperado");
    }, 2000);
    console.error("Error al cambiar el estado del formulario:", error);
  }
};

const handleToggleEnableCupo = async (id: number) => {
  try {
    showInfo("Cambiando estado", "Actualizando el estado del horario...", {
      duration: 2000,
    });

    await toggleScheduleEnableStatus(id);

    // El mensaje de éxito se maneja dentro del composable
    console.log(`Estado del horario ${id} actualizado exitosamente`);
  } catch (error) {
    setTimeout(() => {
      showError("Error al cambiar estado", "Ocurrió un error inesperado");
    }, 2000);
    console.error("Error al cambiar el estado del horario:", error);
  }
};

const handleUpdateOverSlot = async (payload: { dayId: number; overSlot: number }) => {
  try {
    showInfo("Actualizando", "Modificando el sobre cupo permitido...", {
      duration: 2000,
    });

    await updateOverSlot(payload.dayId, payload.overSlot);

    // El mensaje de éxito se maneja dentro del composable
    console.log(`OverSlot del día ${payload.dayId} actualizado a ${payload.overSlot}`);
  } catch (error) {
    setTimeout(() => {
      showError("Error al actualizar", "Ocurrió un error al modificar el sobre cupo");
    }, 2000);
    console.error("Error al actualizar overSlot:", error);
  }
};

const handleAddQuotaRules = () => {
  showInfo("Reglas de cupo", "Abriendo configuración de reglas específicas de cupo...");
  console.log("Abriendo diálogo de reglas de cupo");
  // Aquí se implementaría la lógica para abrir el diálogo de reglas de cupo
};

// Document Requests state y métodos
const {
  items: docReqItems,
  current: docReqCurrent,
  loading: docReqLoading,
  error: docReqErrorObj,
  getAll: getAllDocReq,
  getById: getDocReqById,
  create: createDocReq,
  update: updateDocReq,
  enable: enableDocReq,
  disable: disableDocReq,
  remove: removeDocReq,
} = useApiDocumentRequest();
const documentRequests = computed<ReadonlyArray<DocumentRequestListItem>>(
  () => docReqItems.value
);
const docReqError = computed(() => docReqErrorObj.value?.message || null);

const loadDocumentRequests = async () => {
  try {
    await getAllDocReq();
  } catch {}
};

const openCreateDocumentRequest = () => {
  editingDocReq.value = { title: "", formTypeIds: [], formats: [] };
  showDocReqDialog.value = true;
};

const openEditDocumentRequest = async (item: DocumentRequestListItem) => {
  await getDocReqById(item.id);
  const detail = docReqCurrent.value;
  editingDocReq.value = detail
    ? {
        id: detail.id,
        title: detail.title,
        formTypeIds: [...detail.formTypeIds],
        formats: [...detail.formats],
      }
    : { id: item.id, title: item.title, formTypeIds: [], formats: [] };
  showDocReqDialog.value = true;
};

const handleSaveDocumentRequest = async (payload: {
  title: string;
  formTypeIds: number[];
  formats: DocumentFormatType[];
}) => {
  try {
    if (editingDocReq.value?.id) {
      await updateDocReq({
        id: editingDocReq.value.id,
        title: payload.title,
        formTypeIds: payload.formTypeIds,
        formats: payload.formats,
      });
      showSuccess("Solicitud actualizada", "Los cambios se han guardado correctamente");
    } else {
      await createDocReq({
        title: payload.title,
        formTypeIds: payload.formTypeIds,
        formats: payload.formats,
      });
      showSuccess("Solicitud creada", "La solicitud ha sido creada correctamente");
    }
    await loadDocumentRequests();
  } catch (e) {
    showError("Error", "No se pudo guardar la solicitud");
  }
};

const confirmDeleteDocumentRequest = async (item: DocumentRequestListItem) => {
  try {
    await removeDocReq(item.id);
    showSuccess("Solicitud eliminada", "La solicitud ha sido eliminada");
  } catch {
    showError("Error", "No se pudo eliminar la solicitud");
  }
};

const toggleEnableDocumentRequest = async (item: DocumentRequestListItem) => {
  try {
    const ok = item.enable ? await disableDocReq(item.id) : await enableDocReq(item.id);
    if (ok) {
      await loadDocumentRequests();
      showSuccess(
        "Estado actualizado",
        `La solicitud "${item.title}" ha sido ${
          item.enable ? "deshabilitada" : "habilitada"
        }`
      );
    } else {
      showError("Error", "No se pudo actualizar el estado");
    }
  } catch {
    showError("Error", "No se pudo actualizar el estado");
  }
};

// Manejar apertura del chat
const handleOpenChat = () => {
  console.log("Abriendo chat...");
  // Aquí puedes implementar la lógica para abrir el chat
};
</script>
