'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Lesson = {
  id: string
  title: string
  order: number
}

type Module = {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

function SortableModule({
  module,
  index,
  courseId,
}: {
  module: Module
  index: number
  courseId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-slate-200 rounded-lg p-4 bg-white ${isDragging ? 'shadow-xl' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          {/* Handle de drag */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
            title="Arrastar para reordenar"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                MÓDULO {index + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mt-1">
              {module.title}
            </h3>
            {module.description && (
              <p className="text-sm text-slate-600 mt-1">{module.description}</p>
            )}
          </div>
        </div>

        <Link href={`/admin/courses/${courseId}/modules/${module.id}`}>
          <Button size="sm" variant="outline">
            Editar
          </Button>
        </Link>
      </div>

      {module.lessons.length > 0 ? (
        <div className="mt-4 space-y-2 ml-8">
          {module.lessons.map((lesson, lessonIndex) => (
            <div
              key={lesson.id}
              className="flex items-center gap-3 p-2 bg-slate-50 rounded"
            >
              <span className="text-xs font-medium text-slate-500 w-8">
                {lessonIndex + 1}
              </span>
              <span className="text-sm text-slate-900 flex-1">{lesson.title}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 mt-3 ml-8">Nenhuma aula neste módulo</p>
      )}
    </div>
  )
}

export function SortableModulesList({
  modules,
  courseId,
}: {
  modules: Module[]
  courseId: string
}) {
  const [items, setItems] = useState(modules)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(m => m.id === active.id)
    const newIndex = items.findIndex(m => m.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    // Salvar nova ordem na API
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/admin/modules/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          orderedIds: newItems.map(m => m.id),
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Reverter em caso de erro
      setItems(items)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {(saving || saved) && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium transition-all ${
          saved
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {saving ? '⏳ Salvando nova ordem...' : '✅ Ordem salva com sucesso!'}
        </div>
      )}

      <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
        <GripVertical className="h-4 w-4" />
        Arraste os módulos para reordenar
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((module, index) => (
              <SortableModule
                key={module.id}
                module={module}
                index={index}
                courseId={courseId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
