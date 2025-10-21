import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

export const useDialogStore = defineStore('dialog', () => {

  const showDialog:Ref<boolean> = ref(false)

  const dialogTitle:Ref<string> = ref('')

  const dialogContent:Ref<string[]> = ref([])

  const setDialogTitle = (value:string): void => {
    dialogTitle.value = value
  }

  const setDialogContent = (value:string[]): void => {
    dialogContent.value = value
  }

  const toggleDialog = (value:boolean, dialogTitle:string = '', dialogContent:string[] = []):void => {
    showDialog.value = value
    setDialogTitle(dialogTitle)
    setDialogContent(dialogContent)

  }

  return {
    // Estados reactivos (solo lectura)
    showDialog: computed(() => showDialog.value),
    dialogTitle: computed(() => dialogTitle.value),
    dialogContent: computed(() => dialogContent.value),

    
    // Actions
    toggleDialog,
    setDialogTitle,
    setDialogContent
  }
}) 