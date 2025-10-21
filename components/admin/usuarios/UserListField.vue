<template>

    <!-- Contenido principal -->
    <div>

      <div class="space-y-0 mt-1 overflow-hidden" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
        <!-- Input principal que se expande -->
        <div class="relative overflow-hidden mb-0">
          <Card 
          class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2"
            :class="[
              showUserList ? 'rounded-t-lg rounded-b-none border-b-0' : 'rounded-full',
              selectedUser ? 'bg-input-filled' : 'bg-input-empty'
            ]" @click="openUserList($event)" @submit.prevent>
            <CardContent class="flex items-center justify-between py-1 px-1">

           
                <p class="text-sm font-semibold">Gestión de usuarios</p>
     
                <Icon v-if="showUserList" icon="lucide:chevrons-down-up" width="16" height="16" class="text-muted-foreground" />
                <Icon v-else icon="lucide:chevrons-up-down" width="16" height="16" class="text-muted-foreground" />
             
            </CardContent>
          </Card>
        </div>

        <!-- Lista de usuarios que se expande hacia abajo -->
        <div v-if="showUsers" class="space-y-0 overflow-y-hidden bg-input-empty rounded-b-lg rounded-0"
          v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
          <div v-if="showUserList" class="overflow-hidden">
            <!-- Opción para agregar nuevo rol al final de la lista -->
            <div class="p-3 bg-primary/20 hover:bg-primary/30 transition-colors cursor-pointer"
              @click="openCreateUserDialog">
              <div class="flex items-center justify-between space-x-2 px-2">
                <span class="text-sm text-muted-foreground font-medium">Agregar nuevo usuario</span>
                <Icon icon="lucide:plus" width="16" height="16" class="text-primary" />
              </div>
            </div>

            <div class="bg-input-empty border border-t-0 p-3 w-full rounded-b-lg  overflow-y-auto" @click.stop
              @submit.prevent @keydown.stop>
              <!-- Barra de búsqueda -->
              <div class="mb-3">
                <div class="relative">
                  <input v-model="searchTerm" type="text" :placeholder="searchPlaceholder"
                    class="w-full bg-white pl-10 pr-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    @click.stop @keydown.stop />
                  <Icon icon="lucide:search" width="16" height="16" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                </div>
              </div>

              <!-- Estado de carga -->
              <div v-if="loading" class="flex items-center justify-center py-4">
                <Icon icon="lucide:loader-circle" width="16" height="16" class="mr-2 animate-spin" />
                <span class="text-sm text-muted-foreground">Cargando usuarios...</span>
              </div>

              <!-- Lista de usuarios -->
              <div v-else-if="filteredUsers.length > 0" class="space-y-1">
                <div v-for="(user, index) in filteredUsers" :key="getUserKey(user)"
                class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors"
                        :class="[
                            index === filteredUsers.length - 1 ? 'rounded-b-md' : 'rounded-none',
                            index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]'
                        ]">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                         @click="selectUser(user, $event)">
                      <span class="text-xs text-white font-medium">
                        {{ getUserInitials(user) }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0 cursor-pointer" @click="selectUser(user, $event)">
                      <p class="font-medium truncate">{{ getUserDisplayName(user) }}</p>
                      <p class="text-xs text-muted-foreground truncate">{{ user.email }}</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <Icon icon="bx:user" class="text-muted-foreground" style="width: 16px;height: 16px;" />
                        <span class="text-xs text-muted-foreground">
                          {{ user.userType }}
                        </span>
                        <span class="text-xs text-muted-foreground">
                          {{ formatDate(user.dateCreated) }}
                        </span>
                      </div>
                    </div>
                    <!-- Iconos de acción -->
                    <div class="flex items-center space-x-1 ml-2">
                      <button
                        @click="editUser(user, $event)"
                        class="p-1 hover:bg-blue-100 rounded transition-colors"
                        title="Editar usuario">
                        <Icon icon="lucide:edit" width="16" height="16" class="text-primary" />
                      </button>
                      <button
                        @click="deleteUser(user, $event)"
                        class="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Eliminar usuario">
                        <Icon icon="lucide:trash-2" width="16" height="16" class="text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mensaje cuando no hay usuarios -->
              <div v-else class="px-3 py-4 text-sm text-gray-500 text-center">
                <Icon icon="lucide:users" width="32" height="32" class="mx-auto mb-2 text-muted-foreground" />
                <p>{{ noUsersMessage }}</p>
                <p v-if="searchTerm" class="text-xs mt-1">
                  No se encontraron usuarios que coincidan con "{{ searchTerm }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from '@iconify/vue';
import { vAutoAnimate } from "@formkit/auto-animate/vue";

// Tipos para los usuarios
export interface UserItem {
  id: string | number;
  name?: string;
  paternalLastName?: string;
  maternalLastName?: string;
  email: string;
  userName?: string;
  isActive?: boolean;
  dateCreated?: string;
  disabled?: boolean;
  [key: string]: any;
}

export type UserType = UserItem;

interface Props {
  modelValue?: UserType | null;
  label?: string;
  placeholder?: string;
  users?: UserType[];
  loading?: boolean;
  required?: boolean;
  searchPlaceholder?: string;
  noUsersMessage?: string;
  valueKey?: string;
  nameKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecciona un usuario",
  required: false,
  loading: false,
  searchPlaceholder: "Buscar usuarios...",
  noUsersMessage: "No hay usuarios disponibles",
  valueKey: "id",
  nameKey: "name",
  users: () => [],
});

