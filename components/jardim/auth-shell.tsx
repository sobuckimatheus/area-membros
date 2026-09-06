import { JardimLogo } from './logo'

/**
 * Moldura das telas de autenticação (login, cadastro, senha) no tema Jardim:
 * imagem do jardim como fundo + card creme centralizado.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#2e3b28] p-4">
      {/* Fundo do Jardim */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/jardim-login.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  )
}

export { JardimLogo }
