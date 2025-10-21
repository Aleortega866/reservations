<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Header -->
      <AdminHeader
        title="Catálogo Usuarios"
        showBackButton
        showMoreButton
        @goBack="goBack"
      />

      <!-- Contenido -->
      <div class="w-full mx-0 lg:max-w-full lg:mx-auto p-4 pt-12 mb-16 space-y-4 flex-1">
      <!-- Vista de usuarios con diseño similar a OptionListField -->
      <Card class="hidden md:flex">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                {{ filteredUsers.length }} usuario{{
                  filteredUsers.length !== 1 ? "s" : ""
                }}
                encontrado{{ filteredUsers.length !== 1 ? "s" : "" }}
              </CardDescription>
              <!-- Vista automática: Tabla en desktop, Lista en móvil -->
              <div
                class="hidden md:flex items-center space-x-2 text-sm text-muted-foreground mt-2"
              >
                <Icon icon="lucide:table" width="16" height="16" class="mr-1" />
                <span>Vista de tabla (desktop)</span>
              </div>
              <div
                class="md:hidden flex items-center space-x-2 text-sm text-muted-foreground mt-2"
              >
                <Icon icon="lucide:list" width="16" height="16" class="mr-1" />
                <span>Vista de lista (móvil)</span>
              </div>
            </div>
            <!-- Botón de crear usuario para desktop -->
            <div class="hidden md:block">
              <Button @click="openCreateDialog" class="flex items-center gap-2">
                <Icon icon="lucide:plus" width="16" height="16" />
                Crear Usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="isLoading" class="flex justify-center items-center py-8">
            <Icon
              icon="lucide:loader-circle"
              width="32"
              height="32"
              class="animate-spin"
            />
            <span class="ml-2">Cargando usuarios...</span>
          </div>

          <div v-else-if="filteredUsers.length === 0" class="text-center py-8">
            <Icon
              icon="lucide:users"
              width="48"
              height="48"
              class="text-muted-foreground mx-auto mb-4"
            />
            <h3 class="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
            <p class="text-muted-foreground mb-4">
              {{
                searchQuery
                  ? "No hay usuarios que coincidan con tu búsqueda."
                  : "Aún no hay usuarios registrados."
              }}
            </p>
            <Button v-if="!searchQuery" @click="openCreateDialog">
              <Icon icon="lucide:plus" width="16" height="16" class="mr-2" />
              Crear Primer Usuario
            </Button>
          </div>

          <!-- Vista de tabla tradicional (solo en desktop) -->
          <div class="w-full hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead>Tipo de Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Modificación</TableHead>
                  <TableHead class="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="employee in filteredUsers" :key="employee.id">
                  <TableCell>
                    <div class="font-medium">{{ getFullName(employee) }}</div>
                  </TableCell>
                  <TableCell>
                    <div class="text-sm">
                      {{ employee.userName || "Sin username" }}
                    </div>
                  </TableCell>
                  <TableCell>{{ employee.email }}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {{ employee.userType || "Sin tipo" }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        employee.enable && employee.status === 'Activo'
                          ? 'default'
                          : 'secondary'
                      "
                    >
                      {{
                        employee.enable && employee.status === "Activo"
                          ? "Activo"
                          : "Inactivo"
                      }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {{ formatDate(employee.dateModified || "") }}
                  </TableCell>
                  <TableCell class="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icon icon="lucide:more-horizontal" width="16" height="16" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="openEditDialog(employee)">
                          <Icon icon="lucide:edit" width="16" height="16" class="mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          @click="openDeleteDialog(employee)"
                          class="text-destructive"
                        >
                          <Icon
                            icon="lucide:trash-2"
                            width="16"
                            height="16"
                            class="mr-2"
                          />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <!-- Vista de lista con diseño similar a OptionListField (solo en móvil) -->
      <div class="md:hidden space-y-2">
        <UserListField
          label="Gestiona de usuarios"
          :users="[...filteredUsers] as any"
          :noUsersMessage="
            searchQuery
              ? 'No hay usuarios que coincidan con tu búsqueda.'
              : 'Aún no hay usuarios registrados.'
          "
          @createUser="openCreateDialog"
          @editUser="openEditDialog"
          @deleteUser="openDeleteDialog"
        />
      </div>
    </div>

    <!-- Diálogo de creación/edición de usuario -->
    <UserFormDialog
      ref="userFormDialogRef"
      v-model:open="showUserDialog"
      :is-editing="isEditing"
      :user-data="selectedUserData || {}"
      @submit="handleUserSubmit"
    />

    <!-- Diálogo de confirmación de eliminación -->
    <DeleteUserDialog
      ref="deleteUserDialogRef"
      v-model:open="showDeleteDialog"
      :user-name="selectedUser ? getFullName(selectedUser) : ''"
      :user-id="selectedUser?.id?.toString() || ''"
      @confirm="handleDeleteUser"
    />
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/vue";
import AdminHeader from "@/components/admin/AdminHeader.vue";
import UserFormDialog from "@/components/admin/usuarios/UserFormDialog.vue";
import DeleteUserDialog from "@/components/admin/usuarios/DeleteUserDialog.vue";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import type { EmployeeFormData } from "@/lib/validations/users";
import { useEmployees } from "@/composables/business/useEmployees";
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/lib/api/types/employee";
import UserListField from "@/components/admin/usuarios/UserListField.vue";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

const {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
  employees,
  loading: isLoading,
} = useEmployees();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

const router = useRouter();

// Referencias a componentes
const userFormDialogRef = ref();
const deleteUserDialogRef = ref();

// Estados de los diálogos
const showUserDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const selectedUser = ref<any>(null);
const searchQuery = ref("");

// Computed para filtrar y ordenar empleados
const filteredUsers = computed(() => {
  let filtered = [...employees.value];

  // Aplicar filtro de búsqueda si existe
  if (searchQuery.value) {
    filtered = employees.value.filter(
      (employee) =>
        employee.email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        employee.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        employee.userName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        employee.paternalLastName
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        employee.maternalLastName?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Ordenar por fecha de modificación (más recientes primero)
  return filtered.sort((a, b) => {
    const dateA = new Date(a.dateModified || "");
    const dateB = new Date(b.dateModified || "");
    return dateB.getTime() - dateA.getTime();
  });
});

// Función para obtener el nombre completo
const getFullName = (employee: any) => {
  const parts = [
    employee.name,
    employee.paternalLastName,
    employee.maternalLastName,
  ].filter(Boolean);
  return parts.join(" ") || "Sin nombre";
};

// Computed para transformar selectedUser al formato correcto
const selectedUserData = computed((): Partial<EmployeeFormData> | null => {
  if (!selectedUser.value) return null;

  return {
    userName: selectedUser.value.userName || "",
    name: selectedUser.value.name || "",
    paternalLastName: selectedUser.value.paternalLastName || "",
    maternalLastName: selectedUser.value.maternalLastName || "",
    email: selectedUser.value.email || "",
    password: "",
  };
});

// Funciones de navegación
const goBack = () => {
  router.back();
};

// Funciones de manejo de diálogos
const openCreateDialog = () => {
  isEditing.value = false;
  selectedUser.value = null;
  showUserDialog.value = true;
};

const openEditDialog = (employee: any) => {
  isEditing.value = true;
  selectedUser.value = employee;
  showUserDialog.value = true;
};

const openDeleteDialog = (employee: any) => {
  console.log("🔍 [openDeleteDialog] Empleado seleccionado:", employee);
  console.log(
    "🔍 [openDeleteDialog] ID del empleado:",
    employee.id,
    "tipo:",
    typeof employee.id
  );
  selectedUser.value = employee;
  showDeleteDialog.value = true;
};

// Funciones de manejo de formularios
const handleUserSubmit = async (data: EmployeeFormData) => {
  try {
    if (isEditing.value && selectedUser.value) {
      const updateData: UpdateEmployeeRequest = {
        id: selectedUser.value.id,
        userName: data.userName,
        email: selectedUser.value.email, // Mantener el email original
        phoneNumber: selectedUser.value.phoneNumber || null,
        name: data.name,
        paternalLastName: data.paternalLastName,
        maternalLastName: data.maternalLastName,
        enableMarketing: selectedUser.value.enableMarketing || false,
        enableUsePersonalData: selectedUser.value.enableUsePersonalData || true,
        userModifiedId: 1, // TODO: Obtener el ID del usuario actual
        dateModified: new Date().toISOString(),
      };
      await updateEmployee(updateData);
      // Si llegamos aquí, la actualización fue exitosa
      showUserDialog.value = false;
      // Recargar la lista de usuarios
      getAllEmployees();
    } else {
      const employeeData: CreateEmployeeRequest = {
        userName: data.userName,
        email: data.email,
        password: data.password,
        name: data.name,
        paternalLastName: data.paternalLastName,
        maternalLastName: data.maternalLastName,
        userModifiedId: 1, // TODO: Obtener el ID del usuario actual
      };
      await createEmployee(employeeData);
      // Si llegamos aquí, la creación fue exitosa
      showUserDialog.value = false;
      // Recargar la lista de usuarios
      getAllEmployees();
    }
  } catch (error) {
    // El error ya se maneja en el composable con toast
    console.error("Error al procesar empleado:", error);
  } finally {
    // Resetear el estado de submitting del diálogo
    if (userFormDialogRef.value) {
      userFormDialogRef.value.isSubmitting = false;
    }
  }
};

const handleDeleteUser = async (userId: string | number) => {
  console.log("🔄 Iniciando eliminación de usuario con ID:", userId);
  console.log("🔄 Tipo de userId:", typeof userId);
  console.log("🔄 Lista de empleados:", employees.value);
  console.log(
    "🔄 IDs de empleados:",
    employees.value.map((emp) => ({
      id: emp.id,
      type: typeof emp.id,
      toString: emp.id.toString(),
    }))
  );

  try {
    // Buscar el usuario por ID para obtener su email
    const userToDelete = employees.value.find(
      (emp) => emp.id === userId || emp.id.toString() === userId.toString()
    );

    if (!userToDelete) {
      console.error("❌ Usuario no encontrado para eliminar");
      console.error("❌ userId recibido:", userId);
      console.error(
        "❌ IDs disponibles:",
        employees.value.map((emp) => emp.id)
      );
      return;
    }

    console.log("📧 Usuario encontrado:", userToDelete);
    console.log("📧 Email del usuario a eliminar:", userToDelete.email);

    // Eliminar el empleado usando su email
    console.log("🚀 Llamando a deleteEmployee...");
    const result = await deleteEmployee(userToDelete.email || "", 1); // TODO: Obtener el ID del usuario actual
    console.log("✅ Resultado de deleteEmployee:", result);

    // Si llegamos aquí, la eliminación fue exitosa
    showDeleteDialog.value = false;
    selectedUser.value = null;

    // Recargar la lista de usuarios
    console.log("🔄 Recargando lista de usuarios...");
    await getAllEmployees();
    console.log("✅ Lista de usuarios recargada");
  } catch (error) {
    // El error ya se maneja en el composable con toast
    console.error("❌ Error al eliminar empleado:", error);
  } finally {
    // Resetear el estado de deleting del diálogo
    if (deleteUserDialogRef.value) {
      deleteUserDialogRef.value.isDeleting = false;
    }
  }
};

// Función para formatear fechas
const formatDate = (dateString: string) => {
  if (!dateString) return "Sin fecha";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Manejar apertura del chat
const handleOpenChat = () => {
  console.log("Abriendo chat...");
  // Aquí puedes implementar la lógica para abrir el chat
};
// Cargar empleados al montar el componente
onMounted(() => {
  getAllEmployees();
});
</script>
