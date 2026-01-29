'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function CourseSaveToast() {
  useEffect(() => {
    // Verificar se há um cookie de sucesso
    const cookies = document.cookie.split(';')
    const courseUpdated = cookies.find(c => c.trim().startsWith('course-updated='))

    if (courseUpdated) {
      // Mostrar toast de sucesso
      toast.success('Curso atualizado com sucesso!', {
        duration: 3000,
      })

      // Remover o cookie
      document.cookie = 'course-updated=; max-age=0'
    }
  }, [])

  return null
}
