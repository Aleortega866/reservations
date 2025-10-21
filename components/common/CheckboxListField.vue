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
              selectedOptions.length > 0 ? 'bg-input-filled' : 'bg-input-empty',
              props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ]"
            @click="openOptionsList($event)"
            @submit.prevent
          >
            <CardContent class="flex items-center justify-between py-1 px-2">
              <p v-if="selectedOptions.length > 0" :class="[placeholderFontSize, placeholderFontStyle, placeholderClass]" class="max-w-[200px] truncate flex-1 mr-2 text-base text-[#3C3C3B] font-semibold">
                {{ getDisplayValue() }}
              </p>
              <p v-else :class="[placeholderFontSize, placeholderFontStyle, placeholderClass]" class="max-w-[200px] truncate flex-1 mr-2 text-base text-[#7D7D7D] font-medium">
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
              <div v-if="searchable" class="mmx-4 my-3">
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

              <!-- Lista de checkboxes -->
              <div class="divide-y-2 divide-[#61A4E5]">
                <div
                  v-for="option in filteredOptions"
                  :key="getOptionKey(option)"
                  class="cursor-pointer py-1.5 hover:bg-gray-100 transition-colors duration-200"
                  :class="[
                    {
                      'text-sm text-[#3C3C3B] font-medium underline pl-3.5': isChecked(option),
                      'text-sm text-[#7D7D7D] font-medium hover:bg-gray-100 pl-3.5': !isChecked(option),
                    },
                    'even:bg-[#EBF4FC]',
                    'odd:bg-[#D8E8F8]',
                    'last:rounded-b-[20px]',
                    optionsContentFontSize,
                  ]"
                  @click="toggleCheckbox(option, $event)"
                >
                  <div class="flex items-center space-x-2 cursor-pointer">
                    <Checkbox :id="`${fieldId}-${getOptionValue(option)}`" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" :variant="varianteCheck" :model-value="isChecked(option)"
                    @update:model-value="(checked) => handleCheckboxToggle(option, checked)" @click.stop />
                    <Label 
                      :for="`${fieldId}-${getOptionValue(option)}`" 
                      class="text-sm text-[#7D7D7D] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {{ getDisplayValue(option) }}
                    </Label>
                  </div>
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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@iconify/vue'
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
  modelValue?: (string | number)[] | null;
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
  fieldId?: string;
  varianteCheck?: 'secondary' | 'default' | 'institutional' | 'primary' | 'accent' | 'warning';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecciona una o más opciones",
  placeholderClass: '',
  placeholderFontSize: 'text-base',
  placeholderFontStyle: 'regular',
  optionsContentFontSize: 'text-base',
  required: false,
  searchable: false,
  searchPlaceholder: "Buscar...",
  noOptionsMessage: "No hay opciones disponibles",
  valueKey: "value",
  labelKey: "label",
  options: () => [],
  fieldId: 'checkbox-list',
  varianteCheck: 'secondary',
  disabled: false,
});

const emit = defineEmits(["update:modelValue"]);

const showOptionsList = ref(false);
const showOptions = ref(false);
const selectedOptions = ref<(string | number)[]>([]);
const searchTerm = ref("");

// Función para obtener el valor de un option
const getOptionValue = (option: OptionType): string | number => {
  if (typeof option === "string" || typeof option === "number") {
    return option;
  }
  return (option as any)[props.valueKey] || option.value;
};

// Función para obtener el label de un option
const getDisplayValue = (option?: OptionType): string => {
  if (!option) {
    if (selectedOptions.value.length === 0) return "";
    if (selectedOptions.value.length === 1) {
      const option = props.options.find(opt => getOptionValue(opt) === selectedOptions.value[0]);
      return option ? getDisplayValue(option) : "";
    }
    return `${selectedOptions.value.length} opciones seleccionadas`;
  }
  
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
const isChecked = (option: OptionType): boolean => {
  const value = getOptionValue(option);
  return selectedOptions.value.includes(value);
};

// Opciones filtradas por búsqueda
const filteredOptions = computed(() => {
  const options = props.options || [];
  
  if (!props.searchable || !searchTerm.value) {
    return options;
  }
  
  return options.filter(option => {
    const displayValue = getDisplayValue(option).toLowerCase();
    return displayValue.includes(searchTerm.value.toLowerCase());
  });
});

// Inicializar valores seleccionados
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && Array.isArray(newValue)) {
      selectedOptions.value = [...newValue];
    } else {
      selectedOptions.value = [];
    }
  },
  { immediate: true }
);

// Observar cambios en las opciones para mantener la sincronización
watch(
  () => props.options,
  (newOptions) => {
    if (selectedOptions.value.length > 0 && newOptions && Array.isArray(newOptions) && newOptions.length > 0) {
      // Verificar si las opciones seleccionadas aún existen en las nuevas opciones
      const validSelections = selectedOptions.value.filter(selectedValue => 
        newOptions.find(option => getOptionValue(option) === selectedValue)
      );
      
      if (validSelections.length !== selectedOptions.value.length) {
        // Si algunas opciones seleccionadas ya no existen, actualizar la selección
        selectedOptions.value = validSelections;
        emit("update:modelValue", validSelections);
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

// Función para alternar checkbox
const toggleCheckbox = (option: OptionType, event?: Event) => {
  // Prevenir propagación de eventos
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Si el componente está deshabilitado, no hacer nada
  if (props.disabled) {
    return;
  }

  // Verificar si la opción está deshabilitada
  if (typeof option === "object" && option.disabled) {
    return;
  }

  const value = getOptionValue(option);
  let newSelectedOptions = [...selectedOptions.value];

  if (isChecked(option)) {
    // Remover el valor si está presente
    newSelectedOptions = newSelectedOptions.filter(item => item !== value);
  } else {
    // Agregar el valor si no está presente
    newSelectedOptions.push(value);
  }

  selectedOptions.value = newSelectedOptions;
  emit("update:modelValue", newSelectedOptions);
};

// Función para manejar el toggle del checkbox de shadcn
const handleCheckboxToggle = (option: OptionType, checked: boolean | "indeterminate") => {
  // Verificar si la opción está deshabilitada
  if (typeof option === "object" && option.disabled) {
    return;
  }

  const value = getOptionValue(option);
  let newSelectedOptions = [...selectedOptions.value];

  // Solo manejar valores booleanos, ignorar "indeterminate"
  if (checked === true) {
    // Agregar el valor si no está presente
    if (!newSelectedOptions.includes(value)) {
      newSelectedOptions.push(value);
    }
  } else if (checked === false) {
    // Remover el valor si está presente
    newSelectedOptions = newSelectedOptions.filter(item => item !== value);
  }

  selectedOptions.value = newSelectedOptions;
  emit("update:modelValue", newSelectedOptions);
};

</script>
