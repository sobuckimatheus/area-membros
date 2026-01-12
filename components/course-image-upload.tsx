'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2 } from 'lucide-react'

interface CourseImageUploadProps {
  currentImageUrl?: string | null
  onImageChange?: (url: string) => void
  type: 'thumbnail' | 'banner'
  label?: string
  description?: string
}

export function CourseImageUpload({
  currentImageUrl,
  onImageChange,
  type,
  label,
  description,
}: CourseImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fieldName = type === 'banner' ? 'bannerUrl' : 'thumbnailUrl'
  const defaultLabel = type === 'banner' ? 'Imagem do Banner (Hero)' : 'Imagem do Card (Thumbnail)'
  const defaultDescription = type === 'banner'
    ? 'Imagem grande exibida no topo da página do curso (recomendado: 1920x600px)'
    : 'Imagem exibida nos cards de curso/módulo - formato vertical Stories (recomendado: 1080x1920px ou 720x1280px)'

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      const data = await response.json()
      setImageUrl(data.url)
      if (onImageChange) {
        onImageChange(data.url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl('')
    if (onImageChange) {
      onImageChange('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={fieldName}>{label || defaultLabel}</Label>
        <p className="text-sm text-slate-500 mb-3">
          {description || defaultDescription}
        </p>

        {/* Preview da imagem */}
        {imageUrl && (
          <div className={`relative mb-4 rounded-lg overflow-hidden border border-slate-200 ${type === 'banner' ? 'max-w-full' : 'max-w-sm'}`}>
            <img
              src={imageUrl}
              alt="Preview"
              className={`w-full object-cover ${type === 'banner' ? 'aspect-[16/5]' : 'aspect-[9/16]'}`}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload de arquivo */}
        <div className="flex gap-2 mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${type}`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {/* Campo de URL manual */}
        <div>
          <Label htmlFor={fieldName} className="text-xs text-slate-600">
            Ou insira a URL da imagem
          </Label>
          <Input
            id={fieldName}
            name={fieldName}
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value)
              if (onImageChange) {
                onImageChange(e.target.value)
              }
            }}
            placeholder="https://exemplo.com/imagem.jpg"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}
