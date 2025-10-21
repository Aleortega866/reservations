<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle class="text-lg text-left font-bold">
          {{ isEdit ? 'Editar solicitud de documento' : 'Nueva solicitud de documento' }}
        </DialogTitle>
      </DialogHeader>

      <form  @submit.prevent.stop="onSubmit"  class="grid gap-4 py-4" :class="{ 'pointer-events-none': loading }">
        <div class="grid gap-2">
          <Label for="title">Título del documento</Label>
          <Input id="title" v-model="localForm.title" placeholder="Ej. INE, Constancia Fiscal" />
          <p v-if="errors.title" class="text-sm text-destructive">{{ errors.title }}</p>
        </div>

        <DropdownContent :show-options="showOptions" :dropdowntitleclass="['text-sm font-medium mb-1']" :dropdownplaceholderclass="[localForm.formTypeIds.length > 0 ? 'bg-input-filled' : 'bg-input-empty']" :dropdownerrorsclass="['text-sm text-destructive']" @toggle-options-from-child="toggleOptions">
          <template #dropdowntitle>Formularios asignados</template>
          <template #dropdownplaceholder>
            <p class="text-xs" :class="localForm.formTypeIds.length > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'">
              {{ localForm.formTypeIds.length > 0
                ? getSelectedFormTypeNames()
                : 'Selecciona el o los formularios que iran asignados' }}
            </p>
          </template>
          <template #dropdowncontent>
            <div v-for="(ft, index) in formTypes" :key="`form-${ft.id}`"
              class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors overflow-hidden"
              :class="[
                index === formTypes.length - 1 ? 'rounded-b-md' : 'rounded-none',
                index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]'
              ]" @click.stop>

              <div class="flex items-center justify-between space-x-4 overflow-hidden">
                <div class="flex items-center space-x-4 overflow-hidden">
                  <Checkbox variant="secondary" :id="`form-${ft.id}`"
                    :model-value="localForm.formTypeIds.includes(ft.id)"
                    @update:model-value="(checked: boolean | 'indeterminate') => toggleFormType(ft.id, checked === true)" />
                  <label :for="`form-${ft.id}`"
                    class="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    @click.stop>
                    {{ ft.description }}
                  </label>
                </div>
              </div>
            </div>
          </template>
          <template #dropdownerrors>
            <span v-if="errors.formTypeIds">{{ errors.formTypeIds }}</span>
          </template>
        </DropdownContent>

        <div class="space-y-0 mt-1 overflow-hidden" v-auto-animate="{ duration: 200, easing: 'ease-out' }"
          :class="showFormats ? 'rounded-t-md' : 'rounded-md'">
          <div class="flex items-center justify-between cursor-pointer" @click="toggleFormats">
            <p class="text-sm font-medium mb-1">Formatos aceptados</p>
          </div>

          <div class="relative overflow-hidden">
            <Card class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors px-3 py-2"
              @click="toggleFormats" :class="[
                showFormats ? 'rounded-t-xl rounded-b-none' : 'rounded-full',
                localForm.formats.length > 0 ? 'bg-input-filled' : 'bg-input-empty'
              ]">
              <CardContent class="flex items-center justify-between py-1 px-2">
                <p class="text-xs" :class="localForm.formats.length > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'">
                  {{ localForm.formats.length > 0
                    ? getSelectedFormatNames()
                    : 'Selecciona el o los formatos permitidos' }}
                </p>
                <Icon v-if="showFormats" icon="lucide:chevrons-down-up" width="16" height="16" class="text-muted-foreground" />
                <Icon v-else icon="lucide:chevrons-up-down" width="16" height="16" class="text-muted-foreground" />
              </CardContent>
            </Card>
          </div>


          <div v-if="showFormats" class="max-h-auto overflow-hidden"
            v-auto-animate="{ duration: 150, easing: 'ease-in-out' }">
            <div v-for="(fmt, index) in availableFormats" :key="`format-${fmt.value}`"
              class="p-2 border border-secondary/80 border-x-0 border-b-0 border-t-1 hover:bg-muted/50 transition-colors overflow-hidden"
              :class="[
                index === availableFormats.length - 1 ? 'rounded-b-md' : 'rounded-none',
                index % 2 === 0 ? 'bg-[#D8E8F8]' : 'bg-[#EBF4FC]'
              ]" @click.stop>

              <div class="flex items-center justify-between space-x-4 overflow-hidden">
                <div class="flex items-center space-x-4 overflow-hidden">
                  <Checkbox variant="secondary" :id="`format-${fmt.value}`"
                    :model-value="localForm.formats.includes(fmt.value)"
                    @update:model-value="(checked: boolean | 'indeterminate') => toggleFormat(fmt.value, checked === true)" />
                  <label :for="`format-${fmt.value}`"
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    @click.stop>
                    {{ fmt.label }}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <p v-if="errors.formats" class="text-sm text-destructive">{{ errors.formats }}</p>
        </div>

        <div v-if="error" class="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p class="text-destructive text-sm">{{ error }}</p>
        </div>

        <DialogFooter class="mt-3">
          <Button type="button" variant="outline" @click="isOpen = false" :disabled="loading">Cancelar</Button>
          <Button 
            type="submit" 
            :disabled="loading || isSubmitting"
          >
            <Icon v-if="loading" icon="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Guardar') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref, onMounted } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useFormTypes } from '@/composables/catalog/useFormTypes'
import type { DocumentFormatType } from '@/lib/api/types/document-request'
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import { Icon } from '@iconify/vue'
import { Card, CardContent } from '@/components/ui/card'

