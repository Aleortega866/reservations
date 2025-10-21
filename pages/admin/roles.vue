<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Header -->
      <AdminHeader
        title="Gestión de roles y permisos"
        showBackButton
        showMoreButton
        @goBack="goBack"
      />
      <!-- Contenido -->
      <div class="w-full mx-0 lg:max-w-2xl lg:mx-auto p-4 pt-12 mb-16 space-y-4 flex-1">
        <section>
          <RolesList
            label="Gestión de roles"
            v-auto-animate="{ duration: 100, easing: 'ease-out' }"
            :modelValue="selectedRoles"
            :roles="roles"
            :onToggleActive="handleToggleActiveRole"
            :onEdit="handleEditRole"
            :onDelete="handleDeleteRole"
            @update:modelValue="updateSelectedRoles"
            @update-role="handleUpdateRole"
            @new-role="handleNewRole"
          />

          <!-- Mostrar estado de carga -->
          <!-- <div v-if="rolesLoading" class="p-4 text-center">
          <p class="text-muted-foreground">Cargando roles...</p>
        </div> -->

          <!-- Mostrar error si existe -->
          <div
            v-if="rolesError"
            class="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
          >
            <p class="text-destructive text-sm">{{ rolesError }}</p>
          </div>
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { Button } from "@/components/ui/button";
import { History } from "lucide-vue-next";
import AdminHeader from "@/components/admin/AdminHeader.vue";
import RolesList from "@/components/admin/roles/RolesList.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import { useRoles } from "@/composables/auth/useRoles";
import { useToast } from "@/composables/ui/useToast";
import { useModules } from "@/composables/business/useModules";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

// Composable para manejar roles
const {
  roles,
  loading: rolesLoading,
  error: rolesError,
  getAllRoles,
  updateRole,
  deleteRole,
} = useRoles();

// Composable para manejar módulos
const {
  modules,
  loading: modulesLoading,
  error: modulesError,
  getAllModules,
  updateModule,
  deleteModule,
  createModule,
} = useModules();

// Composable para toasts
const { showSuccess, showError, showInfo } = useToast();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// Cargar roles al montar el componente
onMounted(() => {
  loadRoles();
  loadModules();
});

// Función para cargar roles
const loadRoles = async () => {
  try {
    await getAllRoles();
  } catch (error) {
    console.error("Error al cargar roles:", error);
  }
};

// Estado para los roles seleccionados
const selectedRoles = ref<number[]>([]);

const router = useRouter();

const goBack = () => {
  router.back();
};

const updateSelectedRoles = (roles: number[] | number) => {
  if (Array.isArray(roles)) {
    selectedRoles.value = roles;
  } else {
    selectedRoles.value = [roles];
  }
};

const handleUpdateRole = async (role: any) => {
  try {
    showInfo("Actualizando rol", "Procesando los cambios...", { duration: 2000 });

    // Aquí se implementaría la lógica para actualizar en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 2000));

    showSuccess(
      "Rol actualizado",
      `El rol "${role.name}" se ha actualizado correctamente`
    );
    loadRoles();
    console.log("Rol actualizado:", role);
  } catch (error) {
    showError("Error al actualizar", "No se pudo actualizar el rol");
    console.error("Error al actualizar rol:", error);
  }
};

const handleNewRole = async (role: any) => {
  try {
    showInfo("Creando rol", "Procesando la creación...");

    // Aquí se implementaría la lógica para crear en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess("Rol creado", `El rol "${role.name}" se ha creado exitosamente`);
    loadRoles();
    console.log("Nuevo rol creado:", role);
  } catch (error) {
    showError("Error al crear", "No se pudo crear el rol");
    console.error("Error al crear rol:", error);
  }
};

const handleDeleteRole = async (role: any) => {
  try {
    showInfo("Eliminando rol", "Procesando la eliminación...", { duration: 2000 });

    // Usar el servicio real del composable para eliminar el rol
    // El composable ya actualiza automáticamente la lista local
    await deleteRole({ id: role.id });

    showSuccess("Rol eliminado", `El rol "${role.name}" se ha eliminado correctamente`);
    // Recargar los roles desde el servidor para asegurar sincronización
    await loadRoles();
    console.log("Rol eliminado:", role);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "No se pudo eliminar el rol";
    console.log("Mensaje final para toast:", errorMessage);

    showError("Error al eliminar", errorMessage);
    console.error("Error al eliminar rol:", error);
  }
};

const handleToggleActiveRole = async (id: string) => {
  try {
    showInfo("Cambiando estado", "Actualizando el estado del rol...", { duration: 2000 });

    // Buscar el rol para obtener su información
    const role = roles.value.find((r: any) => r.id === id);
    if (!role) {
      throw new Error("Rol no encontrado");
    }

    // Actualizar el estado del rol manteniendo todas las propiedades existentes
    const updatedRole = await updateRole({
      id: role.id,
      name: role.name,
      description: role.description,
      roleTypeId: role.roleTypeId,
      enable: !role.enable, // Solo cambia esta propiedad
      userModifiedId: 1, // TODO: Cambiar por el id del usuario logueado
    });

    if (updatedRole) {
      const nombre = role.name;
      const nuevoEstado = !role.enable ? "habilitado" : "deshabilitado";

      // Recargar los roles desde el servidor para asegurar sincronización
      await loadRoles();

      setTimeout(() => {
        showSuccess(
          "Estado actualizado",
          `El rol "${nombre}" ha sido ${nuevoEstado} correctamente`
        );
      }, 2000);
      console.log(`Estado del rol ${id} actualizado exitosamente`);
    } else {
      setTimeout(() => {
        showError("Error al actualizar", "No se pudo cambiar el estado del rol");
      }, 2000);
      console.error(`Error al actualizar el estado del rol ${id}`);
    }
  } catch (error) {
    setTimeout(() => {
      showError("Error al cambiar estado", "Ocurrió un error inesperado");
    }, 2000);
    console.error("Error al cambiar el estado del rol:", error);
  }
};

