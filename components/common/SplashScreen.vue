<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'

const props = defineProps<{ dialogTitle:string, showDialog:boolean, dialogContent:string[] }>()

const emit = defineEmits(['handleDialog'])

const dialogTitleRef:Ref<string> = ref('')
const showDialogRef:Ref<boolean> = ref(false)
const dialogContentRef:Ref<string[]> = ref([])

watch(() => [props.dialogTitle, props.showDialog, props.dialogContent], ([dialogTitleNewValue, showDialogNewValue, dialogContentNewValue]) => {
  dialogTitleRef.value = dialogTitleNewValue as string
  showDialogRef.value = showDialogNewValue as boolean
  dialogContentRef.value = dialogContentNewValue as string[]
}, { immediate: true })

</script>

<template>
    <!-- Modal de splash screen -->
    <DialogRoot v-model:open="showDialogRef" @update:open="(value) => $emit('handleDialog', value)" >
      <DialogPortal>
        <DialogOverlay class="w-full h-full flex items-center justify-center bg-[#1D1D1DD9] data-[state=open]:animate-overlayShow fixed inset-0 z-[999]">
          <DialogContent data-slot="dialog-content" class="sm:max-w-md bg-transparent border-none data-[state=open]:animate-contentShow focus:outline-none px-10 z-[999]">
            <DialogTitle class="text-3xl font-semibold text-white text-center uppercase">{{ dialogTitleRef }}</DialogTitle>
            <div v-if="dialogContentRef.length > 0" class="flex flex-col gap-y-8 text-lg font-semibold text-white text-center mt-5">
              <p v-for="content in dialogContentRef" class="whitespace-pre-line">{{ content }}</p>
            </div>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </DialogRoot>
</template>