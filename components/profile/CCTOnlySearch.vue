<template>
  <div>
    <label class="block text-sm font-medium mb-2"
      >Busca la institución que deseas agregar</label
    >

    <div class="bg-secondary/20 rounded-2xl p-2 overflow-hidden" @click="toggleOptions">
      <div class="flex justify-between items-center mb-4 px-1 overflow-hidden">
        <label class="block text-sm font-medium text-card-foreground/70 mb-0">{{
          label
        }}</label>

        <Icon
          v-if="showOptions"
          icon="mdi:chevron-down-up"
          class="w-8 h-8 text-card-foreground/70 pointer-events-none"
        />
        <Icon
          v-else
          icon="mdi:chevron-up-down"
          class="w-8 h-8 text-card-foreground/70 pointer-events-none"
        />
      </div>

      <div
        class="space-y-0 mt-1 overflow-hidden"
        v-auto-animate="{ duration: 200, easing: 'ease-out' }"
      >
        <!-- Input principal de búsqueda que se expande -->
        <div
          class="relative text-sm h-10 overflow-hidden"
          :class="showOptions ? 'rounded-t-md' : 'rounded-md'"
        >
          <Icon
            icon="lucide:search"
            width="16"
            height="16"
            class="absolute left-3 top-4 transform -translate-y-1/2 text-primary pointer-events-none"
          />
          <input
            v-model="searchQuery"
            :placeholder="placeholder"
            :class="[
              'w-full rounded-full bg-white border-1 border-primary cursor-pointer px-10 !h-8',
              searchQuery ? 'bg-white' : '',
            ]"
            @input="handleSearchInput"
            @focus="handleInputFocus"
            maxlength="10"
          />
        </div>

        <!-- Opciones que se expanden hacia abajo -->
        <div
          v-if="showOptions"
          class="space-y-0 overflow-hidden"
          v-auto-animate="{ duration: 150, easing: 'ease-in-out' }"
        >
          <!-- Lista de opciones filtradas -->
          <div class="max-h-60 overflow-y-auto pt-2" v-auto-animate="{ duration: 100 }">
            <!-- Indicador de carga para búsqueda CCT -->
            <div v-if="loadingCCT" class="p-3 text-center">
              <span class="text-sm text-muted-foreground">
                Buscando institución por CCT...
              </span>
            </div>

            <!-- Error en búsqueda CCT -->
            <div v-else-if="cctError" class="p-3 text-center">
              <span class="text-sm text-destructive">
                {{ cctError }}
              </span>
            </div>

            <!-- Resultados de búsqueda -->
            <div v-else>
              <div
                v-for="(option, index) in filteredOptions"
                :key="option.value"
                class="p-1.5 border-0 border-t-1 border-secondary hover:bg-secondary/20 transition-colors"
                :class="
                  index === filteredOptions.length - 1 ? 'rounded-b-md' : 'rounded-none'
                "
              >
                <div class="flex items-center space-x-2">
                  <Checkbox
                    variant="secondary"
                    v-if="multiple"
                    :model-value="selectedValuesArray.includes(option.value)"
                    @update:model-value="(checked: boolean | 'indeterminate') => { if (typeof checked === 'boolean') handleCheckboxChange(option, checked) }"
                  />
                  <span
                    class="text-sm text-muted-foreground cursor-pointer"
                    :class="{
                      'font-medium':
                        !multiple && selectedValuesArray.includes(option.value),
                    }"
                    @click.stop="toggleOption(option)"
                  >
                    {{ option.label }}
                  </span>
                  <span class="text-sm text-muted-foreground cursor-pointer">
                    {{ option.location }}
                  </span>
                </div>
              </div>

              <!-- Mensaje si no hay resultados -->
              <div
                v-if="filteredOptions.length === 0 && searchQuery.length === 10"
                class="p-3 overflow-hidden"
              >
                <span class="text-sm text-muted-foreground text-center block">
                  No se encontró ninguna institución con ese CCT
                </span>
              </div>

              <!-- Mensaje de instrucción -->
              <div v-else-if="filteredOptions.length === 0" class="p-3 overflow-hidden">
                <span class="text-sm text-muted-foreground text-center block">
                  Ingresa el CCT de 10 caracteres para buscar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Checkbox } from "@/components/ui/checkbox";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { Icon } from "@iconify/vue";
import { useInstitutions } from "@/composables/catalog/useInstitutions";

interface Option {
  value: string;
  label: string;
  type?: string;
  location?: string;
  status?: string;
  description?: string;
}

interface Props {
  modelValue: string[] | string;
  label: string;
  placeholder?: string;
  options: Option[];
  autoOpen?: boolean;
  multiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Ingresa el CCT de 10 caracteres...",
  autoOpen: false,
  multiple: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: string[] | string];
  "institutions-selected": [institutions: Option[]];
}>();

