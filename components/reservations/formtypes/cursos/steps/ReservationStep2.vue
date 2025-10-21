<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Contenido específico para Reservación Escolar -->
    <div v-if="type === 'escolar'" class="space-y-4">
      <div class="space-y-2">
        <h3 class="font-medium">Vincula tu visita</h3>
        <div class="flex items-center space-x-2">
          <Icon
            icon="ri:information-2-fill"
            width="52"
            height="52"
            class="text-muted-foreground"
          />
          <p class="text-xs text-muted-foreground">
            Para mejorar tu experiencia en tu visita al museo te recomendaremos 
            rutas y material didáctico con base en tu selección de conceptos 
            económicos principales y secundarios.
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-sm font-medium mb-1">Conceptos económicos principales</h3>
        <Select :model-value="schoolData.mainConcepts" @update:model-value="updateSchoolData({ mainConcepts: $event })" multiple>
          <SelectTrigger class="bg-muted border-0 w-full">
            <SelectValue placeholder="Selecciona una o más opciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="concept in reservationOptions.economicConcepts" 
              :key="concept.value" 
              :value="concept.value"
            >
              {{ concept.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <h3 class="text-sm font-medium mb-1">Conceptos económicos secundarios</h3>
        <Select :model-value="schoolData.secondaryConcepts" @update:model-value="updateSchoolData({ secondaryConcepts: $event })" multiple>
          <SelectTrigger class="bg-muted border-0 w-full">
            <SelectValue placeholder="Selecciona una o más opciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="concept in reservationOptions.economicConcepts" 
              :key="concept.value" 
              :value="concept.value"
            >
              {{ concept.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label class="text-sm font-medium">Datos del representante de la visita</Label>

          <div class="flex items-center space-x-2">
            <Icon
              icon="ri:information-2-fill"
              width="52"
              height="52"
              class="text-muted-foreground"
            />
            <p class="text-xs text-muted-foreground">
              Para confirmar su visita y garantizar una comunicación efectiva, 
              proporciona tus datos de contacto. Esto permitirá enviar la 
              confirmación y asegurar una experiencia fluida.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">¿La persona que realiza la reserva también es responsable de la visita?</Label>
          <div class="flex space-x-8">
            <div class="flex items-center space-x-2">
              <Checkbox id="school-same-person-yes" :model-value="schoolData.samePersonResponsible" @update:model-value="updateSchoolData({ samePersonResponsible: $event })" :value="true" />
              <Label for="school-same-person-yes" class="text-sm">Sí</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="school-same-person-no" :model-value="schoolData.samePersonResponsible" @update:model-value="updateSchoolData({ samePersonResponsible: $event })" :value="false" />
              <Label for="school-same-person-no" class="text-sm">No</Label>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Icon
              icon="ri:information-2-fill"
              width="36"
              height="36"
              class="text-muted-foreground"
            />
            <p class="text-xs text-muted-foreground">
              Recuerda que puedes cambiar al representante de la visita aunque otra persona este generando la reserva.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Nombre completo del representante</Label>
          <Input :model-value="schoolData.representativeName" @update:model-value="updateSchoolData({ representativeName: $event })" placeholder="Nombre completo" class="bg-muted border-0" />
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Correo electrónico del representante</Label>
          <Input :model-value="schoolData.representativeEmail" @update:model-value="updateSchoolData({ representativeEmail: $event })" type="email" placeholder="correo@correo.com" class="bg-muted border-0" />
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Teléfono del representante a 10 dígitos</Label>
          <Input :model-value="schoolData.representativePhone" @update:model-value="updateSchoolData({ representativePhone: $event })" placeholder="10 dígitos" class="bg-muted border-0" />
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">¿De dónde nos visitas?</Label>
          <Select :model-value="schoolData.municipality" @update:model-value="updateSchoolData({ municipality: $event })">
            <SelectTrigger class="bg-muted border-0 w-full">
              <SelectValue placeholder="Selecciona tu Municipio/Delegación/Alcaldía" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="municipality in reservationOptions.municipalities" 
                :key="municipality.value" 
                :value="municipality.value"
              >
                {{ municipality.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">¿Alguna de las personas que te acompañan, o tú, tiene una condición que requiere asistencia o apoyo especial durante la visita?</Label>
          <p class="text-xs text-muted-foreground">
            En caso afirmativo, selecciona la opción correspondiente
          </p>
          <Select :model-value="schoolData.specialNeeds" @update:model-value="updateSchoolData({ specialNeeds: $event })">
            <SelectTrigger class="bg-muted border-0 w-full">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="need in reservationOptions.specialNeeds" 
                :key="need.value" 
                :value="need.value"
              >
                {{ need.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>

    <!-- Contenido específico para Reservación Empresarial -->
    <div v-if="type === 'business'" class="space-y-4">
      <h3 class="text-sm font-medium mb-1">Conceptos económicos principales</h3>
      <Select :model-value="businessData.mainConcepts" @update:model-value="updateBusinessData({ mainConcepts: $event })" multiple>
        <SelectTrigger class="bg-muted border-0">
          <SelectValue placeholder="Selecciona una o más opciones" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem 
            v-for="concept in reservationOptions.economicConcepts" 
            :key="concept.value" 
            :value="concept.value"
          >
            {{ concept.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <h3 class="text-sm font-medium mb-1">Conceptos económicos secundarios</h3>
      <Select :model-value="businessData.secondaryConcepts" @update:model-value="updateBusinessData({ secondaryConcepts: $event })" multiple>
        <SelectTrigger class="bg-muted border-0">
          <SelectValue placeholder="Selecciona una o más opciones" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem 
            v-for="concept in reservationOptions.economicConcepts" 
            :key="concept.value" 
            :value="concept.value"
          >
            {{ concept.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label class="text-sm font-medium">Datos del representante de la visita</Label>

          <div class="flex items-center space-x-2">
            <Icon
              icon="ri:information-2-fill"
              width="52"
              height="52"
              class="text-muted-foreground"
            />
            <p class="text-xs text-muted-foreground">
              Para confirmar su visita y garantizar una comunicación efectiva, 
              proporciona tus datos de contacto. Esto permitirá enviar la 
              confirmación y asegurar una experiencia fluida.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">¿La persona que realiza la reserva también es responsable de la visita?</Label>
          <div class="flex space-x-8">
            <div class="flex items-center space-x-2">
              <Checkbox id="business-same-person-yes" :model-value="businessData.samePersonResponsible" @update:model-value="updateBusinessData({ samePersonResponsible: $event })" :value="true" />
              <Label for="business-same-person-yes" class="text-sm">Sí</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Checkbox id="business-same-person-no" :model-value="businessData.samePersonResponsible" @update:model-value="updateBusinessData({ samePersonResponsible: $event })" :value="false" />
              <Label for="business-same-person-no" class="text-sm">No</Label>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Icon
              icon="ri:information-2-fill"
              width="36"
              height="36"
              class="text-muted-foreground"
            />
            <p class="text-xs text-muted-foreground">
              Recuerda que puedes cambiar al representante de la visita aunque otra persona este generando la reserva.
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Nombre completo del representante</Label>
          <Input :model-value="businessData.representativeName" @update:model-value="updateBusinessData({ representativeName: $event })" placeholder="Nombre completo" class="bg-muted border-0" />
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Correo electrónico del representante</Label>
          <Input :model-value="businessData.representativeEmail" @update:model-value="updateBusinessData({ representativeEmail: $event })" type="email" placeholder="correo@correo.com" class="bg-muted border-0" />
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Teléfono del representante a 10 dígitos</Label>
          <Input :model-value="businessData.representativePhone" @update:model-value="updateBusinessData({ representativePhone: $event })" placeholder="10 dígitos" class="bg-muted border-0" />
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">¿De dónde nos visitas?</Label>
          <Select :model-value="businessData.municipality" @update:model-value="updateBusinessData({ municipality: $event })">
            <SelectTrigger class="bg-muted border-0">
              <SelectValue placeholder="Selecciona tu Municipio/Delegación/Alcaldía" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="municipality in reservationOptions.municipalities" 
                :key="municipality.value" 
                :value="municipality.value"
              >
                {{ municipality.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">¿Alguna de las personas que te acompañan, o tú, tiene una condición que requiere asistencia o apoyo especial durante la visita?</Label>
          <p class="text-xs text-muted-foreground">
            En caso afirmativo, selecciona la opción correspondiente
          </p>
          <Select :model-value="businessData.specialNeeds" @update:model-value="updateBusinessData({ specialNeeds: $event })">
            <SelectTrigger class="bg-muted border-0">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="need in reservationOptions.specialNeeds" 
                :key="need.value" 
                :value="need.value"
              >
                {{ need.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>


      </div>
    </div>

    <!-- Contenido específico para Curso de Verano -->
    <div v-if="type === 'summer'" class="space-y-4">
      <div class="space-y-2">
        <Label class="text-sm font-medium">Datos del representante de la visita</Label>
        <p class="text-xs text-muted-foreground">
          Para confirmar su visita y garantizar una comunicación efectiva, 
          proporciona tus datos de contacto.
        </p>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">¿La persona que realiza la reserva también es responsable de la visita?</Label>
        <div class="flex space-x-4">
          <div class="flex items-center space-x-2">
            <input type="radio" id="summer-same-yes" :checked="summerData.samePersonResponsible === 'yes'" @change="updateSummerData({ samePersonResponsible: 'yes' })" value="yes" />
            <Label for="summer-same-yes" class="text-sm">Sí</Label>
          </div>
          <div class="flex items-center space-x-2">
            <input type="radio" id="summer-same-no" :checked="summerData.samePersonResponsible === 'no'" @change="updateSummerData({ samePersonResponsible: 'no' })" value="no" />
            <Label for="summer-same-no" class="text-sm">No</Label>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">Nombre completo del representante</Label>
        <Input :model-value="summerData.representativeName" @update:model-value="updateSummerData({ representativeName: $event })" placeholder="Nombre y apellidos" class="bg-muted border-0" />
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">Correo electrónico del representante</Label>
        <Input :model-value="summerData.representativeEmail" @update:model-value="updateSummerData({ representativeEmail: $event })" type="email" placeholder="correo@correo.com" class="bg-muted border-0" />
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">Teléfono del representante a 10 dígitos</Label>
        <Input :model-value="summerData.representativePhone" @update:model-value="updateSummerData({ representativePhone: $event })" placeholder="00 0000 - 0000" class="bg-muted border-0" />
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">¿De dónde nos visitas?</Label>
        <Select :model-value="summerData.municipality" @update:model-value="updateSummerData({ municipality: $event })">
          <SelectTrigger class="bg-muted border-0">
            <SelectValue placeholder="Selecciona tu Municipio/Delegación/Alcaldía" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="municipality in reservationOptions.municipalities" 
              :key="municipality.value" 
              :value="municipality.value"
            >
              {{ municipality.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium">¿Alguna de las personas que te acompañan, o tú, tiene una condición que requiere asistencia o apoyo especial durante la visita?</Label>
        <p class="text-xs text-muted-foreground">
          En caso afirmativo, selecciona la opción correspondiente
        </p>
        <Select :model-value="summerData.specialNeeds" @update:model-value="updateSummerData({ specialNeeds: $event })">
          <SelectTrigger class="bg-muted border-0">
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="need in reservationOptions.specialNeeds" 
              :key="need.value" 
              :value="need.value"
            >
              {{ need.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>



    <div class="flex space-x-2">
      <Button type="button" @click="$emit('back')" variant="outline" class="flex-1">
        Anterior
      </Button>
      <Button type="submit" class="flex-1 bg-primary hover:bg-primary/90">
        Continuar
      </Button>
    </div>
  </form>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import ReservationStepHeader from '@/components/reservations/ReservationStepHeader.vue'
import { Icon } from "@iconify/vue";
import { watch, onMounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  businessData: {
    type: Object,
    required: true
  },
  summerData: {
    type: Object,
    required: true
  },
  schoolData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['next', 'back', 'submit', 'update:schoolData', 'update:businessData', 'update:summerData'])

// Función para actualizar datos
const updateSchoolData = (updates) => {
  emit('update:schoolData', { ...props.schoolData, ...updates })
}

const updateBusinessData = (updates) => {
  emit('update:businessData', { ...props.businessData, ...updates })
}

const updateSummerData = (updates) => {
  emit('update:summerData', { ...props.summerData, ...updates })
}

// Datos JSON para los selects
const reservationOptions = {
  economicConcepts: [
    { value: 'escasez', label: 'Escasez' },
    { value: 'costo-oportunidad', label: 'Costo de oportunidad' },
    { value: 'factores-produccion', label: 'Factores de producción: tierra, trabajo y capital' },
    { value: 'asignacion-recursos', label: 'Asignación de recursos' },
    { value: 'intercambio', label: 'Intercambio' },
    { value: 'mercado-competencia', label: 'Mercado de competencia' },
    { value: 'exportaciones', label: 'Exportaciones' }
  ],
  municipalities: [
    { value: 'alvaro-obregon', label: 'Álvaro Obregón' },
    { value: 'azcapotzalco', label: 'Azcapotzalco' },
    { value: 'benito-juarez', label: 'Benito Juárez' },
    { value: 'coyoacan', label: 'Coyoacán' },
    { value: 'cuajimalpa', label: 'Cuajimalpa de Morelos' },
    { value: 'cuauhtemoc', label: 'Cuauhtémoc' },
    { value: 'gustavo-madero', label: 'Gustavo A. Madero' },
    { value: 'iztacalco', label: 'Iztacalco' },
    { value: 'iztapalapa', label: 'Iztapalapa' },
    { value: 'magdalena-contreras', label: 'La Magdalena Contreras' },
    { value: 'miguel-hidalgo', label: 'Miguel Hidalgo' },
    { value: 'milpa-alta', label: 'Milpa Alta' },
    { value: 'tlahuac', label: 'Tláhuac' },
    { value: 'tlalpan', label: 'Tlalpan' },
    { value: 'venustiano-carranza', label: 'Venustiano Carranza' },
    { value: 'xochimilco', label: 'Xochimilco' },
    { value: 'otro', label: 'Otro' }
  ],
  specialNeeds: [
    { value: 'movilidad-reducida', label: 'Movilidad reducida' },
    { value: 'discapacidad-visual', label: 'Discapacidad visual' },
    { value: 'discapacidad-auditiva', label: 'Discapacidad auditiva' },
    { value: 'discapacidad-cognitiva', label: 'Discapacidad cognitiva' },
    { value: 'sindrome-down', label: 'Asistió con una persona con síndrome de Down' },
    { value: 'tdah', label: 'Asistió con una persona con Trastorno de Déficit de Atención e Hiperactividad (TDAH)' },
    { value: 'condiciones-salud', label: 'Condiciones de salud - Persona que necesite consumir agua o alimento mínimo por motivos de salud' },
    { value: 'otro', label: 'Otro' }
  ],
  schoolLevels: [
    { value: 'preescolar', label: 'Preescolar' },
    { value: 'primaria', label: 'Primaria' },
    { value: 'secundaria', label: 'Secundaria' },
    { value: 'media-superior', label: 'Media Superior' },
    { value: 'superior', label: 'Superior' },
    { value: 'posgrado', label: 'Posgrado' }
  ]
}

// Función para manejar el envío del formulario
const handleSubmit = () => {
  // Imprimir valores actuales en consola
  console.log('=== VALORES DEL FORMULARIO ===')
  console.log('Tipo de reservación:', props.type)
  console.log('Datos generales:', props.data)
  
  if (props.type === 'escolar') {
    console.log('Datos escolares:', props.schoolData)
  } else if (props.type === 'empresarial') {
    console.log('Datos empresariales:', props.businessData)
  } else if (props.type === 'curso-verano') {
    console.log('Datos de curso de verano:', props.summerData)
  }
  console.log('==============================')

  // Validar campos según el tipo de reservación
  let isValid = true
  const errors = []

  if (props.type === 'escolar') {
    if (!props.schoolData.mainConcepts || props.schoolData.mainConcepts.length === 0) {
      errors.push('Debes seleccionar al menos un concepto económico principal')
      isValid = false
    }
    if (!props.schoolData.secondaryConcepts || props.schoolData.secondaryConcepts.length === 0) {
      errors.push('Debes seleccionar al menos un concepto económico secundario')
      isValid = false
    }
    if (!props.schoolData.representativeName?.trim()) {
      errors.push('El nombre del representante es requerido')
      isValid = false
    }
    if (!props.schoolData.representativeEmail?.trim()) {
      errors.push('El correo electrónico del representante es requerido')
      isValid = false
    }
    if (!props.schoolData.representativePhone?.trim()) {
      errors.push('El teléfono del representante es requerido')
      isValid = false
    }
    if (!props.schoolData.municipality) {
      errors.push('Debes seleccionar tu municipio/delegación')
      isValid = false
    }
  }

  if (props.type === 'empresarial') {
    if (!props.businessData.representativeName?.trim()) {
      errors.push('El nombre del representante es requerido')
      isValid = false
    }
    if (!props.businessData.representativeEmail?.trim()) {
      errors.push('El correo electrónico del representante es requerido')
      isValid = false
    }
    if (!props.businessData.representativePhone?.trim()) {
      errors.push('El teléfono del representante es requerido')
      isValid = false
    }
    if (!props.businessData.municipality) {
      errors.push('Debes seleccionar tu municipio/delegación')
      isValid = false
    }
    if (!props.businessData.mainConcepts || props.businessData.mainConcepts.length === 0) {
      errors.push('Debes seleccionar al menos un concepto económico principal')
      isValid = false
    }
    if (!props.businessData.secondaryConcepts || props.businessData.secondaryConcepts.length === 0) {
      errors.push('Debes seleccionar al menos un concepto económico secundario')
      isValid = false
    }
  }

  if (props.type === 'curso-verano') {
    if (!props.summerData.representativeName?.trim()) {
      errors.push('El nombre del representante es requerido')
      isValid = false
    }
    if (!props.summerData.representativeEmail?.trim()) {
      errors.push('El correo electrónico del representante es requerido')
      isValid = false
    }
    if (!props.summerData.representativePhone?.trim()) {
      errors.push('El teléfono del representante es requerido')
      isValid = false
    }
    if (!props.summerData.municipality) {
      errors.push('Debes seleccionar tu municipio/delegación')
      isValid = false
    }
  }

  if (isValid) {
    console.log('✅ Formulario válido - Continuando al siguiente paso')
    // Emitir evento con los datos del formulario
    emit('submit', {
      type: props.type,
      data: props.data,
      businessData: props.businessData,
      summerData: props.summerData,
      schoolData: props.schoolData
    })
    // También emitir el evento next para continuar al siguiente paso
    emit('next')
  } else {
    // Mostrar errores en consola y alert
    console.error('❌ ERRORES DE VALIDACIÓN:')
    errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}`)
    })
    console.error('========================')
    alert('❌ Por favor corrige los siguientes errores:\n\n' + errors.join('\n'))
  }
}
</script> 