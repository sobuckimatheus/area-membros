const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const userUpper = await prisma.user.findFirst({ where: { email: 'Georgeaalves12@gmail.com' } })
  const userLower = await prisma.user.findFirst({ where: { email: 'georgeaalves12@gmail.com' } })
  
  console.log('Upper supabaseUid:', userUpper?.supabaseUid)
  console.log('Lower supabaseUid:', userLower?.supabaseUid || 'NENHUM')
  
  // Transferir supabaseUid do Upper para o Lower
  if (userUpper && userLower && userUpper.supabaseUid && !userLower.supabaseUid) {
    await prisma.user.update({
      where: { id: userUpper.id },
      data: { supabaseUid: null }
    })
    console.log('Removido supabaseUid do Upper')
    
    await prisma.user.update({
      where: { id: userLower.id },
      data: { supabaseUid: userUpper.supabaseUid }
    })
    console.log('Transferido supabaseUid para Lower')
    
    await prisma.user.delete({ where: { id: userUpper.id } })
    console.log('Deletado Upper (duplicado)')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