const searchQuery = ref("");
const showOptions = ref(props.autoOpen);

// Estados para búsqueda CCT
const loadingCCT = ref(false);
const cctError = ref<string | null>(null);
const cctSearchResults = ref<Option[]>([]);

// Composable para instituciones
const { getInstitutionByCCT } = useInstitutions();

// Computed para obtener el array de valores seleccionados
const selectedValuesArray = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  } else {
    const value = Array.isArray(props.modelValue)
      ? props.modelValue[0]
      : props.modelValue;
    return value ? [value] : [];
  }
});

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(
  () => props.autoOpen,
  (newValue) => {
    showOptions.value = newValue;
  }
);

// Watcher para mostrar opciones cuando se actualicen los filtros
watch(
  () => props.options,
  (newOptions) => {
    console.log("🔄 Opciones actualizadas:", newOptions.length, "opciones disponibles");
    console.log("📋 Contenido de las opciones:", newOptions);

    // Si hay nuevas opciones filtradas, mostrar las opciones automáticamente
    if (newOptions.length > 0) {
      console.log("✅ Abriendo opciones automáticamente");
      showOptions.value = true;
    } else {
      console.log("⚠️ No hay opciones disponibles");
    }
  },
  { deep: true, immediate: true }
);

// Watcher adicional para detectar cambios en el array de opciones
watch(
  () => props.options.length,
  (newLength, oldLength) => {
    console.log("📊 Cambio en número de opciones:", oldLength, "→", newLength);

    if (newLength > 0 && newLength !== oldLength) {
      console.log("🔄 Cambio detectado, abriendo opciones");
      showOptions.value = true;
    }
  }
);

// Función para manejar el focus del input
const handleInputFocus = () => {
  console.log("🎯 Focus en input, opciones disponibles:", props.options.length);

  // Siempre mostrar las opciones disponibles cuando se hace focus
  // Esto incluye opciones filtradas por estado, municipio, localidad, etc.
  if (props.options.length > 0) {
    console.log("✅ Mostrando opciones del filtro al hacer focus");
    showOptions.value = true;
  } else if (cctSearchResults.value.length > 0) {
    console.log("✅ Mostrando resultados de búsqueda CCT al hacer focus");
    showOptions.value = true;
  } else {
    console.log("⚠️ No hay opciones disponibles para mostrar");
  }
};

// Función para manejar la entrada de búsqueda
const handleSearchInput = async () => {
  // Solo buscar cuando el CCT tenga exactamente 10 caracteres
  if (searchQuery.value.length === 10) {
    // Verificar si parece ser un CCT (código alfanumérico)
    if (/^[A-Z0-9]+$/i.test(searchQuery.value)) {
      console.log(" Detectado CCT de 10 caracteres:", searchQuery.value);
      await searchByCCT(searchQuery.value.toUpperCase());
    } else {
      cctError.value = "El CCT debe contener solo letras y números";
      cctSearchResults.value = [];
    }
  } else if (searchQuery.value.length > 10) {
    // Truncar a 10 caracteres
    searchQuery.value = searchQuery.value.substring(0, 10);
  } else {
    // Limpiar resultados de búsqueda CCT si no es un CCT válido
    cctSearchResults.value = [];
    cctError.value = null;
  }
};

// Función para buscar por CCT
const searchByCCT = async (cct: string) => {
  try {
    loadingCCT.value = true;
    cctError.value = null;
    showOptions.value = true; // Abrir opciones automáticamente

    console.log("🔍 Buscando institución por CCT:", cct);

    // Parámetros para la búsqueda CCT
    const cctParams = {
      cct: cct,
      pageNumber: 1,
      pageSize: 10,
    };

    const result = await getInstitutionByCCT(cctParams);

    console.log("✅ Resultados de búsqueda CCT:", result);

    // Transformar los resultados al formato esperado
    cctSearchResults.value = result.map((institution: any) => ({
      value: institution.id?.toString() || "",
      label: institution.institutionName || "Sin nombre",
      type: "Institución Educativa",
      location: `CCT: ${institution.cct || "N/A"}`,
      status: "Registrada SEP",
      description: `Institución con CCT: ${institution.cct || "N/A"}`,
    }));

    console.log("🔄 Resultados transformados:", cctSearchResults.value);
  } catch (error) {
    console.error("❌ Error en búsqueda CCT:", error);
    cctError.value =
      error instanceof Error ? error.message : "Error al buscar institución por CCT";
    cctSearchResults.value = [];
  } finally {
    loadingCCT.value = false;
  }
};

