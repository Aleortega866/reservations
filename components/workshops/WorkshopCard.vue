<template>
  <Card class="pt-1 cursor-pointer hover:shadow-md transition-shadow" @click="$emit('click')">
    <CardContent class="p-4" v-auto-animate>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium">{{ title }}</h3>
        <button 
          v-if="expandable" 
          @click.stop="toggleExpanded"
          class="p-1 hover:bg-muted rounded transition-colors"
        >
          <Icon v-if="isExpanded" icon="lucide:chevron-down" width="20" height="20" class="text-muted-foreground transition-transform" />
          <Icon v-else icon="lucide:chevron-right" width="20" height="20" class="text-muted-foreground transition-transform" />
        </button>
        <ChevronRight v-else class="w-4 h-4 text-muted-foreground" />
      </div>
      
      <slot name="media"></slot>

      <Transition
        name="slide-fade"
        mode="out-in"
      >
        <div v-if="!expandable || isExpanded" class="space-y-2">
          <slot></slot>
        </div>
      </Transition>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  expandable: {
    type: Boolean,
    default: false
  },
  expanded: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const isExpanded = ref(props.expanded)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style> 