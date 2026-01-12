'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'

interface DeleteCourseButtonProps {
  courseId: string
  courseName: string
  deleteAction: (courseId: string) => Promise<void>
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={pending}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {pending ? 'Deletando...' : 'Deletar Curso'}
    </Button>
  )
}

export function DeleteCourseButton({ courseId, courseName, deleteAction }: DeleteCourseButtonProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o curso "${courseName}"?\n\nEsta ação não pode ser desfeita e todos os módulos e aulas serão removidos.`
    )

    if (confirmed) {
      await deleteAction(courseId)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SubmitButton />
    </form>
  )
}