const filteredOptions = computed(() => {
  console.log("🔍 Computed filteredOptions ejecutándose");
  console.log("📊 Resultados CCT:", cctSearchResults.value.length);
  console.log("📊 Opciones del filtro:", props.options.length);
  console.log("📋 Props.options contenido:", props.options);

  // Priorizar resultados de búsqueda CCT, pero siempre mostrar opciones disponibles
  if (cctSearchResults.value.length > 0) {
    console.log("✅ Retornando resultados de búsqueda CCT");
    return cctSearchResults.value;
  }

  // Si no hay resultados de búsqueda, mostrar las opciones del filtro
  // (estado, municipio, localidad, etc.)
  console.log("✅ Retornando opciones del filtro");
  console.log("🔄 Opciones que se van a mostrar:", props.options);
  return props.options;
});

const toggleOptions = () => {
  showOptions.value = !showOptions.value;
};

const toggleOption = (option: Option) => {
  console.log("🔍 CCTOnlySearch - toggleOption llamado con opción completa:", option);
  console.log(
    "📋 Opciones disponibles:",
    props.options.map((opt) => ({ value: opt.value, label: opt.label }))
  );
  console.log("🎯 Opción seleccionada:", option);

  if (props.multiple) {
    const newValues = [...selectedValuesArray.value];
    const index = newValues.indexOf(option.value);
    const isAdding = index === -1;

    if (index > -1) {
      newValues.splice(index, 1);
    } else {
      newValues.push(option.value);
    }

    console.log("📤 CCTOnlySearch - Emitiendo valores múltiples:", newValues);
    // Emitir directamente el nuevo valor
    emit("update:modelValue", newValues);

    // Emitir las instituciones seleccionadas completas usando la información directa
    const selectedInstitutions = getSelectedInstitutionsWithNewOption(option, isAdding);
    console.log(
      "📤 CCTOnlySearch - Emitiendo instituciones completas:",
      selectedInstitutions
    );
    emit("institutions-selected", selectedInstitutions);
  } else {
    console.log("📤 CCTOnlySearch - Emitiendo valor único:", option.value);
    // Para selección única, simplemente reemplazar el valor
    emit("update:modelValue", option.value);
    showOptions.value = false; // Cerrar opciones después de seleccionar

    // Emitir las instituciones seleccionadas completas
    const selectedInstitutions = [option]; // Para selección única, solo la opción actual
    console.log(
      "📤 CCTOnlySearch - Emitiendo instituciones completas:",
      selectedInstitutions
    );
    emit("institutions-selected", selectedInstitutions);
  }
};

const removeOption = (value: string) => {
  if (props.multiple) {
    const newValues = selectedValuesArray.value.filter((v) => v !== value);
    emit("update:modelValue", newValues);

    // Emitir las instituciones seleccionadas completas
    const selectedInstitutions = getSelectedInstitutions();
    console.log(
      "📤 CCTOnlySearch - Emitiendo instituciones completas después de remover:",
      selectedInstitutions
    );
    emit("institutions-selected", selectedInstitutions);
  } else {
    emit("update:modelValue", "");

    // Emitir las instituciones seleccionadas completas
    const selectedInstitutions = getSelectedInstitutions();
    console.log(
      "📤 CCTOnlySearch - Emitiendo instituciones completas después de remover:",
      selectedInstitutions
    );
    emit("institutions-selected", selectedInstitutions);
  }
};

const getOptionLabel = (value: string) => {
  // Buscar en los resultados de CCT
  const cctOption = cctSearchResults.value.find((opt) => opt.value === value);
  if (cctOption) return cctOption.label;

  // Buscar en las opciones normales como fallback
  const option = props.options.find((opt) => opt.value === value);
  return option ? option.label : value;
};

const getOptionDetails = (value: string) => {
  // Buscar en los resultados de CCT
  const cctOption = cctSearchResults.value.find((opt) => opt.value === value);
  if (cctOption) {
    return {
      type: cctOption.type,
      location: cctOption.location,
      status: cctOption.status,
      description: cctOption.description,
    };
  }

  // Buscar en las opciones normales como fallback
  const option = props.options.find((opt) => opt.value === value);
  if (!option) return null;

  return {
    type: option.type,
    location: option.location,
    status: option.status,
    description: option.description,
  };
};

