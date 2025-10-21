<template>
  <div>
    <div v-auto-animate="{ duration: 200, easing: 'ease-out' }" @click.stop @submit.prevent>
      <!-- Contenido principal -->
      <div>
        <div class="flex items-center justify-between" @click="toggleOptions($event)">
          <label class="text-sm block">{{ label }}</label>
        </div>

        <div
          class="space-y-0 mt-1 overflow-hidden"
          v-auto-animate="{ duration: 200, easing: 'ease-out' }"
        >
          <!-- Input principal que se expande -->
          <div class="relative overflow-hidden mb-0">
            <Card
              class="bg-input-empty h-10 cursor-pointer border-b-0 py-1 px-1 transition-all duration-100 ease-in-out"
              :class="[
                showOptionsList ? 'rounded-t-0 rounded-b-none border-b-0' : 'rounded-full',
                selectedDisabilities.length > 0 ? 'bg-input-filled' : 'bg-input-empty'
              ]"
              @click="openOptionsList($event)"
              @submit.prevent
            >
              <CardContent class="flex items-center justify-between py-1 px-2">
                <p v-if="selectedDisabilities.length > 0" :class="[placeholderFontSize, placeholderFontStyle, placeholderClass]" class="max-w-[200px] truncate flex-1 mr-2">
                  {{ getDisplayValue() }}
                </p>
                <p v-else :class="[placeholderFontSize, placeholderFontStyle, placeholderClass]" class="opacity-60 max-w-[200px] truncate flex-1 mr-2">
                  {{ placeholder }}
                </p>
                <Icon v-if="showOptionsList" icon="lucide:chevrons-down-up" width="16" height="16" />
                <Icon v-else icon="lucide:chevrons-up-down" width="16" height="16" />
              </CardContent>
            </Card>
          </div>
          
          <!-- Opciones que se expanden hacia abajo -->
          <div
            v-if="showOptions"
            class="space-y-0 overflow-y-hidden bg-input-empty rounded-b-lg rounded-0"
            v-auto-animate="{ duration: 150, easing: 'ease-in-out' }"
          >
            <div v-if="showOptionsList" class="overflow-hidden">
              <div 
                class="bg-input-empty border border-t-0 p-3 w-full rounded-b-lg max-h-60 overflow-y-auto" 
                @click.stop
                @submit.prevent
                @keydown.stop
              >
                <!-- Barra de búsqueda (opcional) -->
                <div v-if="searchable" class="mb-3">
                  <div class="relative">
                    <input
                      v-model="searchTerm"
                      type="text"
                      :placeholder="searchPlaceholder"
                      class="w-full bg-white pl-10 pr-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                      @click.stop
                      @keydown.stop
                    />
                    <Icon icon="lucide:search" width="16" height="16" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
                  </div>
                </div>

                <!-- Lista de discapacidades con niveles -->
                <div class="space-y-2">
                  <div
                    v-for="category in filteredCategories"
                    :key="category.id"
                    class="space-y-1"
                  >
                    <!-- Si la categoría tiene subcategorías, mostrar como árbol expandido -->
                    <div v-if="category.subcategories && category.subcategories.length > 0">
                      <!-- Título de la categoría (sin checkbox, solo informativo) -->
                      <div class="px-2 py-2 ">
                        <div class="flex items-center space-x-2">
                          <span class="text-sm font-medium text-gray-700">{{ category.name }}</span>
                          <Icon 
                            v-if="category.description"
                            icon="lucide:info"
                            width="14" 
                            height="14"
                            class="text-gray-400 hover:text-gray-600 cursor-pointer"
                            @click="showInfo(category, $event)"
                          />
                        </div>
                      </div>

                      <!-- Subcategorías (siempre visibles, sin desplegable) -->
                      <div class="ml-3 space-y-1">
                        <div
                          v-for="subcategory in category.subcategories"
                          :key="subcategory.id"
                          class="flex items-center space-x-2 px-3 py-1 cursor-pointer border-t-1 border-secondary hover:bg-gray-50 transition-colors duration-200"
                          :class="[
                            {
                              'bg-blue-50 text-blue-700': isSubcategorySelected(subcategory),
                              'hover:bg-gray-50': !isSubcategorySelected(subcategory)
                            },
                            optionsContentFontSize
                          ]"
                          @click="toggleSubcategory(subcategory, $event)"
                        >
                          <Checkbox
                            :id="`${fieldId}-subcategory-${subcategory.id}`"
                            :model-value="isSubcategorySelected(subcategory)"
                            @update:model-value="(checked) => handleSubcategoryToggle(subcategory, checked)"
                            @click.stop
                            variant="secondary"
                          />
                          <Label 
                            :for="`${fieldId}-subcategory-${subcategory.id}`" 
                            class="text-sm font-light cursor-pointer flex-1"
                          >
                            {{ subcategory.name }}
                          </Label>
                          <Icon
                            v-if="subcategory.description"
                              icon="ri:information-2-fill"
                              width="20"
                              height="20"
                              class="text-[#003DA6]"
                              @click="showInfo(subcategory, $event)"
                            />
                        </div>
                      </div>
                    </div>

                    <!-- Si la categoría NO tiene subcategorías, mostrar solo como opción con checkbox -->
                    <div v-else
                      class="flex items-center space-x-2 px-3 py-2 cursor-pointer border-t-1 border-secondary hover:bg-gray-100 transition-colors duration-200"
                      :class="[
                        {
                          'bg-blue-100 text-blue-800': isCategorySelected(category),
                          'hover:bg-gray-100': !isCategorySelected(category)
                        },
                        optionsContentFontSize
                      ]"
                      @click="toggleCategory(category, $event)"
                    >
                      <Checkbox
                        :id="`${fieldId}-category-${category.id}`"
                        :model-value="isCategorySelected(category)"
                        @update:model-value="(checked) => handleCategoryToggle(category, checked)"
                        @click.stop
                        variant="secondary"
                      />
                      <Label 
                        :for="`${fieldId}-category-${category.id}`" 
                        class="text-sm font-light cursor-pointer flex-1"
                      >
                        {{ category.name }}
                      </Label>

                      <Icon
                      v-if="category.description"
                        icon="ri:information-2-fill"
                        width="20"
                        height="20"
                        class="text-[#003DA6]"
                        @click="showInfo(category, $event)"
                      />
                    </div>
                  </div>
                  
                  <!-- Mensaje cuando no hay opciones -->
                  <div v-if="filteredCategories.length === 0" class="px-3 py-2 text-sm text-gray-500 text-center">
                    {{ noOptionsMessage }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de información -->
    <Dialog v-model:open="showInfoModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-lg text-left font-semibold">
            {{ selectedInfoItem?.name }}
          </DialogTitle>
        </DialogHeader>
        <div class="mt-0">
          <p class="text-sm text-gray-600 leading-relaxed text-left">
            {{ selectedInfoItem?.description }}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from '@iconify/vue'

// Tipos para las discapacidades
export interface DisabilitySubcategory {
  id: string | number;
  name: string;
  description?: string;
  disabled?: boolean;
}

export interface DisabilityCategory {
  id: string | number;
  name: string;
  description?: string;
  disabled?: boolean;
  subcategories?: DisabilitySubcategory[];
}

interface Props {
  modelValue?: (string | number)[] | null;
  label?: string;
  placeholder?: string;
  placeholderClass?: string;
  placeholderFontSize?: string;
  placeholderFontStyle?: string;
  categories?: DisabilityCategory[];
  optionsContentFontSize?: string;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  fieldId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecciona las opciones que necesites",
  placeholderClass: '',
  placeholderFontSize: 'text-base',
  placeholderFontStyle: 'regular',
  optionsContentFontSize: 'text-base',
  required: false,
  searchable: false,
  searchPlaceholder: "Buscar...",
  noOptionsMessage: "No hay opciones disponibles",
  categories: () => [],
  fieldId: 'disability-selector'
});

