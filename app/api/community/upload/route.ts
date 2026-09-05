import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth'
import { isJardimMember } from '@/lib/services/community'
import { createClient } from '@supabase/supabase-js'

/**
 * Upload de imagem para publicações da comunidade.
 * Diferente do /api/upload (admin), este permite QUALQUER membro ativo
 * do Jardim enviar foto. Reusa o bucket existente do Supabase Storage.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const member = await isJardimMember(user.id, user.tenantId)
    if (!member) {
      return NextResponse.json({ error: 'Acesso exclusivo do Jardim' }, { status: 403 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Use JPEG, PNG, WEBP ou GIF.' }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.tenantId}/community/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabase.storage
      .from('course-images')
      .upload(fileName, buffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error('Erro upload comunidade:', error)
      return NextResponse.json({ error: 'Falha ao enviar imagem' }, { status: 500 })
    }

    const { data: publicUrl } = supabase.storage.from('course-images').getPublicUrl(fileName)
    return NextResponse.json({ url: publicUrl.publicUrl })
  } catch (error: any) {
    console.error('Erro no upload da comunidade:', error)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}