const emit = defineEmits(["update:modelValue", "createUser", "editUser", "deleteUser"]);

const showUserList = ref(false);
const showUsers = ref(false);
const selectedUser = ref<UserType | null>(null);
const searchTerm = ref("");

// Función para obtener el valor de un usuario
const getUserValue = (user: UserType): string | number => {
  return user[props.valueKey] || user.id;
};

// Función para obtener el nombre completo de un usuario
const getUserDisplayName = (user: UserType): string => {
  const parts = [
    user.name,
    user.paternalLastName,
    user.maternalLastName
  ].filter(Boolean);
  return parts.join(' ') || user.userName || user.email || 'Sin nombre';
};

// Función para obtener las iniciales de un usuario
const getUserInitials = (user: UserType): string => {
  const name = getUserDisplayName(user);
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Función para obtener la clave única de un usuario
const getUserKey = (user: UserType): string | number => {
  return getUserValue(user);
};

// Función para verificar si un usuario está seleccionado
const isSelected = (user: UserType): boolean => {
  if (!selectedUser.value) return false;
  return getUserValue(user) === getUserValue(selectedUser.value);
};

// Función para formatear fechas
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Usuarios filtrados por búsqueda
const filteredUsers = computed(() => {
  const users = props.users || [];

  if (!searchTerm.value) {
    return users;
  }

  const searchLower = searchTerm.value.toLowerCase();
  return users.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    const email = user.email.toLowerCase();
    const userName = user.userName?.toLowerCase() || '';

    return displayName.includes(searchLower) ||
      email.includes(searchLower) ||
      userName.includes(searchLower);
  });
});

// Inicializar valor seleccionado
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== undefined && newValue !== null) {
      // Buscar el usuario que coincida con el modelValue
      const users = props.users || [];
      const matchingUser = users.find(user =>
        getUserValue(user) === getUserValue(newValue)
      );

      selectedUser.value = matchingUser || newValue;
    } else {
      selectedUser.value = null;
    }
  },
  { immediate: true }
);

// Observar cambios en los usuarios para mantener la sincronización
watch(
  () => props.users,
  (newUsers) => {
    if (selectedUser.value !== null && newUsers && Array.isArray(newUsers) && newUsers.length > 0) {
      // Verificar si el usuario seleccionado aún existe en los nuevos usuarios
      const stillExists = newUsers.find(user =>
        getUserValue(user) === getUserValue(selectedUser.value!)
      );

      if (!stillExists) {
        // Si el usuario seleccionado ya no existe, limpiar la selección
        selectedUser.value = null;
        emit("update:modelValue", null);
      }
    }
  },
  { immediate: false, deep: false }
);

const toggleUserList = (event?: Event) => {
  // Prevenir que el evento se propague y cause el envío del formulario
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  showUsers.value = !showUsers.value;

  // Si se cierra showUsers, también cerrar la lista
  if (!showUsers.value) {
    showUserList.value = false;
    searchTerm.value = "";
  }
};

const openUserList = (event?: Event) => {
  // Prevenir que el evento se propague y cause el envío del formulario
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  showUserList.value = !showUserList.value;

  // Si la lista se está abriendo, asegurar que showUsers también esté activo
  if (showUserList.value) {
    showUsers.value = true;
  } else {
    searchTerm.value = "";
  }
};

// Función para seleccionar un usuario
const selectUser = (user: UserType, event?: Event) => {
  // Prevenir propagación de eventos
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Verificar si el usuario está deshabilitado
  if (user.disabled) {
    return;
  }

  // Actualizar el usuario seleccionado
  selectedUser.value = user;

  // Emitir el cambio al componente padre
  emit("update:modelValue", user);

  // Cerrar la lista después de la selección
  showUserList.value = false;
  showUsers.value = false;
  searchTerm.value = "";
};

// Función para abrir el diálogo de creación de usuario
const openCreateUserDialog = (event?: Event) => {
  // Prevenir propagación de eventos
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Emitir evento para crear usuario
  emit("createUser");

  // Cerrar la lista
  showUserList.value = false;
  showUsers.value = false;
  searchTerm.value = "";
};

// Función para editar un usuario
const editUser = (user: UserType, event?: Event) => {
  // Prevenir propagación de eventos
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Emitir evento para editar usuario
  emit("editUser", user);

  // Cerrar la lista
  showUserList.value = false;
  showUsers.value = false;
  searchTerm.value = "";
};

// Función para eliminar un usuario
const deleteUser = (user: UserType, event?: Event) => {
  // Prevenir propagación de eventos
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Emitir evento para eliminar usuario
  emit("deleteUser", user);

  // Cerrar la lista
  showUserList.value = false;
  showUsers.value = false;
  searchTerm.value = "";
};
</script>
