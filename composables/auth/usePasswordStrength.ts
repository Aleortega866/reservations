import { computed } from 'vue'

export interface PasswordStrength {
  color: string
}

export const usePasswordStrength = (password: string) => {
  const passwordStrength = computed((): PasswordStrength[] => {
    if (!password) return []
    
    let score = 0
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ]
    
    score = checks.filter(Boolean).length
    
    if (score <= 1) {
      return [
        { color: 'bg-red-500' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' }
      ]
    } else if (score <= 2) {
      return [
        { color: 'bg-orange-500' },
        { color: 'bg-orange-500' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' }
      ]
    } else if (score <= 3) {
      return [
        { color: 'bg-yellow-500' },
        { color: 'bg-yellow-500' },
        { color: 'bg-yellow-500' },
        { color: 'bg-gray-200' },
        { color: 'bg-gray-200' }
      ]
    } else if (score <= 4) {
      return [
        { color: 'bg-blue-500' },
        { color: 'bg-blue-500' },
        { color: 'bg-blue-500' },
        { color: 'bg-blue-500' },
        { color: 'bg-gray-200' }
      ]
    } else {
      return [
        { color: 'bg-green-500' },
        { color: 'bg-green-500' },
        { color: 'bg-green-500' },
        { color: 'bg-green-500' },
        { color: 'bg-green-500' }
      ]
    }
  })

  const passwordStrengthText = computed((): string => {
    if (!password) return ''
    
    let score = 0
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ]
    
    score = checks.filter(Boolean).length
    
    if (score <= 1) return 'Muy débil'
    if (score <= 2) return 'Débil'
    if (score <= 3) return 'Media'
    if (score <= 4) return 'Fuerte'
    return 'Muy fuerte'
  })

  const passwordScore = computed((): number => {
    if (!password) return 0
    
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ]
    
    return checks.filter(Boolean).length
  })

  return {
    passwordStrength,
    passwordStrengthText,
    passwordScore
  }
} 