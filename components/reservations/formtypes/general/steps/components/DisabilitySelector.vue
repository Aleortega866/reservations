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
              class="bg-transparent h-10 border-0 py-1 px-2.5 transition-all duration-100 ease-in-out"
              :class="[
                showOptionsList ? 'rounded-t-[20px] rounded-b-none' : 'rounded-full',
                selectedDisabilities.length > 0 ? 'bg-white/20' : 'bg-transparent',
                props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              ]"
              @click="openOptionsList($event)"
              @submit.prevent
            >
              <CardContent class="flex items-center justify-between py-1 px-2">
                <p v-if="selectedDisabilities.length > 0" :class="[placeholderFontSize, placeholderFontStyle, placeholderClass]" class="max-w-[200px] truncate flex-1 mr-2 text-base text-[#3C3C3B] font-semibold">
                  {{ getDisplayValue() }}
                </p>
                <p v-else :class="[placeholderFontSize, placeholderFontStyle, placeholderClass]" class="opacity-60 max-w-[200px] truncate flex-1 mr-2 text-base text-[#7D7D7D] font-medium">
                  {{ placeholder }}
                </p>
                <Icon v-if="showOptionsList" icon="material-symbols:unfold-less" width="20" height="20" class="text-[#3C3C3B]" />
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

                <!-- Lista de discapacidades con niveles -->
                <div class="divide-y-2 divide-[#61A4E5]">
                  <div
                    v-for="category in filteredCategories"
                    :key="category.id"
                    class="even:bg-[#EBF4FC] odd:bg-[#D8E8F8] last:rounded-b-[20px]"
                  >
                    <!-- Si la categoría tiene subcategorías, mostrar como árbol expandido -->
                    <div v-if="category.subcategories && category.subcategories.length > 0" class="last:pb-3">
                      <!-- Título de la categoría (sin checkbox, solo informativo) -->
                      <div>
                        <div class="flex items-center">
                          <span class="text-base text-[#7D7D7D] font-semibold py-3 pl-5">{{ category.name }}</span>
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

                      <!-- Subcategorías (siempre visibles, sin desplegable) -->
                      <div class="divide-y-2 divide-[#61A4E5]">
                        <div
                          v-for="subcategory in category.subcategories"
                          :key="subcategory.id"
                          class="flex items-center space-x-3 cursor-pointer py-3.5 hover:bg-gray-100 transition-colors duration-200"
                          :class="[
                            {
                              'text-sm text-[#3C3C3B] font-medium underline pl-9 pr-2': isSubcategorySelected(subcategory),
                              'text-sm text-[#7D7D7D] font-medium hover:bg-gray-100 pl-9 pr-2': !isSubcategorySelected(subcategory)
                            },
                            optionsContentFontSize
                          ]"
                          @click="toggleSubcategory(subcategory, $event)"
                        >
                          <Checkbox
                            :id="`${fieldId}-subcategory-${subcategory.id}`"
                            :class="'rounded-full border-2'"
                            class="w-6 h-6 cursor-pointer"
                            variant="secondary"
                            :model-value="isSubcategorySelected(subcategory)"
                            @update:model-value="(checked) => handleSubcategoryToggle(subcategory, checked)"
                            @click.stop
                          />
                          <Label 
                            :for="`${fieldId}-subcategory-${subcategory.id}`" 
                            class="cursor-pointer flex-1"
                          >
                            {{ subcategory.name }}
                          </Label>
                          <Icon
                            v-if="subcategory.description"
                              icon="ri:information-2-fill"
                              width="24"
                              height="24"
                              class="text-[#003DA6]"
                              @click="showInfo(subcategory, $event)"
                            />
                        </div>
                      </div>
                    </div>

                    <!-- Si la categoría NO tiene subcategorías, mostrar solo como opción con checkbox -->
                    <div v-else
                      class="flex items-center space-x-3 cursor-pointer py-2.5 hover:bg-gray-100 transition-colors duration-200"
                      :class="[
                        {
                          'text-sm text-[#3C3C3B] font-medium underline pl-3.5 pr-2': isCategorySelected(category),
                          'text-sm text-[#7D7D7D] font-medium hover:bg-gray-100 pl-3.5 pr-2': !isCategorySelected(category)
                        },
                        optionsContentFontSize
                      ]"
                      @click="toggleCategory(category, $event)"
                    >
                      <Checkbox
                        :id="`${fieldId}-category-${category.id}`"
                        :class="'rounded-full border-2'"
                        class="w-6 h-6 cursor-pointer"
                        variant="secondary"
                        :model-value="isCategorySelected(category)"
                        @update:model-value="(checked) => handleCategoryToggle(category, checked)"
                        @click.stop
                      />
                      <Label 
                        :for="`${fieldId}-category-${category.id}`" 
                        class="cursor-pointer flex-1"
                      >
                        {{ category.name }}
                      </Label>

                      <Icon
                      v-if="category.description"
                        icon="ri:information-2-fill"
                        width="24"
                        height="24"
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
      <DialogContent class="sm:max-w-md rounded-[20px]">
        <DialogHeader>
          <DialogTitle class="text-start text-xl text-[#3C3C3B] font-semibold">
            {{ selectedInfoItem?.name }}
          </DialogTitle>
        </DialogHeader>
        <div class="mt-0">
          <p class="text-start text-lg text-[#3C3C3B] font-medium">
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
