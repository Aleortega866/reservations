import { ref, readonly, computed } from 'vue'
import { documentRequestService } from '../services/form'
import { useAuth } from './auth'
import type {
  DocumentRequest,
  DocumentRequestListItem,
  CreateDocumentRequest,
  UpdateDocumentRequest
} from '../types/document-request'

export function useApiDocumentRequest() {
  const items = ref<DocumentRequestListItem[]>([])
  const current = ref<DocumentRequest | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const { user } = useAuth()

  const clearError = () => { error.value = null }
  const setError = (err: any) => { error.value = err instanceof Error ? err : new Error(String(err)) }

  const getUserModifiedId = (): number => {
    const candidate =
      (user.value && (user.value.id ?? user.value.userId ?? user.value.userID ?? user.value.UserId ?? user.value.UserID))
      ?? 1
    const parsed = Number(candidate)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }

  const getAll = async () => {
    try {
      clearError()
      loading.value = true
      items.value = await documentRequestService.getAll()
      return items.value
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getById = async (id: number) => {
    try {
      clearError()
      loading.value = true
      current.value = await documentRequestService.getById(id)
      return current.value
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const create = async (data: Omit<CreateDocumentRequest, 'userModifiedId'>) => {
    try {
      clearError()
      loading.value = true
      const id = await documentRequestService.create({ ...data, userModifiedId: getUserModifiedId() })
      await getAll()
      return id
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (data: Omit<UpdateDocumentRequest, 'userModifiedId'>) => {
    try {
      clearError()
      loading.value = true
      const result = await documentRequestService.update({ ...data, userModifiedId: getUserModifiedId() })
      await getById(data.id)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const enable = async (id: number) => {
    try {
      clearError()
      loading.value = true
      const ok = await documentRequestService.enable({ id, userModifiedId: getUserModifiedId() })
      await getAll()
      return ok
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const disable = async (id: number) => {
    try {
      clearError()
      loading.value = true
      const ok = await documentRequestService.disable({ id, userModifiedId: getUserModifiedId() })
      await getAll()
      return ok
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number) => {
    try {
      clearError()
      loading.value = true
      const ok = await documentRequestService.delete({ id, userModifiedId: getUserModifiedId() })
      items.value = items.value.filter(i => i.id !== id)
      if (current.value?.id === id) current.value = null
      return ok
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    items: readonly(items),
    current: readonly(current),
    loading: readonly(loading),
    error: readonly(error),
    hasItems: computed(() => items.value.length > 0),
    // actions
    getAll,
    getById,
    create,
    update,
    enable,
    disable,
    remove
  }
}

