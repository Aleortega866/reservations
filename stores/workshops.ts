import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Workshop {
  id: string
  title: string
  description: string
  duration: string
  location: string
  type: 'video' | 'pdf' | 'image'
  contentUrl?: string
  thumbnail?: string
  timeSlots: string[]
}

export const useWorkshopsStore = defineStore('workshops', () => {
  // Datos dummy de talleres disponibles
  const availableWorkshops = ref<Workshop[]>([
    {
      id: '1',
      title: 'Taller por defecto',
      description: 'Taller dummy para cursos de verano (temporal)',
      duration: '30 min',
      location: 'Por definir',
      type: 'image',
      contentUrl: '/workshops/default.jpg',
      thumbnail: '/workshops/default-thumb.jpg',
      timeSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
    },
    {
      id: 'taller-uno',
      title: 'Taller Uno',
      description: 'Introducción a la ciencia básica',
      duration: '30 min',
      location: 'Piso uno',
      type: 'image',
      contentUrl: '/workshops/taller-uno.jpg',
      thumbnail: '/workshops/taller-uno-thumb.jpg',
      timeSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
    },
    {
      id: 'taller-dos',
      title: 'Taller Dos',
      description: 'Experimentos de química',
      duration: '45 min',
      location: 'Piso dos',
      type: 'pdf',
      contentUrl: '/workshops/taller-dos.pdf',
      thumbnail: '/workshops/taller-dos-thumb.jpg',
      timeSlots: ['10:30', '12:30', '14:30', '16:30']
    },
    {
      id: 'taller-tres',
      title: 'Taller Tres',
      description: 'Robótica educativa',
      duration: '60 min',
      location: 'Piso tres',
      type: 'video',
      contentUrl: '/workshops/taller-tres.mp4',
      thumbnail: '/workshops/taller-tres-thumb.jpg',
      timeSlots: ['09:00', '11:00', '13:00', '15:00', '17:00']
    },
    {
      id: 'taller-cuatro',
      title: 'Taller Cuatro',
      description: 'Programación para niños',
      duration: '40 min',
      location: 'Piso uno',
      type: 'pdf',
      contentUrl: '/workshops/taller-cuatro.pdf',
      thumbnail: '/workshops/taller-cuatro-thumb.jpg',
      timeSlots: ['10:15', '11:15', '12:15', '13:15', '14:15', '15:15', '16:15']
    },
    {
      id: 'taller-cinco',
      title: 'Taller Cinco',
      description: 'Astronomía básica',
      duration: '50 min',
      location: 'Piso dos',
      type: 'image',
      contentUrl: '/workshops/taller-cinco.jpg',
      thumbnail: '/workshops/taller-cinco-thumb.jpg',
      timeSlots: ['09:30', '11:30', '13:30', '15:30', '17:30']
    },
    {
      id: 'taller-seis',
      title: 'Taller Seis',
      description: 'Energías renovables',
      duration: '55 min',
      location: 'Piso tres',
      type: 'video',
      contentUrl: '/workshops/taller-seis.mp4',
      thumbnail: '/workshops/taller-seis-thumb.jpg',
      timeSlots: ['10:45', '12:45', '14:45', '16:45']
    }
  ])

  // Talleres seleccionados (datos dummy para probar)
  const selectedWorkshops = ref<string[]>([])
  
  // Horarios seleccionados por taller
  const selectedTimeSlots = ref<Record<string, string[]>>({})

  // Computed para obtener los talleres seleccionados con datos completos
  const selectedWorkshopsData = computed(() => {
    return selectedWorkshops.value
      .map(id => availableWorkshops.value.find(w => w.id === id))
      .filter(Boolean) as Workshop[]
  })

  // Función para seleccionar/deseleccionar taller
  const toggleWorkshop = (workshopId: string) => {
    const index = selectedWorkshops.value.indexOf(workshopId)
    if (index > -1) {
      selectedWorkshops.value.splice(index, 1)
      // Limpiar horarios del taller deseleccionado
      delete selectedTimeSlots.value[workshopId]
    } else {
      selectedWorkshops.value.push(workshopId)
    }
  }

  // Función para seleccionar/deseleccionar horario
  const toggleTimeSlot = (workshopId: string, time: string) => {
    if (!selectedTimeSlots.value[workshopId]) {
      selectedTimeSlots.value[workshopId] = []
    }
    
    const index = selectedTimeSlots.value[workshopId].indexOf(time)
    if (index > -1) {
      selectedTimeSlots.value[workshopId].splice(index, 1)
    } else {
      selectedTimeSlots.value[workshopId].push(time)
    }
  }

  // Función para limpiar selecciones
  const clearSelections = () => {
    selectedWorkshops.value = []
    selectedTimeSlots.value = {}
  }

  // Función para verificar si un taller está seleccionado
  const isWorkshopSelected = (workshopId: string) => {
    return selectedWorkshops.value.includes(workshopId)
  }

  // Función para verificar si un horario está seleccionado
  const isTimeSlotSelected = (workshopId: string, time: string) => {
    return selectedTimeSlots.value[workshopId]?.includes(time) || false
  }

  // Función para inicializar con el taller por defecto (dummy)
  const initializeDefaultWorkshop = () => {
    if (selectedWorkshops.value.length === 0) {
      selectedWorkshops.value = ['1']
      console.log('✅ Taller por defecto (ID: 1) inicializado automáticamente')
    }
  }

  return {
    availableWorkshops,
    selectedWorkshops,
    selectedTimeSlots,
    selectedWorkshopsData,
    toggleWorkshop,
    toggleTimeSlot,
    clearSelections,
    isWorkshopSelected,
    isTimeSlotSelected,
    initializeDefaultWorkshop
  }
}) 