const handleEditRole = async (role: any) => {
  try {
    showInfo("Editando rol", "Procesando la edición...");

    // Aquí se implementaría la lógica para editar en la API
    // Simular operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showSuccess("Rol editado", `El rol "${role.name}" se ha editado correctamente`);
    loadRoles();
    console.log("Rol editado:", role);
  } catch (error) {
    showError("Error al editar", "No se pudo editar el rol");
    console.error("Error al editar rol:", error);
  }
};

// Función para cargar módulos
const loadModules = async () => {
  try {
    await getAllModules();
  } catch (error) {
    console.error("Error al cargar módulos:", error);
  }
};

// Estado para los módulos seleccionados
const selectedModules = ref<number[]>([]);

// Estado para el historial global
const showGlobalHistory = ref(false);

const updateSelectedModules = (modules: number[] | number) => {
  if (Array.isArray(modules)) {
    selectedModules.value = modules;
  } else {
    selectedModules.value = [modules];
  }
};

const handleUpdateModule = async (module: any) => {
  try {
    showInfo("Actualizando módulo", "Procesando los cambios...", { duration: 2000 });

    // Usar el servicio real del composable para actualizar el módulo
    const updatedModule = await updateModule({
      id: module.id,
      module: module.module,
      description: module.description,
    });

    if (updatedModule) {
      showSuccess(
        "Módulo actualizado",
        `El módulo "${module.module}" se ha actualizado correctamente`
      );
      await loadModules();
      console.log("Módulo actualizado:", updatedModule);
    } else {
      showError("Error al actualizar", "No se pudo actualizar el módulo");
    }
  } catch (error) {
    showError("Error al actualizar", "No se pudo actualizar el módulo");
    console.error("Error al actualizar módulo:", error);
  }
};

const handleNewModule = async (module: any) => {
  try {
    showInfo("Creando módulo", "Procesando la creación...");

    // Usar el servicio real del composable para crear el módulo
    const newModule = await createModule({
      module: module.module,
      description: module.description,
      moduleTypeId: module.moduleTypeId,
    });

    if (newModule) {
      showSuccess(
        "Módulo creado",
        `El módulo "${module.module}" se ha creado exitosamente`
      );
      await loadModules();
      console.log("Nuevo módulo creado:", newModule);
    } else {
      showError("Error al crear", "No se pudo crear el módulo");
    }
  } catch (error) {
    showError("Error al crear", "No se pudo crear el módulo");
    console.error("Error al crear módulo:", error);
  }
};

const handleDeleteModule = async (module: any) => {
  try {
    showInfo("Eliminando módulo", "Procesando la eliminación...", { duration: 2000 });

    // Usar el servicio real del composable para eliminar el módulo
    const result = await deleteModule({ id: module.id });

    if (result) {
      showSuccess(
        "Módulo eliminado",
        `El módulo "${module.module}" se ha eliminado correctamente`
      );
      await loadModules();
      console.log("Módulo eliminado:", module);
    } else {
      showError("Error al eliminar", "No se pudo eliminar el módulo");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "No se pudo eliminar el módulo";
    showError("Error al eliminar", errorMessage);
    console.error("Error al eliminar módulo:", error);
  }
};

const handleToggleActiveModule = async (id: number) => {
  try {
    showInfo("Cambiando estado", "Actualizando el estado del módulo...", {
      duration: 2000,
    });

    // Buscar el módulo para obtener su información
    const module = modules.value.find((m: any) => m.id === id);
    if (!module) {
      throw new Error("Módulo no encontrado");
    }

    // Para módulos, podríamos implementar un campo de estado si existe en la API
    // Por ahora, solo mostramos un mensaje informativo
    showInfo(
      "Estado del módulo",
      "La funcionalidad de cambio de estado no está implementada para módulos"
    );

    console.log(`Estado del módulo ${id} - funcionalidad no implementada`);
  } catch (error) {
    showError("Error al cambiar estado", "Ocurrió un error inesperado");
    console.error("Error al cambiar el estado del módulo:", error);
  }
};

const handleEditModule = async (module: any) => {
  try {
    showInfo("Editando módulo", "Procesando la edición...");

    // La edición se maneja en el modal, aquí solo mostramos el mensaje
    console.log("Editando módulo:", module);
  } catch (error) {
    showError("Error al editar", "No se pudo editar el módulo");
    console.error("Error al editar módulo:", error);
  }
};

const handleOpenChat = () => {
  console.log("Abriendo chat...");
};
</script>
