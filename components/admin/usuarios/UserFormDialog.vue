<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle class="text-start font-medium"
          >{{ isEditing ? "Editar Usuario" : "Crear Nuevo Usuario" }}
        </DialogTitle>
      </DialogHeader>

      <Form
        @submit="handleSubmit"
        :validation-schema="validationSchema"
        :initial-values="initialFormValues"
      >
        <div class="grid gap-4 py-4">
          <!-- Nombre de usuario -->
          <FormField name="userName" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>Nombre de usuario</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Ingresa el nombre de usuario"
                  :maxlength="20"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Nombre -->
          <FormField name="name" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Ingresa el nombre"
                  :maxlength="20"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Apellido Paterno -->
          <FormField name="paternalLastName" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>Apellido Paterno</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Ingresa el apellido paterno"
                  :maxlength="20"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Apellido Materno -->
          <FormField name="maternalLastName" v-slot="{ componentField, errorMessage }">
            <FormItem>
              <FormLabel>Apellido Materno</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Ingresa el apellido materno"
                  :maxlength="20"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Correo Electrónico (solo en creación) -->
          <FormField
            v-if="!isEditing"
            name="email"
            v-slot="{ componentField, errorMessage }"
          >
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  :maxlength="50"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Contraseña (solo en creación) -->
          <FormField
            v-if="!isEditing"
            name="password"
            v-slot="{ componentField, errorMessage }"
          >
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Ingresa la contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute right-0 top-0 h-full px-3"
                    @click="showPassword = !showPassword"
                  >
                    <Icon v-if="!showPassword" icon="lucide:eye" width="16" height="16" />
                    <Icon v-else icon="lucide:eye-off" width="16" height="16" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
              <div class="text-xs text-muted-foreground mt-1">
                La contraseña debe tener al menos 8 caracteres con mayúscula, minúscula,
                número y carácter especial.
              </div>
            </FormItem>
          </FormField>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancelar
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <Icon
              v-if="isSubmitting"
              icon="lucide:loader-circle"
              width="16"
              height="16"
              class="mr-2 animate-spin"
            />
            {{ isEditing ? "Guardar Cambios" : "Crear Usuario" }}
          </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Form } from 'vee-validate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { employeeSchema, type EmployeeFormData } from '@/lib/validations/users'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'



interface Props {
  open: boolean
  isEditing?: boolean
  userData?: Partial<EmployeeFormData>
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'submit', data: EmployeeFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const isSubmitting = ref(false)

// Exponer el estado para que el componente padre pueda acceder
defineExpose({
  isSubmitting
})

// Computed para seleccionar el esquema de validación correcto
const validationSchema = computed(() => {
  if (props.isEditing) {
    // Para edición, usar un esquema que solo incluya los campos editables
    return toTypedSchema(z.object({
      userName: z
        .string()
        .min(1, 'El nombre de usuario es requerido')
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(50, 'El nombre de usuario debe tener máximo 50 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),
      name: z
        .string()
        .min(1, 'El nombre es requerido')
        .max(20, 'El nombre no puede exceder 20 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
      paternalLastName: z
        .string()
        .min(1, 'El apellido paterno es requerido')
        .max(20, 'El apellido paterno no puede exceder 20 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido paterno solo puede contener letras y espacios'),
      maternalLastName: z
        .string()
        .min(1, 'El apellido materno es requerido')
        .max(20, 'El apellido materno no puede exceder 20 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido materno solo puede contener letras y espacios')
    }))
  } else {
    // Para creación, usar el esquema completo
    return employeeSchema
  }
})

// Computed para los valores iniciales del formulario
const initialFormValues = computed(() => {
  if (!props.isEditing || !props.userData) {
    return {
      userName: '',
      name: '',
      paternalLastName: '',
      maternalLastName: '',
      email: '',
      password: ''
    }
  }

  return {
    userName: props.userData.userName || '',
    name: props.userData.name || '',
    paternalLastName: props.userData.paternalLastName || '',
    maternalLastName: props.userData.maternalLastName || '',
    email: props.userData.email || '',
    password: '' // La contraseña siempre se deja vacía en edición
  }
})

const handleSubmit = async (values: any) => {
  if (isSubmitting.value) return // Prevenir doble envío

  isSubmitting.value = true
  try {
    await emit('submit', values as EmployeeFormData)
  } finally {
    // No resetear isSubmitting aquí - el componente padre se encarga
  }
}
</script>
