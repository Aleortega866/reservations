<template>
  <Dialog :open="isOpen" @update:open="updateOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Crear nuevo rol</DialogTitle>
        <DialogDescription>
          Completa la información para crear un nuevo rol en el sistema.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="displayName">Nombre del rol</Label>
          <Input
            id="displayName"
            v-model="formData.displayName"
            placeholder="Ej: Administrador, Usuario, Moderador"
            :class="{ 'border-destructive': errors.displayName }"
          />
          <p v-if="errors.displayName" class="text-sm text-destructive">
            {{ errors.displayName }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="roleType">Tipo de rol</Label>
          <Select
            v-model="formData.roleTypeId"
            :class="{ 'border-destructive': errors.roleTypeId }"
          >
            <SelectTrigger class="w-full">
              <SelectValue
                :placeholder="
                  catalogsLoading ? 'Cargando tipos...' : 'Seleccionar tipo de rol'
                "
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipos de rol</SelectLabel>
                <SelectItem
                  v-for="option in roleTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p v-if="errors.roleTypeId" class="text-sm text-destructive">
            {{ errors.roleTypeId }}
          </p>
          <div v-if="catalogsError" class="text-sm text-destructive">
            Error al cargar tipos de rol: {{ catalogsError }}
          </div>
        </div>

        <div class="space-y-2">
          <Label for="description">Descripción</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Describe las funciones y permisos de este rol"
            :class="{ 'border-destructive': errors.description }"
            rows="3"
          />
          <p v-if="errors.description" class="text-sm text-destructive">
            {{ errors.description }}
          </p>
        </div>

        <!-- <div class="flex items-center space-x-2">
          <Switch
            id="enable"
            v-model="formData.enable"
          />
          <Label for="enable">Rol habilitado</Label>
        </div> -->

        <div
          v-if="error"
          class="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p class="text-destructive text-sm">{{ error }}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)">
            Cancelar
          </Button>
          <Button type="submit" :disabled="loading">
            <span v-if="loading">Creando...</span>
            <span v-else>Crear rol</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useToast } from "@/composables/ui/useToast";
import { useRoles } from "@/composables/auth/useRoles";
import { useCatalog } from "@/composables/catalog/useCatalog";
import type { CreateRoleRequest } from "~/lib/api/services/role";

// Componentes UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emit = defineEmits(["save", "update:open", "success"]);

const isOpen = defineModel("open", { type: Boolean, default: false });

// Estados
const loading = ref(false);
const error = ref<string | null>(null);
const errors = reactive({
  displayName: "",
  description: "",
  roleTypeId: "",
});

// Datos del formulario
const formData = reactive({
  displayName: "",
  description: "",
  enable: true,
  roleTypeId: "",
});

// Composable para roles
const { createRole } = useRoles();

// Composable para catálogos
const {
  catalogs,
  loading: catalogsLoading,
  error: catalogsError,
  fetchCatalogs,
} = useCatalog();

// Opciones para tipos de rol (se cargarán desde el catálogo)
const roleTypeOptions = ref<Array<{ value: string; label: string }>>([]);

// Toast para notificaciones
const { showSuccess, showError } = useToast();

// Función para cargar los tipos de rol desde el catálogo
const loadRoleTypes = async () => {
  try {
    console.log("🔄 Cargando tipos de rol desde el catálogo...");
    await fetchCatalogs({ tableName: "RoleType" });

    const roleTypeCatalogs = catalogs.value.filter(
      (catalog) => catalog.tableName === "RoleType" && catalog.enable
    );

    roleTypeOptions.value = roleTypeCatalogs.map((catalog) => ({
      value: catalog.id.toString(), // Usar el ID como valor
      label: catalog.value,
    }));

    console.log("✅ Tipos de rol cargados:", roleTypeOptions.value);
  } catch (error) {
    console.error("❌ Error cargando tipos de rol:", error);
    // Fallback a opciones por defecto en caso de error
    roleTypeOptions.value = [
      { value: "1", label: "Administrador" },
      { value: "2", label: "Usuario" },
      { value: "3", label: "Moderador" },
      { value: "4", label: "Editor" },
      { value: "5", label: "Visitante" },
    ];
  }
};

const updateOpen = (value: boolean) => {
  isOpen.value = value;
  if (!value) {
    // Resetear el formulario cuando se cierre
    resetForm();
    error.value = null;
  }
};

const resetForm = () => {
  formData.displayName = "";
  formData.description = "";
  formData.enable = true;
  formData.roleTypeId = "";
  errors.displayName = "";
  errors.description = "";
  errors.roleTypeId = "";
};

const validateForm = () => {
  let isValid = true;

  // Validar nombre del rol
  if (!formData.displayName.trim()) {
    errors.displayName = "El nombre del rol es requerido";
    isValid = false;
  } else if (formData.displayName.length > 100) {
    errors.displayName = "El nombre no puede exceder 100 caracteres";
    isValid = false;
  } else {
    errors.displayName = "";
  }

  // Validar tipo de rol
  if (!formData.roleTypeId) {
    errors.roleTypeId = "El tipo de rol es requerido";
    isValid = false;
  } else {
    errors.roleTypeId = "";
  }

  // Validar descripción
  if (!formData.description.trim()) {
    errors.description = "La descripción es requerida";
    isValid = false;
  } else if (formData.description.length > 500) {
    errors.description = "La descripción no puede exceder 500 caracteres";
    isValid = false;
  } else {
    errors.description = "";
  }

  return isValid;
};

const onSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const request: CreateRoleRequest = {
      name: formData.displayName,
      description: formData.description,
      userModifiedId: 1, // TODO: Cambiar por el id del usuario logueado
      enable: formData.enable,
      roleTypeId: parseInt(formData.roleTypeId), // Agregar el ID del tipo de rol
    };

    const newRole = await createRole(request);

    showSuccess(
      "Rol creado",
      `El rol "${formData.displayName}" se ha creado exitosamente`
    );

    // Emitir eventos
    emit("save", newRole);
    emit("success", newRole);
    updateOpen(false);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error al crear el rol";
    error.value = errorMessage;
    showError("Error al crear", errorMessage);
  } finally {
    loading.value = false;
  }
};

// Cargar tipos de rol al montar el componente
onMounted(() => {
  loadRoleTypes();
});
</script>
