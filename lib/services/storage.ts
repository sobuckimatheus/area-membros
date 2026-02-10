import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BUCKET_NAME = 'course-files'

/**
 * Faz upload de um arquivo para o Supabase Storage
 * @param file - Arquivo a ser enviado
 * @param folder - Pasta onde será salvo (ex: 'lessons', 'courses')
 * @returns URL pública do arquivo ou null se falhar
 */
export async function uploadFile(
  file: File,
  folder: string = 'lessons'
): Promise<{ url: string; path: string } | null> {
  try {
    // Criar nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExt}`

    // Fazer upload
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Erro ao fazer upload do arquivo:', error)
      return null
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error('Erro ao processar upload:', error)
    return null
  }
}

/**
 * Deleta um arquivo do Supabase Storage
 * @param path - Caminho do arquivo no storage
 * @returns true se deletado com sucesso, false caso contrário
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('Erro ao deletar arquivo:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao processar deleção:', error)
    return false
  }
}

/**
 * Inicializa o bucket no Supabase (rodar uma vez apenas)
 * Você pode executar isso manualmente no Supabase Dashboard
 */
export async function initBucket() {
  try {
    // Verificar se bucket existe
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)

    if (!bucketExists) {
      // Criar bucket público
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'application/pdf',
          'application/zip',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'text/plain',
          'text/csv',
        ],
      })

      if (error) {
        console.error('Erro ao criar bucket:', error)
        return false
      }

      console.log('✅ Bucket criado com sucesso')
    }

    return true
  } catch (error) {
    console.error('Erro ao inicializar bucket:', error)
    return false
  }
}
