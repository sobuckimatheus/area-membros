'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeSelector } from './theme-selector'
import { HeroBannerUpload } from './hero-banner-upload'

interface Theme {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

interface CustomizationFormProps {
  currentCustomization?: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    backgroundColor?: string
    textColor?: string
    sidebarColor?: string
    heroImageUrl?: string | null
    heroImageUrlMobile?: string | null
    darkMode?: boolean
  }
  themes: Theme[]
  updateAction: (formData: FormData) => Promise<void>
}

export function CustomizationForm({
  currentCustomization,
  themes,
  updateAction,
}: CustomizationFormProps) {
  const [primaryColor, setPrimaryColor] = useState(currentCustomization?.primaryColor || '#A78BFA')
  const [secondaryColor, setSecondaryColor] = useState(currentCustomization?.secondaryColor || '#FBBF24')
  const [accentColor, setAccentColor] = useState(currentCustomization?.accentColor || '#34D399')
  const [backgroundColor, setBackgroundColor] = useState(currentCustomization?.backgroundColor || '#FEF3C7')
  const [textColor, setTextColor] = useState(currentCustomization?.textColor || '#1F2937')
  const [sidebarColor, setSidebarColor] = useState(currentCustomization?.sidebarColor || '#FFFFFF')
  const [darkMode, setDarkMode] = useState(currentCustomization?.darkMode || false)

  const handleThemeSelect = (theme: Theme) => {
    setPrimaryColor(theme.primaryColor)
    setSecondaryColor(theme.secondaryColor)
    setAccentColor(theme.accentColor)
    setBackgroundColor(theme.backgroundColor)
    setTextColor(theme.textColor)
  }

  return (
    <>
      {/* Temas Pré-definidos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Temas Pré-definidos</h3>
        <p className="text-sm text-slate-500 mb-4">
          Escolha um tema pronto e personalize conforme necessário
        </p>
        <ThemeSelector themes={themes} onThemeSelect={handleThemeSelect} />
      </div>

      {/* Formulário de Customização */}
      <form action={updateAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="primaryColor">Cor Primária</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                id="primaryColor-picker"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                id="primaryColor"
                name="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1"
                placeholder="#A78BFA"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Cor principal dos botões e destaques
            </p>
          </div>

          <div>
            <Label htmlFor="secondaryColor">Cor Secundária</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                id="secondaryColor-picker"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                id="secondaryColor"
                name="secondaryColor"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1"
                placeholder="#FBBF24"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Cor para elementos secundários
            </p>
          </div>

          <div>
            <Label htmlFor="accentColor">Cor de Acento</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                id="accentColor-picker"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                id="accentColor"
                name="accentColor"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1"
                placeholder="#34D399"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Cor para destaques especiais
            </p>
          </div>

          <div>
            <Label htmlFor="backgroundColor">Cor de Fundo</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                id="backgroundColor-picker"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                id="backgroundColor"
                name="backgroundColor"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1"
                placeholder="#FEF3C7"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Cor de fundo principal
            </p>
          </div>

          <div>
            <Label htmlFor="textColor">Cor do Texto</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                id="textColor-picker"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                id="textColor"
                name="textColor"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1"
                placeholder="#1F2937"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Cor principal do texto
            </p>
          </div>

          <div>
            <Label htmlFor="sidebarColor">Cor do Menu Lateral</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                id="sidebarColor-picker"
                value={sidebarColor}
                onChange={(e) => setSidebarColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                id="sidebarColor"
                name="sidebarColor"
                value={sidebarColor}
                onChange={(e) => setSidebarColor(e.target.value)}
                className="flex-1"
                placeholder="#FFFFFF"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Cor de fundo do menu lateral (sidebar)
            </p>
          </div>
        </div>

        <HeroBannerUpload
          currentDesktopUrl={currentCustomization?.heroImageUrl}
          currentMobileUrl={currentCustomization?.heroImageUrlMobile}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="darkMode"
            name="darkMode"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <Label htmlFor="darkMode" className="cursor-pointer">
            Modo Escuro (estilo Netflix)
          </Label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit">Salvar Personalização</Button>
          <Link href="/admin/customization">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>

      {/* Preview */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: backgroundColor,
            color: textColor,
          }}
        >
          <h2 className="text-2xl font-bold mb-4">Título do Curso</h2>
          <p className="mb-4">Este é um exemplo de como o texto aparecerá na plataforma.</p>
          <div className="flex gap-4">
            <button
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              Botão Primário
            </button>
            <button
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: secondaryColor, color: 'white' }}
            >
              Botão Secundário
            </button>
            <button
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: accentColor, color: 'white' }}
            >
              Acento
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