const emit = defineEmits(["update:modelValue"]);

const showOptionsList = ref(false);
const showOptions = ref(false);
const selectedDisabilities = ref<(string | number)[]>([]);
const searchTerm = ref("");
const showInfoModal = ref(false);
const selectedInfoItem = ref<{ name: string; description: string } | null>(null);

// Función para obtener el valor de una categoría o subcategoría
const getItemValue = (item: DisabilityCategory | DisabilitySubcategory): string | number => {
  return item.id;
};

// Función para obtener el nombre de una categoría o subcategoría
const getItemName = (item: DisabilityCategory | DisabilitySubcategory): string => {
  return item.name;
};

// Función para verificar si una categoría está seleccionada
const isCategorySelected = (category: DisabilityCategory): boolean => {
  const categoryValue = getItemValue(category);
  return selectedDisabilities.value.includes(categoryValue);
};

// Función para verificar si una subcategoría está seleccionada
const isSubcategorySelected = (subcategory: DisabilitySubcategory): boolean => {
  const subcategoryValue = getItemValue(subcategory);
  return selectedDisabilities.value.includes(subcategoryValue);
};


// Función para obtener el texto de display
const getDisplayValue = (): string => {
  if (selectedDisabilities.value.length === 0) return "";
  if (selectedDisabilities.value.length === 1) {
    const item = findItemById(selectedDisabilities.value[0]);
    return item ? getItemName(item) : "";
  }
  return `${selectedDisabilities.value.length} opciones seleccionadas`;
};

