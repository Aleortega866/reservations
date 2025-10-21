<template>
  <div 
    v-if="message" 
    class="p-3 rounded-md border"
    :class="alertClasses"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <Icon :icon="icon" width="16" height="16" :class="iconClasses" />
      </div>
      <div class="ml-3">
        <p class="text-sm" :class="textClasses">
          {{ message }}
        </p>
      </div>
      <div v-if="dismissible" class="ml-auto pl-3">
        <button
          @click="$emit('dismiss')"
          class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="dismissButtonClasses"
        >
          <Icon icon="lucide:x" width="12" height="12" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  message?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  message: '',
  dismissible: false
})

const emit = defineEmits(['dismiss'])

const alertClasses = computed(() => {
  const baseClasses = 'border'
  
  switch (props.type) {
    case 'success':
      return `${baseClasses} bg-green-50 border-green-200`
    case 'error':
      return `${baseClasses} bg-red-50 border-red-200`
    case 'warning':
      return `${baseClasses} bg-yellow-50 border-yellow-200`
    case 'info':
      return `${baseClasses} bg-blue-50 border-blue-200`
    default:
      return `${baseClasses} bg-gray-50 border-gray-200`
  }
})

const iconClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-400'
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'info':
      return 'text-blue-400'
    default:
      return 'text-gray-400'
  }
})

const textClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
})

const dismissButtonClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-400 hover:bg-green-100 focus:ring-green-500'
    case 'error':
      return 'text-red-400 hover:bg-red-100 focus:ring-red-500'
    case 'warning':
      return 'text-yellow-400 hover:bg-yellow-100 focus:ring-yellow-500'
    case 'info':
      return 'text-blue-400 hover:bg-blue-100 focus:ring-blue-500'
    default:
      return 'text-gray-400 hover:bg-gray-100 focus:ring-gray-500'
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'lucide:circle-check'
    case 'error':
      return 'lucide:circle-x'
    case 'warning':
      return 'lucide:triangle-alert'
    case 'info':
      return 'lucide:info'
    default:
      return 'lucide:info'
  }
})
</script> 