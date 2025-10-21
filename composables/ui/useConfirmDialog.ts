import { ref, computed } from 'vue'

interface ConfirmDialogOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  confirmVariant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  loading: boolean
  resolve: ((value: boolean) => void) | null
}

export function useConfirmDialog() {
  const dialogState = ref<ConfirmDialogState>({
    isOpen: false,
    title: 'Confirmar acción',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    confirmVariant: 'default',
    loading: false,
    resolve: null
  })

  const showConfirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      dialogState.value = {
        isOpen: true,
        title: options.title || 'Confirmar acción',
        message: options.message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        confirmVariant: options.confirmVariant || 'default',
        loading: false,
        resolve
      }
    })
  }

  const handleConfirm = () => {
    if (dialogState.value.resolve) {
      dialogState.value.resolve(true)
      dialogState.value.isOpen = false
      dialogState.value.resolve = null
    }
  }

  const handleCancel = () => {
    if (dialogState.value.resolve) {
      dialogState.value.resolve(false)
      dialogState.value.isOpen = false
      dialogState.value.resolve = null
    }
  }

  const handleClose = () => {
    if (dialogState.value.resolve) {
      dialogState.value.resolve(false)
      dialogState.value.isOpen = false
      dialogState.value.resolve = null
    }
  }

  const setLoading = (loading: boolean) => {
    dialogState.value.loading = loading
  }

  return {
    dialogState: computed(() => dialogState.value),
    showConfirm,
    handleConfirm,
    handleCancel,
    handleClose,
    setLoading
  }
}
