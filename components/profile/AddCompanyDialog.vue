<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger">
        <Button variant="outline">Agregar empresa</Button>
      </slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-start text-xl"> Gestionar empresas </DialogTitle>
      </DialogHeader>
      <form @submit.prevent="submitForm" class="space-y-4 py-2">
        <FormField name="name">
          <FormItem>
            <FormLabel>Nombre de la empresa</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Ej: Empresa S.A. de C.V."
                :model-value="values.name || ''"
                @update:model-value="(v) => setFieldValue('name', v)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="sector">
          <FormItem>
            <FormLabel>Sector</FormLabel>
            <FormControl>
              <OptionListField
                :model-value="values.sector || ''"
                @update:model-value="(value) => setFieldValue('sector', value)"
                label=""
                :options="sectorOptions"
                :placeholder="
                  catalogsLoading ? 'Cargando sectores...' : 'Seleccionar sector'
                "
              />
            </FormControl>
            <FormMessage />
            <div v-if="catalogsError" class="text-sm text-destructive">
              Error al cargar sectores: {{ catalogsError }}
            </div>
          </FormItem>
        </FormField>

        <FormField name="postalCode">
          <FormItem>
            <FormLabel>Código Postal</FormLabel>
            <FormControl>
              <OptionListField
                :model-value="values.postalCode || ''"
                @update:model-value="(value) => setFieldValue('postalCode', value)"
                label=""
                :options="postalCodeOptions"
                placeholder="Seleccionar código postal"
                searchable
                search-placeholder="Buscar código postal..."
              />
            </FormControl>
            <FormMessage />
            <div v-if="postalCodesError" class="text-sm text-destructive">
              Error al cargar códigos postales: {{ postalCodesError }}
            </div>
          </FormItem>
        </FormField>

        <!-- Footer con botones mejorados -->
        <DialogFooter class="flex flex-col sm:flex-row gap-3 pt-4">
          <DialogClose as-child class="w-full sm:w-auto">
            <Button variant="outline" class="w-full h-11 text-base"> Cancelar </Button>
          </DialogClose>
          <Button
            type="submit"
            class="w-full sm:w-auto h-11 text-base font-medium"
            :disabled="visitorLoading"
            @click="submitForm"
          >
            {{ visitorLoading ? "Creando empresa..." : "Agregar empresa" }}
          </Button>
        </DialogFooter>
        <div v-if="submitError" class="text-sm text-destructive mt-2">
          {{ submitError }}
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import OptionListField from "@/components/common/OptionListField.vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import { useCatalog } from "@/composables/catalog/useCatalog";
import { usePostalCodes } from "@/composables/catalog/usePostalCodes";
import { useApiVisitor } from "@/lib/api/composables/visitor";
import { useToast } from "@/composables/ui/useToast";
import { useAuth } from "@/lib/api/composables/auth";

const emit = defineEmits<{
  "company-created-success": [data: { name: string; postalCode: string; sector: string }];
}>();

// Exponer función para cerrar el diálogo desde el componente padre
const closeDialog = () => {
  open.value = false;
};

// Exponer la función para que el componente padre pueda cerrar el diálogo
defineExpose({
  closeDialog,
});

const open = ref(false);
const submitError = ref<string | null>(null);

// Composable para catálogos
const {
  catalogs,
  loading: catalogsLoading,
  error: catalogsError,
  fetchCatalogs,
} = useCatalog();

// Composable para códigos postales
const {
  postalCodes,
  loading: postalCodesLoading,
  error: postalCodesError,
  postalCodeOptions,
  fetchPostalCodes,
  searchByPostalCode,
} = usePostalCodes();

// Composable para visitor (incluye contador)
const {
  createVisitorCompany,
  createVisitorCompanyCount,
  loading: visitorLoading,
} = useApiVisitor();

// Composable para toasts
const { showSuccess, showError, showInfo } = useToast();

// Opciones para sector (se cargarán desde el catálogo)
const sectorOptions = ref<Array<{ value: string; label: string }>>([]);

// Función para cargar los tipos de industria desde el catálogo
const loadIndustryTypes = async () => {
  try {
    console.log("🔄 Cargando tipos de industria desde el catálogo...");
    await fetchCatalogs({ tableName: "IndustryType" });

    const industryCatalogs = catalogs.value.filter(
      (catalog) => catalog.tableName === "IndustryType" && catalog.enable
    );

    sectorOptions.value = industryCatalogs.map((catalog) => ({
      value: catalog.id.toString(), // Usar el ID como valor
      label: catalog.description || catalog.value,
    }));

    console.log("✅ Tipos de industria cargados:", sectorOptions.value);
  } catch (error) {
    console.error("❌ Error cargando tipos de industria:", error);
    // Fallback a opciones por defecto en caso de error
    sectorOptions.value = [
      { value: "1", label: "Tecnología" },
      { value: "2", label: "Salud" },
      { value: "3", label: "Educación" },
      { value: "4", label: "Finanzas" },
      { value: "5", label: "Retail" },
      { value: "6", label: "Manufactura" },
      { value: "7", label: "Servicios" },
      { value: "8", label: "Consultoría" },
      { value: "9", label: "Otro" },
    ];
  }
};