// Función para obtener las instituciones seleccionadas completas
const getSelectedInstitutions = (): Option[] => {
  console.log(
    "🔍 getSelectedInstitutions llamado con selectedValuesArray:",
    selectedValuesArray.value
  );
  const selectedInstitutions: Option[] = [];

  selectedValuesArray.value.forEach((value) => {
    // Buscar en los resultados de CCT primero
    const cctOption = cctSearchResults.value.find((opt) => opt.value === value);
    if (cctOption) {
      console.log("✅ Encontrada institución en cctSearchResults:", cctOption);
      selectedInstitutions.push(cctOption);
      return;
    }

    // Buscar en las opciones del filtro como fallback
    const option = props.options.find((opt) => opt.value === value);
    if (option) {
      console.log("✅ Encontrada institución en props.options:", option);
      selectedInstitutions.push(option);
      return;
    }

    // Si no se encuentra en ninguna lista, crear una opción básica con la información disponible
    console.warn(
      "⚠️ Institución no encontrada en ninguna lista, creando opción básica para value:",
      value
    );
    const basicOption: Option = {
      value: value,
      label: `Institución ID: ${value}`,
      type: "Institución Educativa",
      location: `ID: ${value}`,
      status: "Registrada",
      description: `Institución con ID: ${value}`,
    };
    selectedInstitutions.push(basicOption);
  });

  console.log("📋 Instituciones seleccionadas completas:", selectedInstitutions);
  return selectedInstitutions;
};

// Función para obtener las instituciones seleccionadas considerando una nueva opción
const getSelectedInstitutionsWithNewOption = (
  newOption: Option,
  isAdding: boolean
): Option[] => {
  const selectedInstitutions: Option[] = [];

  // Obtener las instituciones actualmente seleccionadas (sin la nueva opción)
  const currentSelected = selectedValuesArray.value.filter((v) => v !== newOption.value);

  // Agregar las instituciones que ya estaban seleccionadas
  currentSelected.forEach((value) => {
    // Buscar en los resultados de CCT primero
    const cctOption = cctSearchResults.value.find((opt) => opt.value === value);
    if (cctOption) {
      selectedInstitutions.push(cctOption);
      return;
    }

    // Buscar en las opciones del filtro como fallback
    const option = props.options.find((opt) => opt.value === value);
    if (option) {
      selectedInstitutions.push(option);
      return;
    }

    // Si no se encuentra, crear una opción básica
    const basicOption: Option = {
      value: value,
      label: `Institución ID: ${value}`,
      type: "Institución Educativa",
      location: `ID: ${value}`,
      status: "Registrada",
      description: `Institución con ID: ${value}`,
    };
    selectedInstitutions.push(basicOption);
  });

  // Si estamos agregando la nueva opción, incluirla
  if (isAdding) {
    selectedInstitutions.push(newOption);
    console.log("✅ Agregando nueva institución:", newOption);
  } else {
    console.log("❌ Removiendo institución:", newOption.value);
  }

  console.log(
    "📋 Instituciones seleccionadas completas (con nueva opción):",
    selectedInstitutions
  );
  return selectedInstitutions;
};

const handleCheckboxChange = (option: Option, checked: boolean) => {
  console.log(
    "🔍 CCTOnlySearch - handleCheckboxChange llamado con opción completa:",
    option
  );
  console.log("📋 Estado del checkbox:", checked);

  if (checked) {
    // Agregar valor
    const newValues = [...selectedValuesArray.value, option.value];
    console.log("📤 CCTOnlySearch - Emitiendo valores múltiples:", newValues);
    console.log("📋 Información completa de la opción seleccionada:", {
      id: option.value,
      nombre: option.label,
      ubicacion: option.location,
      tipo: option.type,
      estado: option.status,
      descripcion: option.description,
    });
    emit("update:modelValue", newValues);

    // Emitir las instituciones seleccionadas completas usando la información directa
    const selectedInstitutions = getSelectedInstitutionsWithNewOption(option, true);
    console.log(
      "📤 CCTOnlySearch - Emitiendo instituciones completas:",
      selectedInstitutions
    );
    emit("institutions-selected", selectedInstitutions);
  } else {
    // Remover valor
    const newValues = selectedValuesArray.value.filter((v) => v !== option.value);
    console.log("📤 CCTOnlySearch - Removiendo valor:", option.value);
    emit("update:modelValue", newValues);

    // Emitir las instituciones seleccionadas completas
    const selectedInstitutions = getSelectedInstitutionsWithNewOption(option, false);
    console.log(
      "📤 CCTOnlySearch - Emitiendo instituciones completas:",
      selectedInstitutions
    );
    emit("institutions-selected", selectedInstitutions);
  }
};

// Función para limpiar completamente el componente (llamada externa)
const clearAll = () => {
  console.log("🧹 CCTOnlySearch - Limpiando todo el componente");

  // Limpiar búsqueda
  searchQuery.value = "";
  cctSearchResults.value = [];
  cctError.value = null;

  // Cerrar opciones
  showOptions.value = false;

  console.log("✅ CCTOnlySearch - Componente limpiado completamente");
};

// Exponer la función clearAll para uso externo
defineExpose({
  clearAll,
});
</script>
