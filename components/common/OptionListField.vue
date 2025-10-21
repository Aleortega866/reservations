<template>
  <div v-auto-animate="{ duration: 200, easing: 'ease-out' }" @click.stop @submit.prevent>
    <!-- Contenido principal -->
    <div>
      <div class="flex items-center justify-between" @click="toggleOptions($event)">
        <label class="text-sm block">{{ label }}</label>
      </div>

      <div
        class="space-y-0 overflow-hidden"
        v-auto-animate="{ duration: 200, easing: 'ease-out' }"
      >
        <!-- Input principal que se expande -->
        <div class="relative overflow-hidden mb-0">
          <Card
            class="bg-input-empty h-10 border-b-0 py-1 px-2.5 transition-all duration-100 ease-in-out"
            :class="[
              showOptionsList ? 'rounded-t-[20px] rounded-b-none border-b-0' : 'rounded-full',
              selectedOption ? 'bg-input-filled' : 'bg-input-empty',
              props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ]"
            @click="openOptionsList($event)"
            @submit.prevent
          >
            <CardContent class="flex items-center justify-between py-1 px-2">
              <p
                v-if="selectedOption"
                :class="[placeholderFontSize, placeholderFontStyle, placeholderClass]"
                class="max-w-[200px] truncate flex-1 mr-2 text-base text-[#3C3C3B] font-semibold"
              >
                {{ getDisplayValue(selectedOption) }}
              </p>
              <p
                v-else
                :class="[placeholderFontSize, placeholderFontStyle, placeholderClass]"
                class="max-w-[200px] truncate flex-1 mr-2 text-base text-[#7D7D7D] font-medium"
              >
                {{ placeholder }}
              </p>
              <Icon
                v-if="showOptionsList"
                icon="material-symbols:unfold-less"
                width="20"
                height="20"
                class="text-[#3C3C3B]"
              />
              <Icon v-else icon="material-symbols:unfold-more" width="20" height="20" class="text-[#3C3C3B]" />
            </CardContent>
          </Card>
        </div>
        <!-- Opciones que se expanden hacia abajo -->
        <div
          v-if="showOptions"
          class="space-y-0 overflow-y-hidden bg-input-empty rounded-b-[20px] rounded-0"
          v-auto-animate="{ duration: 150, easing: 'ease-in-out' }"
        >
          <div v-if="showOptionsList" class="overflow-hidden">
            <div
              class="bg-input-empty border border-t-0 px-1 pb-2 pt-0 w-full rounded-b-lg max-h-60 overflow-y-auto"
              @click.stop
              @submit.prevent
              @keydown.stop
            >
              <!-- Barra de búsqueda (opcional) -->
              <div v-if="searchable" class="mx-4 my-3">
                <div class="relative">
                  <input
                    v-model="searchTerm"
                    type="text"
                    :placeholder="searchPlaceholder"
                    class="w-full h-8 bg-white placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate pl-10 pr-5 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    @click.stop
                    @keydown.stop
                  />
                  <Icon
                    icon="material-symbols:search"
                    width="20"
                    height="20"
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
                  />
                </div>
              </div>

              <!-- Lista de opciones -->
              <div class="divide-y-2 divide-[#61A4E5]">
                <div
                  v-for="option in filteredOptions"
                  :key="getOptionKey(option)"
                  class="cursor-pointer py-1.5 hover:bg-gray-100 transition-colors duration-200"
                  :class="[
                    {
                      'text-sm text-[#3C3C3B] font-medium underline pl-3.5': isSelected(option),
                      'text-sm text-[#7D7D7D] font-medium hover:bg-gray-100 pl-3.5': !isSelected(option),
                    },
                    'even:bg-[#EBF4FC]',
                    'odd:bg-[#D8E8F8]',
                    'last:rounded-b-[20px]',
                    optionsContentFontSize,
                  ]"
                  @click="selectOption(option, $event)"
                >
                  {{ getDisplayValue(option) }}
                </div>

                <!-- Mensaje cuando no hay opciones -->
                <div
                  v-if="filteredOptions.length === 0"
                  class="px-3 py-2 text-sm text-gray-500 text-center"
                >
                  {{ noOptionsMessage }}
                </div>
              </div>
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
import { Icon } from "@iconify/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

// Tipos para las opciones
export interface OptionItem {
  value: string | number;
  label?: string;
  disabled?: boolean;
  [key: string]: any;
}

export type OptionType = string | number | OptionItem;

interface Props {
  modelValue?: OptionType | null;
  label?: string;
  placeholder?: string;
  placeholderClass?: string;
  placeholderFontSize?: string;
  placeholderFontStyle?: string;
  options?: OptionType[];
  optionsContentFontSize?: string;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  valueKey?: string;
  labelKey?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecciona una opción",
  placeholderClass: "",
  placeholderFontSize: "text-base",
  placeholderFontStyle: "regular",
  optionsContentFontSize: "text-base",
  required: false,
  searchable: false,
  searchPlaceholder: "Buscar...",
  noOptionsMessage: "No hay opciones disponibles",
  valueKey: "value",
  labelKey: "label",
  options: () => [],
  disabled: false,
});

const emit = defineEmits(["update:modelValue"]);

