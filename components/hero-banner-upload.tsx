'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Loader2 } from 'lucide-react'

interface HeroBannerUploadProps {
  currentDesktopUrl?: string | null
  currentMobileUrl?: string | null
}

export function HeroBannerUpload({
  currentDesktopUrl,
  currentMobileUrl,
}: HeroBannerUploadProps) {
  const [desktopUrl, setDesktopUrl] = useState(currentDesktopUrl || '')
  const [mobileUrl, setMobileUrl] = useState(currentMobileUrl || '')
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false)
  const [isUploadingMobile, setIsUploadingMobile] = useState(false)
  const [errorDesktop, setErrorDesktop] = useState('')
  const [errorMobile, setErrorMobile] = useState('')
  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'desktop' | 'mobile'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const setUploading = type === 'desktop' ? setIsUploadingDesktop : setIsUploadingMobile
    const setError = type === 'desktop' ? setErrorDesktop : setErrorMobile
    const setUrl = type === 'desktop' ? setDesktopUrl : setMobileUrl

    setUploading(true)
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
      setUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setDesktopUrl('')
      if (desktopInputRef.current) {
        desktopInputRef.current.value = ''
      }
    } else {
      setMobileUrl('')
      if (mobileInputRef.current) {
        mobileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner Desktop */}
      <div>
        <Label htmlFor="heroImageUrl">Banner Principal - Desktop</Label>
        <p className="text-sm text-slate-500 mb-3">
          Imagem exibida no topo do dashboard em telas grandes (recomendado: 1920x600px - horizontal)
        </p>

        {/* Preview Desktop */}
        {desktopUrl && (
          <div className="relative mb-4 rounded-lg overflow-hidden border border-slate-200">
            <img
              src={desktopUrl}
              alt="Preview Desktop"
              className="w-full object-cover aspect-[16/5]"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage('desktop')}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload Desktop */}
        <div className="flex gap-2 mb-3">
          <input
            ref={desktopInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'desktop')}
            className="hidden"
            id="file-upload-desktop"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => desktopInputRef.current?.click()}
            disabled={isUploadingDesktop}
            className="flex-1"
          >
            {isUploadingDesktop ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload (Desktop)
              </>
            )}
          </Button>
        </div>

        {errorDesktop && (
          <p className="text-sm text-red-600 mb-3">{errorDesktop}</p>
        )}

        {/* URL Manual Desktop */}
        <div>
          <Label htmlFor="heroImageUrl" className="text-xs text-slate-600">
            Ou insira a URL da imagem
          </Label>
          <Input
            id="heroImageUrl"
            name="heroImageUrl"
            type="url"
            value={desktopUrl}
            onChange={(e) => setDesktopUrl(e.target.value)}
            placeholder="https://exemplo.com/banner-desktop.jpg"
            className="mt-1"
          />
        </div>
      </div>

      {/* Banner Mobile */}
      <div>
        <Label htmlFor="heroImageUrlMobile">Banner Principal - Mobile</Label>
        <p className="text-sm text-slate-500 mb-3">
          Imagem exibida no topo do dashboard em dispositivos móveis (recomendado: 1080x1920px - vertical/tela cheia)
        </p>

        {/* Preview Mobile */}
        {mobileUrl && (
          <div className="relative mb-4 rounded-lg overflow-hidden border border-slate-200 max-w-md">
            <img
              src={mobileUrl}
              alt="Preview Mobile"
              className="w-full object-cover aspect-[2/3]"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage('mobile')}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload Mobile */}
        <div className="flex gap-2 mb-3">
          <input
            ref={mobileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'mobile')}
            className="hidden"
            id="file-upload-mobile"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => mobileInputRef.current?.click()}
            disabled={isUploadingMobile}
            className="flex-1"
          >
            {isUploadingMobile ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload (Mobile)
              </>
            )}
          </Button>
        </div>

        {errorMobile && (
          <p className="text-sm text-red-600 mb-3">{errorMobile}</p>
        )}

        {/* URL Manual Mobile */}
        <div>
          <Label htmlFor="heroImageUrlMobile" className="text-xs text-slate-600">
            Ou insira a URL da imagem
          </Label>
          <Input
            id="heroImageUrlMobile"
            name="heroImageUrlMobile"
            type="url"
            value={mobileUrl}
            onChange={(e) => setMobileUrl(e.target.value)}
            placeholder="https://exemplo.com/banner-mobile.jpg"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}
