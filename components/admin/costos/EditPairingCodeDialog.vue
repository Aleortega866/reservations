<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[425px] lg:max-w-[600px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
      <DialogHeader class="text-left p-6 pb-0">
        <DialogTitle class="text-lg font-bold">Código de Vinculación</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="onSubmit" class="grid gap-4 py-4 overflow-y-auto px-3">
        <!-- Mostrar código generado tras éxito -->
        <div v-if="showSuccess" class="p-4 bg-green-100 rounded text-green-800 mb-2">
          <strong>Código de vinculación generado:</strong> {{ generatedCode }}
        </div>
        <!-- Nombre del código -->
        <FormField v-slot="{ field }" name="codeName">
          <FormItem>
            <FormLabel>Nombre del código</FormLabel>
            <FormControl>
              <Input v-bind="field" placeholder="Ingresa el nombre del código" :maxlength="40" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <!-- Costo del boleto -->
        <FormField v-slot="{ field }" name="ticketCost">
          <FormItem>
            <FormLabel>Costo del boleto</FormLabel>
            <FormControl>
              <Input v-bind="field" placeholder="$0.00" :maxlength="10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <!-- Número de boletos disponibles -->
        <FormField v-slot="{ field }" name="availableTickets">
          <FormItem>
            <FormLabel>Número de boletos para este código</FormLabel>
            <FormControl>
              <Input v-bind="field" type="number" placeholder="Ingresa el número de boletos" :maxlength="10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <!-- Periodo: dos campos de fecha -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Fecha de inicio -->
          <CalendarField v-model="startDateRef" label="Desde" name="startDate" class="w-full" />
          <!-- Fecha de fin -->
          <CalendarField v-model="endDateRef" label="Hasta el" name="endDate" class="w-full" />

        </div>
        <!-- Descripción -->
        <FormField v-slot="{ field }" name="description">
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea v-bind="field" placeholder="Este sera una descripción para el usuario, podrá visualizarlo únicamente si ingresa texto en el, si no quieres agregar ningún mensaje, deja el campo vacío. " :maxlength="50" class="min-h-[60px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <!-- Mensaje para el usuario -->
        <FormField v-slot="{ field }" name="userMessage">
          <FormItem>
            <FormLabel>Mensaje para el usuario</FormLabel>
            <FormControl>
              <Textarea v-bind="field" placeholder="Este sera un mensaje para el usuario, podrá visualizarlo únicamente si ingresa texto en el, si no quieres agregar ningún mensaje, deja el campo vacío. " :maxlength="50"
                class="min-h-[60px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <!-- Mensaje para el personal administrativo -->
        <FormField v-slot="{ field }" name="adminMessage">
          <FormItem>
            <FormLabel>Mensaje para el personal administrativo</FormLabel>
            <FormControl>
              <Textarea v-bind="field" placeholder="Este sera un mensaje para el personal administrativo, podrá visualizarlo únicamente si ingresa texto en el, si no quieres agregar ningún mensaje, deja el campo vacío. " :maxlength="50"
                class="min-h-[60px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <div class="flex flex-col gap-2 mt-4">
          <Button type="submit">
            Guardar
          </Button>
          <Button type="button" variant="outline" @click="isOpen = false">
            Cancelar
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import CalendarField from '@/components/common/CalendarField.vue'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { ref, watch } from 'vue'
import type { DateValue } from '@internationalized/date'


// Elimina imports y variables no usados

const formSchema = toTypedSchema(z.object({
  codeName: z.string().min(1, 'El nombre del código es requerido').max(40, 'Máximo 40 caracteres'),
  ticketCost: z.string().min(1, 'El costo del boleto es requerido').max(10, 'Máximo 10 dígitos').regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Solo números'),
  availableTickets: z.string().regex(/^\d*$/, 'Solo números').max(10, 'Máximo 10 dígitos').optional(),
  startDate: z.custom<DateValue>((val) => val !== undefined && typeof val === 'object' && 'toDate' in val, { message: 'La fecha de inicio es requerida' }),
  endDate: z.custom<DateValue>((val) => val !== undefined && typeof val === 'object' && 'toDate' in val, { message: 'La fecha de fin es requerida' }),
  description: z.string().max(50, 'Máximo 50 caracteres').optional(),
  userMessage: z.string().max(50, 'Máximo 50 caracteres').optional(),
  adminMessage: z.string().max(50, 'Máximo 50 caracteres').optional(),
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    codeName: '',
    ticketCost: '',
    availableTickets: '',
    // startDate y endDate eliminados para evitar error de tipo
    description: '',
    userMessage: '',
    adminMessage: '',
  },
})

const isOpen = ref(false)

const startDateRef = ref<DateValue | undefined>(undefined)
const endDateRef = ref<DateValue | undefined>(undefined)

watch(() => isOpen.value, (open) => {
  if (open) {
    startDateRef.value = form.values.startDate as DateValue | undefined
    endDateRef.value = form.values.endDate as DateValue | undefined
  }
})
  
watch(startDateRef, (newVal) => {
  if (newVal !== undefined) form.values.startDate = newVal
})
watch(endDateRef, (newVal) => {
  if (newVal !== undefined) form.values.endDate = newVal
})

// 2. Estado para el código generado y éxito
const generatedCode = ref('')
const showSuccess = ref(false)

// 3. Simular guardado y mostrar código generado
const onSubmit = form.handleSubmit(() => {

  // Simular llamada a API y respuesta exitosa
  setTimeout(() => {
    generatedCode.value = 'COP' + Math.floor(100000 + Math.random() * 900000) // Simulación
    showSuccess.value = true
    isOpen.value = false
  }, 800)
})



</script>
