import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth'
import { syncUserPurchases } from '@/lib/services/sync-purchases'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const result = await syncUserPurchases(user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao sincronizar compras:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar compras' },
      { status: 500 }
    )
  }
}
