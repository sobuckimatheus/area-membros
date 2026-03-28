import { getCurrentUser } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createLesson(
  courseId: string,
  moduleId: string,
  formData: FormData
) {
  'use server'

  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const imageUrl = formData.get('imageUrl') as string
  const videoUrl = formData.get('videoUrl') as string
  const videoDuration = formData.get('videoDuration') as string
  const fileUrl = formData.get('fileUrl') as string
  const fileName = formData.get('fileName') as string
  const isFree = formData.get('isFree') === 'on'

  // Processar arquivos anexos adicionais
  const attachments: Array<{ name: string; url: string }> = []
  let attachmentIndex = 0
  while (formData.get(`attachment_${attachmentIndex}_url`)) {
    const attachmentUrl = formData.get(`attachment_${attachmentIndex}_url`) as string
    const attachmentName = formData.get(`attachment_${attachmentIndex}_name`) as string

    if (attachmentUrl && attachmentName) {
      attachments.push({ name: attachmentName, url: attachmentUrl })
    }
    attachmentIndex++
  }

  if (!title) {
    throw new Error('Título é obrigatório')
  }

  // Verificar se o módulo existe e pertence ao tenant
  const courseModule = await prisma.module.findFirst({
    where: {
      id: moduleId,
      courseId,
      course: {
        tenantId: user.tenantId,
      },
    },
    include: {
      lessons: {
        orderBy: { order: 'desc' },
        take: 1,
      },
    },
  })

  if (!courseModule) {
    throw new Error('Módulo não encontrado')
  }

  // Calcular a ordem da nova aula
  const nextOrder = courseModule.lessons.length > 0 ? courseModule.lessons[0].order + 1 : 1

  await prisma.lesson.create({
    data: {
      moduleId,
      title,
      description,
      content,
      type: 'VIDEO',
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      videoDuration: videoDuration ? parseInt(videoDuration) : null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      ...(attachments.length > 0 && { attachments }),
      order: nextOrder,
      isFree,
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`)
  redirect(`/admin/courses/${courseId}/modules/${moduleId}`)
}

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>
}) {
  const { id, moduleId } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const courseModule = await prisma.module.findFirst({
    where: {
      id: moduleId,
      courseId: id,
      course: {
        tenantId: user.tenantId,
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!courseModule) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href={`/admin/courses/${id}/modules/${moduleId}`}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para {courseModule.title}
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Nova Aula</h1>
        <p className="text-slate-600 mt-2">
          Adicione uma nova aula ao módulo {courseModule.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createLesson.bind(null, id, moduleId)}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="title">
                Título da Aula <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Ex: Fundamentos da Oração"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição Curta</Label>
              <Input
                id="description"
                name="description"
                placeholder="Breve descrição da aula"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">URL da Imagem Principal</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://..."
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Imagem principal do conteúdo (aparecerá no tamanho do vídeo do YouTube)
              </p>
            </div>

            <div>
              <Label htmlFor="videoUrl">URL do Vídeo</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=... ou URL de vídeo"
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                Cole o link do YouTube, Vimeo ou URL direta do vídeo
              </p>
            </div>

            <div>
              <Label htmlFor="videoDuration">Duração do Vídeo (minutos)</Label>
              <Input
                id="videoDuration"
                name="videoDuration"
                type="number"
                min="0"
                placeholder="Ex: 45"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Conteúdo da Aula</Label>
              <textarea
                id="content"
                name="content"
                rows={10}
                placeholder="Conteúdo textual da aula, materiais de apoio, transcrição, etc..."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono"
              />
              <p className="text-sm text-slate-500 mt-1">
                Você pode usar Markdown para formatar o conteúdo
              </p>
            </div>

            <div className="border-t border-slate-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                📎 Arquivo Principal da Aula
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Adicione um arquivo principal (PDF, ZIP, etc.) que os alunos poderão baixar
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fileName">Nome do Arquivo</Label>
                  <Input
                    id="fileName"
                    name="fileName"
                    placeholder="Ex: Apostila - Fundamentos.pdf"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fileUrl">URL do Arquivo</Label>
                  <Input
                    id="fileUrl"
                    name="fileUrl"
                    type="url"
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                💡 <strong>Dica:</strong> Faça upload do arquivo no{' '}
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Supabase Storage
                </a>
                {' '}(bucket: course-files) e cole a URL aqui
              </p>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                📚 Materiais Complementares (opcional)
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Adicione materiais extras como PDFs, documentos, planilhas, etc.
              </p>

              <div id="attachments-container" className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="attachment_0_name">Nome do Material</Label>
                    <Input
                      id="attachment_0_name"
                      name="attachment_0_name"
                      placeholder="Ex: Exercícios Práticos.pdf"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attachment_0_url">URL do Material</Label>
                    <Input
                      id="attachment_0_url"
                      name="attachment_0_url"
                      type="url"
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="attachment_1_name">Nome do Material 2</Label>
                    <Input
                      id="attachment_1_name"
                      name="attachment_1_name"
                      placeholder="Ex: Slides da Aula.pdf"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attachment_1_url">URL do Material 2</Label>
                    <Input
                      id="attachment_1_url"
                      name="attachment_1_url"
                      type="url"
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Os materiais complementares aparecerão para download na página da aula
              </p>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-200 pt-6">
              <input
                type="checkbox"
                id="isFree"
                name="isFree"
                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
              <Label htmlFor="isFree" className="cursor-pointer">
                Aula gratuita (preview)
              </Label>
              <p className="text-sm text-slate-500">
                Permite visualização sem estar matriculado
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Criar Aula</Button>
              <Link href={`/admin/courses/${id}/modules/${moduleId}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-sm text-blue-800">
          <strong>Dica:</strong> As aulas ficam visíveis quando o curso está
          publicado. Marque &quot;Aula gratuita&quot; para permitir preview sem matrícula.
        </CardContent>
      </Card>
    </div>
  )
}