const schema = toTypedSchema(
  z.object({
    name: z.string().min(2, "El nombre es requerido"),
    postalCode: z.string().min(1, "El código postal es requerido"),
    sector: z.string().min(1, "El sector es requerido"),
  })
);

const { handleSubmit, errors, values, resetForm, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    name: "",
    postalCode: "",
    sector: "",
  },
});

// Envoltura para submit que podemos reutilizar en @submit y @click
function submitForm(event?: Event) {
  console.log("🟢 submitForm disparado");
  // Si viene de click, prevenimos que burbujee innecesariamente
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  const run = handleSubmit(onSubmit);
  return run();
}

// Debug: ver valores en tiempo real
console.log("🔍 Valores iniciales del formulario:", values);
console.log("🔍 Errores del formulario:", errors);
console.log("🔍 Estado del formulario:", {
  open: open.value,
  visitorLoading: visitorLoading.value,
});

// Watcher para ver cambios en tiempo real
watch(
  values,
  (newValues) => {
    console.log("🔄 Valores actualizados:", newValues);
  },
  { deep: true }
);

// Watcher para errores del formulario
watch(
  errors,
  (newErrors) => {
    console.log("❌ Errores del formulario:", newErrors);
  },
  { deep: true }
);

// Cargar tipos de industria al montar el componente
onMounted(() => {
  loadIndustryTypes();
  // Cargar códigos postales iniciales
  fetchPostalCodes();
});

async function onSubmit(values: any) {
  console.log("=== DEBUG FORMULARIO ===");
  console.log("Función onSubmit ejecutada");
  console.log("Valores recibidos:", values);
  console.log("Tipo de valores:", typeof values);
  console.log("¿Es objeto?", values && typeof values === "object");
  console.log("Nombre:", values?.name);
  console.log("Código Postal:", values?.postalCode);
  console.log("Sector:", values?.sector);
  console.log("Estado de loading:", visitorLoading.value);
  console.log("========================");

  submitError.value = null;

  // Toast informativo de inicio
  showInfo("Creando empresa", "Procesando la información de la empresa...", {
    duration: 1000,
  });
  if (!values || !values.name || !values.postalCode || !values.sector) {
    console.error("❌ Datos incompletos del formulario");
    console.error("Nombre presente:", !!values?.name);
    console.error("Código postal presente:", !!values?.postalCode);
    console.error("Sector presente:", !!values?.sector);

    // Toast de error para datos incompletos
    showError(
      "Datos incompletos",
      "Por favor, completa todos los campos del formulario."
    );

    submitError.value = "Completa todos los campos.";
    return;
  }

  // Validar que los valores sean números válidos
  const industryTypeId = parseInt(values.sector);
  const postalCodeId = parseInt(values.postalCode);

  console.log("IDs parseados:", { industryTypeId, postalCodeId });

  if (isNaN(industryTypeId) || isNaN(postalCodeId)) {
    console.error("❌ Valores de sector o código postal inválidos");
    console.error("Sector parseado:", industryTypeId);
    console.error("Código postal parseado:", postalCodeId);

    // Toast de error para valores inválidos
    showError(
      "Valores inválidos",
      "Por favor, selecciona opciones válidas de sector y código postal."
    );

    submitError.value = "Selecciona opciones válidas de sector y código postal.";
    return;
  }

  // Obtener el ID del usuario actual
  const { user } = useAuth();
  const currentUserId = user.value?.userId;

  console.log("👤 Usuario actual para crear empresa:", currentUserId);

  const requestData = {
    visitorId: currentUserId || 1, // Usar el ID del usuario actual
    companyName: values.name || null, // Según la API puede ser string | null
    industryTypeId: industryTypeId, // int32 según la API
    postalCodeId: postalCodeId, // int32 según la API
  };

  console.log("📤 Datos a enviar:", requestData);
  console.log("🔍 Verificación de tipos:");
  console.log("  - industryTypeId:", typeof industryTypeId, industryTypeId);
  console.log("  - postalCodeId:", typeof postalCodeId, postalCodeId);
  console.log("  - companyName:", typeof values.name, values.name);

  // Crear la empresa usando el servicio de visitor según la especificación de la API
  console.log("🔄 Llamando a createVisitorCompany...");

  try {
    const response = await createVisitorCompany(requestData);
    console.log("✅ createVisitorCompany exitoso, respuesta:", response);

    // Toast de éxito
    showSuccess(
      "¡Empresa creada!",
      `La empresa "${values.name}" ha sido creada exitosamente`
    );

    // Emitir evento específico para indicar que la empresa se creó exitosamente
    emit("company-created-success", {
      name: values.name,
      postalCode: values.postalCode,
      sector: values.sector,
    });

    // Cerrar el diálogo inmediatamente para mantener consistencia
    open.value = false;
    resetForm();
  } catch (error: any) {
    console.error("❌ Error creando empresa:", error);
    console.error("❌ Detalles del error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Toast de error
    showError(
      "Error al crear empresa",
      error?.message || "No se pudo crear la empresa. Por favor, intenta nuevamente."
    );

    submitError.value = error?.message || "No se pudo crear la empresa.";
  }
}
</script>