const showOptionsList = ref(false);
const showOptions = ref(false);
const selectedOption = ref<OptionType | null>(null);
const searchTerm = ref("");

// Función para obtener el valor de un option
const getOptionValue = (option: OptionType): string | number => {
  if (typeof option === "string" || typeof option === "number") {
    return option;
  }
  return (option as any)[props.valueKey] || option.value;
};

// Función para obtener el label de un option
const getDisplayValue = (option: OptionType): string => {
  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }
  return (option as any)[props.labelKey] || option.label || String(option.value);
};

// Función para obtener la clave única de un option
const getOptionKey = (option: OptionType): string | number => {
  return getOptionValue(option);
};

// Función para verificar si una opción está seleccionada
const isSelected = (option: OptionType): boolean => {
  if (!selectedOption.value) return false;
  return getOptionValue(option) === getOptionValue(selectedOption.value);
};

// Opciones filtradas por búsqueda
const filteredOptions = computed(() => {
  const options = props.options || [];

  if (!props.searchable || !searchTerm.value) {
    return options;
  }

  return options.filter((option: OptionType) => {
    const displayValue = getDisplayValue(option).toLowerCase();
    return displayValue.includes(searchTerm.value.toLowerCase());
  });
});

// Inicializar valor seleccionado
watch(
  () => props.modelValue,
  (newValue: OptionType | null | undefined) => {
    // console.log("🔍 OptionListField - modelValue changed:", newValue);
    // console.log("🔍 OptionListField - options available:", props.options);

    if (newValue !== undefined && newValue !== null) {
      // Buscar la opción que coincida con el modelValue
      const options = props.options || [];
      const matchingOption = options.find(
        (option: OptionType) =>
          getOptionValue(option) === newValue ||
          (typeof newValue === "object" &&
            getOptionValue(option) === getOptionValue(newValue))
      );

      // console.log("🔍 OptionListField - matchingOption found:", matchingOption);
      // console.log("🔍 OptionListField - newValue type:", typeof newValue);
      // console.log("🔍 OptionListField - newValue value:", newValue);
      /* console.log(
        "🔍 OptionListField - options structure:",
        options.map((opt) => ({
          value: getOptionValue(opt),
          label: getDisplayValue(opt),
        }))
      );*/

      selectedOption.value = matchingOption || newValue;
      // console.log("🔍 OptionListField - selectedOption set to:", selectedOption.value);
      /* console.log(
        "🔍 OptionListField - selectedOption type:",
        typeof selectedOption.value
      ); */
    } else {
      selectedOption.value = null;
    }
  },
  { immediate: true }
);

// Observar cambios en las opciones para mantener la sincronización
watch(
  () => props.options,
  (newOptions: OptionType[] | null | undefined) => {
    // console.log("🔍 OptionListField - options changed:", newOptions?.length || 0);

    if (
      selectedOption.value !== null &&
      newOptions &&
      Array.isArray(newOptions) &&
      newOptions.length > 0
    ) {
      // Verificar si la opción seleccionada aún existe en las nuevas opciones
      const stillExists = newOptions.find(
        (option: OptionType) =>
          getOptionValue(option) === getOptionValue(selectedOption.value!)
      );

      if (!stillExists) {
        // Si la opción seleccionada ya no existe, limpiar la selección
        selectedOption.value = null;
        emit("update:modelValue", null);
      } else {
        // Si las opciones se cargaron después del valor, intentar encontrar la opción correcta
        const currentValue = props.modelValue;
        if (currentValue !== undefined && currentValue !== null) {
          const matchingOption = newOptions.find(
            (option) => getOptionValue(option) === currentValue
          );
          if (matchingOption) {
            /* console.log(
              "🔍 OptionListField - Found matching option after options loaded:",
              matchingOption
            ); */
            selectedOption.value = matchingOption;
          }
        }
      }
    }
  },
  { immediate: false, deep: false }
);

const toggleOptions = (event?: Event) => {
  // Prevenir que el evento se propague y cause el envío del formulario
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Si el componente está deshabilitado, no hacer nada
  if (props.disabled) {
    return;
  }

  showOptions.value = !showOptions.value;

  // Si se cierra showOptions, también cerrar la lista
  if (!showOptions.value) {
    showOptionsList.value = false;
    searchTerm.value = "";
  }
};

const openOptionsList = (event?: Event) => {
  // Prevenir que el evento se propague y cause el envío del formulario
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Si el componente está deshabilitado, no hacer nada
  if (props.disabled) {
    return;
  }

  showOptionsList.value = !showOptionsList.value;

  // Si la lista se está abriendo, asegurar que showOptions también esté activo
  if (showOptionsList.value) {
    showOptions.value = true;
  } else {
    searchTerm.value = "";
  }
};

// Función para seleccionar una opción
const selectOption = (option: OptionType, event?: Event) => {
  // Prevenir propagación de eventos
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Verificar si la opción está deshabilitada
  if (typeof option === "object" && option.disabled) {
    return;
  }

  // Actualizar la opción seleccionada
  selectedOption.value = option;

  // Emitir el cambio al componente padre
  emit("update:modelValue", getOptionValue(option));

  // Cerrar la lista después de la selección
  showOptionsList.value = false;
  showOptions.value = false;
  searchTerm.value = "";
};
</script>
