'use client'

import { useState } from 'react'

interface Theme {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
}

interface ThemeSelectorProps {
  themes: Theme[]
  onThemeSelect: (theme: Theme) => void
  selectedTheme?: string
}

export function ThemeSelector({ themes, onThemeSelect, selectedTheme }: ThemeSelectorProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedTheme)

  const handleThemeClick = (theme: Theme) => {
    setSelected(theme.name)
    onThemeSelect(theme)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {themes.map((theme) => (
        <button
          key={theme.name}
          type="button"
          onClick={() => handleThemeClick(theme)}
          className={`border rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer text-left ${
            selected === theme.name ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
          }`}
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <h3 className="font-semibold mb-3" style={{ color: theme.textColor }}>
            {theme.name}
            {selected === theme.name && (
              <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                Selecionado
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            <div
              className="h-8 w-8 rounded"
              style={{ backgroundColor: theme.primaryColor }}
              title="Primária"
            />
            <div
              className="h-8 w-8 rounded"
              style={{ backgroundColor: theme.secondaryColor }}
              title="Secundária"
            />
            <div
              className="h-8 w-8 rounded"
              style={{ backgroundColor: theme.accentColor }}
              title="Acento"
            />
          </div>
        </button>
      ))}
    </div>
  )
}
