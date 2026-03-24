import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'marygouveia@uol.com.br';

  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      enrollments: {
        include: {
          course: {
            select: {
              title: true,
              slug: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log('❌ Usuário não encontrado:', email);
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Usuário encontrado:');
  console.log('ID:', user.id);
  console.log('Nome:', user.name);
  console.log('Email:', user.email);
  console.log('Supabase ID:', user.supabaseUid || 'Não vinculado');
  console.log('\n📚 Cursos matriculados:', user.enrollments.length);

  if (user.enrollments.length > 0) {
    user.enrollments.forEach((enrollment, index) => {
      console.log(`\n  ${index + 1}. ${enrollment.course.title}`);
      console.log(`     Slug: ${enrollment.course.slug}`);
      console.log(`     Status: ${enrollment.status}`);
      console.log(`     Matrícula em: ${enrollment.enrolledAt}`);
    });
  }

  await prisma.$disconnect();
}

checkUser().catch(console.error);