import DropdownContent from '@/components/common/DropdownContent.vue'

const props = defineProps<{
  open: boolean,
  value?: { id?: number; title: string; formTypeIds: number[]; formats: DocumentFormatType[] } | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })
const isEdit = computed(() => !!(props.value && props.value.id))
const loading = ref(false)
const error = ref<string | null>(null)
const isSubmitting = ref(false)

const showOptions = ref(false);
const showFormats = ref(false);

const { formTypes, loadFormTypes } = useFormTypes()

onMounted(async () => {
  await loadFormTypes()
  console.log('Loaded formTypes:', formTypes.value)
})

const availableFormats = [
  { label: 'PDF', value: 1 as DocumentFormatType },
  { label: 'PNG', value: 2 as DocumentFormatType },
  { label: 'JPEG', value: 3 as DocumentFormatType },
  { label: 'GIF', value: 4 as DocumentFormatType },
]

const localForm = reactive<{ title: string; formTypeIds: number[]; formats: DocumentFormatType[] }>(
  {
    title: props.value?.title || '',
    formTypeIds: props.value?.formTypeIds ? [...props.value.formTypeIds] : [],
    formats: props.value?.formats ? [...props.value.formats] : []
  }
)

console.log('Initial localForm.formTypeIds:', [...localForm.formTypeIds])

watch(() => props.value, (val) => {
  console.log('Props changed:', val)
  localForm.title = val?.title || ''
  localForm.formTypeIds = val?.formTypeIds ? [...val.formTypeIds] : []
  localForm.formats = val?.formats ? [...val.formats] : []
  console.log('Updated localForm.formTypeIds:', [...localForm.formTypeIds])
})

// Resetear estado cuando se cierre el diálogo
watch(isOpen, (newValue) => {
  if (!newValue) {
    loading.value = false
    isSubmitting.value = false
    error.value = null
  }
})

const errors = reactive<{ title?: string; formTypeIds?: string; formats?: string }>({})

const validate = () => {
  errors.title = localForm.title.trim() ? '' : 'El título es requerido'
  errors.formTypeIds = localForm.formTypeIds.length ? '' : 'Selecciona al menos un formulario'
  errors.formats = localForm.formats.length ? '' : 'Selecciona al menos un formato'
  return !errors.title && !errors.formTypeIds && !errors.formats
}



const emit = defineEmits<{
  (e: 'save', payload: { title: string; formTypeIds: number[]; formats: DocumentFormatType[] }): Promise<void>
}>()

const onSubmit = async () => {
  // Prevenir múltiples ejecuciones
  if (loading.value || isSubmitting.value) return
  
  if (!validate()) return
  
  loading.value = true
  isSubmitting.value = true
  error.value = null
  
  try {
    await emit('save', { title: localForm.title.trim(), formTypeIds: [...localForm.formTypeIds], formats: [...localForm.formats] })
    isOpen.value = false
  } catch (err: any) {
    error.value = err?.message || 'Error al guardar'
  } finally {
    loading.value = false
    isSubmitting.value = false
  }
}

const toggleOptions = () => {
  showOptions.value = !showOptions.value;
  if (showOptions.value) {
    console.log('Opening form types list, current formTypeIds:', [...localForm.formTypeIds])
  }
};

const toggleFormats = () => {
  showFormats.value = !showFormats.value;
};

const toggleFormType = (formTypeId: number, checked: boolean) => {
  console.log('toggleFormType called with:', { formTypeId, checked })
  console.log('Current formTypeIds before:', [...localForm.formTypeIds])

  if (checked) {
    if (!localForm.formTypeIds.includes(formTypeId)) {
      localForm.formTypeIds.push(formTypeId)
      console.log('Added formTypeId:', formTypeId)
    } else {
      console.log('formTypeId already exists:', formTypeId)
    }
  } else {
    const index = localForm.formTypeIds.indexOf(formTypeId)
    if (index > -1) {
      localForm.formTypeIds.splice(index, 1)
      console.log('Removed formTypeId:', formTypeId)
    } else {
      console.log('formTypeId not found to remove:', formTypeId)
    }
  }

  console.log('FormTypeIds after toggle:', [...localForm.formTypeIds])
  console.log('localForm object:', localForm)
};

const toggleFormat = (formatValue: DocumentFormatType, checked: boolean) => {
  if (checked) {
    if (!localForm.formats.includes(formatValue)) {
      localForm.formats.push(formatValue)
    }
  } else {
    const index = localForm.formats.indexOf(formatValue)
    if (index > -1) {
      localForm.formats.splice(index, 1)
    }
  }
  console.log('Formats after toggle:', [...localForm.formats])
};

const getSelectedFormTypeNames = () => {
  if (localForm.formTypeIds.length === 0) return ''
  
  const selectedFormTypes = formTypes.value.filter((ft: any) => localForm.formTypeIds.includes(ft.id))
  const names = selectedFormTypes.map((ft: any) => ft.description)
  
  if (names.length <= 3) {
    return names.join(', ')
  } else {
    const firstThree = names.slice(0, 3).join(', ')
    const remaining = names.length - 3
    return `${firstThree} y ${remaining} más`
  }
}

const getSelectedFormatNames = () => {
  if (localForm.formats.length === 0) return ''
  
  const selectedFormats = availableFormats.filter(fmt => localForm.formats.includes(fmt.value))
  const names = selectedFormats.map(fmt => fmt.label)
  
  if (names.length <= 3) {
    return names.join(', ')
  } else {
    const firstThree = names.slice(0, 3).join(', ')
    const remaining = names.length - 3
    return `${firstThree} y ${remaining} más`
  }
}


</script>