// Función para encontrar un item por ID
const findItemById = (id: string | number): DisabilityCategory | DisabilitySubcategory | null => {
  for (const category of props.categories) {
    if (category.id === id) return category;
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        if (subcategory.id === id) return subcategory;
      }
    }
  }
  return null;
};

// Categorías filtradas por búsqueda
const filteredCategories = computed(() => {
  const categories = props.categories || [];
  
  if (!props.searchable || !searchTerm.value) {
    return categories;
  }
  
  return categories.filter(category => {
    const categoryName = getItemName(category).toLowerCase();
    const matchesCategory = categoryName.includes(searchTerm.value.toLowerCase());
    
    if (matchesCategory) return true;
    
    // Verificar subcategorías
    if (category.subcategories) {
      return category.subcategories.some(subcategory => 
        getItemName(subcategory).toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    }
    
    return false;
  });
});

// Inicializar valores seleccionados
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && Array.isArray(newValue)) {
      selectedDisabilities.value = [...newValue];
    } else {
      selectedDisabilities.value = [];
    }
  },
  { immediate: true }
);

// Observar cambios en las categorías para mantener la sincronización
watch(
  () => props.categories,
  (newCategories) => {
    if (selectedDisabilities.value.length > 0 && newCategories && Array.isArray(newCategories) && newCategories.length > 0) {
      // Verificar si las opciones seleccionadas aún existen
      const validSelections = selectedDisabilities.value.filter(selectedValue => 
        findItemById(selectedValue) !== null
      );
      
      if (validSelections.length !== selectedDisabilities.value.length) {
        selectedDisabilities.value = validSelections;
        emit("update:modelValue", validSelections);
      }
    }
  },
  { immediate: false, deep: false }
);

const toggleOptions = (event?: Event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  showOptions.value = !showOptions.value;

  if (!showOptions.value) {
    showOptionsList.value = false;
    searchTerm.value = "";
  }
};

const openOptionsList = (event?: Event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  showOptionsList.value = !showOptionsList.value;

  if (showOptionsList.value) {
    showOptions.value = true;
  } else {
    searchTerm.value = "";
  }
};


// Función para alternar categoría
const toggleCategory = (category: DisabilityCategory, event?: Event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (category.disabled) return;

  handleCategoryToggle(category, !isCategorySelected(category));
};

// Función para manejar el toggle de categoría
const handleCategoryToggle = (category: DisabilityCategory, checked: boolean | "indeterminate") => {
  if (category.disabled) return;

  const categoryValue = getItemValue(category);
  let newSelectedDisabilities = [...selectedDisabilities.value];

  if (checked === true) {
    if (!newSelectedDisabilities.includes(categoryValue)) {
      newSelectedDisabilities.push(categoryValue);
    }
  } else if (checked === false) {
    newSelectedDisabilities = newSelectedDisabilities.filter(item => item !== categoryValue);
  }

  selectedDisabilities.value = newSelectedDisabilities;
  emit("update:modelValue", newSelectedDisabilities);
};

// Función para alternar subcategoría
const toggleSubcategory = (subcategory: DisabilitySubcategory, event?: Event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (subcategory.disabled) return;

  handleSubcategoryToggle(subcategory, !isSubcategorySelected(subcategory));
};

// Función para manejar el toggle de subcategoría
const handleSubcategoryToggle = (subcategory: DisabilitySubcategory, checked: boolean | "indeterminate") => {
  if (subcategory.disabled) return;

  const subcategoryValue = getItemValue(subcategory);
  let newSelectedDisabilities = [...selectedDisabilities.value];

  if (checked === true) {
    if (!newSelectedDisabilities.includes(subcategoryValue)) {
      newSelectedDisabilities.push(subcategoryValue);
    }
  } else if (checked === false) {
    newSelectedDisabilities = newSelectedDisabilities.filter(item => item !== subcategoryValue);
  }

  selectedDisabilities.value = newSelectedDisabilities;
  emit("update:modelValue", newSelectedDisabilities);
};

// Función para mostrar el modal de información
const showInfo = (item: DisabilityCategory | DisabilitySubcategory, event?: Event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (item.description) {
    selectedInfoItem.value = {
      name: item.name,
      description: item.description
    };
    showInfoModal.value = true;
  }
};
</script>
