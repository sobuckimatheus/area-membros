import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/actions/auth"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Play, Info, Clock, Award } from "lucide-react"
import { hasActiveSubscription } from "@/lib/services/subscription"
import { getJardimCourse } from "@/lib/services/community"

// Função para extrair thumbnail do YouTube
function getYouTubeThumbnail(videoUrl: string | null): string | null {
  if (!videoUrl) return null

  try {
    // Extrair videoId de diferentes formatos de URL do YouTube
    let videoId = null

    if (videoUrl.includes('youtube.com/watch?v=')) {
      videoId = videoUrl.split('v=')[1]?.split('&')[0]
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0]
    } else if (videoUrl.includes('youtube.com/embed/')) {
      videoId = videoUrl.split('embed/')[1]?.split('?')[0]
    }

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
  } catch (error) {
    console.error('Error extracting YouTube thumbnail:', error)
  }

  return null
}

// Função helper para formatar preço
function formatPrice(price: any, currency: string = 'BRL') {
  if (!price) return null

  const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(numPrice)
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verificar se usuário tem assinatura ativa
  const isSubscriber = await hasActiveSubscription(user.id)

  // Buscar customização do tenant
  const customization = await prisma.tenantCustomization.findUnique({
    where: { tenantId: user.tenantId },
  })

  // Paleta "O Jardim de Rute" — governa as cores do dashboard.
  // (As imagens de banner continuam vindo da customização do tenant.)
  const colors = {
    primary: '#2e3b28',    // verde escuro (botões, destaques)
    secondary: '#c6a04e',  // dourado
    accent: '#c6a04e',     // dourado (barras de progresso, badges)
    background: '#f4efe6', // creme
    text: '#2d2d2d',       // texto legível sobre o creme
  }

  // Buscar TODOS os cursos publicados
  const courses = await prisma.course.findMany({
    where: {
      tenantId: user.tenantId,
      status: "PUBLISHED",
    },
    include: {
      category: true,
      productMappings: {
        include: {
          integration: true,
        },
      },
      enrollments: {
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
      },
      _count: {
        select: {
          modules: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Separar cursos matriculados e não matriculados
  const enrolledCourses = courses.filter(c => c.enrollments.length > 0)
  const availableCourses = courses.filter(c => c.enrollments.length === 0 && !c.isSubscriberOnly)

  // Buscar banners da área do assinante (para divulgação - aparece para todos)
  const subscriberBanners = await prisma.subscriberBanner.findMany({
    where: {
      tenantId: user.tenantId,
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
  })

  // Buscar o curso "Área do Assinante" para redirecionar os banners
  const subscriberAreaCourse = await prisma.course.findFirst({
    where: {
      tenantId: user.tenantId,
      OR: [
        { title: { contains: 'Area do Assinante', mode: 'insensitive' } },
        { title: { contains: 'Área do Assinante', mode: 'insensitive' } },
      ],
      status: 'PUBLISHED',
    },
    select: {
      slug: true,
    },
  })

  // Buscar cursos exclusivos para assinantes
  const exclusiveCourses = await prisma.course.findMany({
    where: {
      tenantId: user.tenantId,
      status: "PUBLISHED",
      isSubscriberOnly: true,
    },
    include: {
      category: true,
      productMappings: {
        include: {
          integration: true,
        },
      },
      enrollments: {
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
      },
      _count: {
        select: {
          modules: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Buscar aulas gratuitas
  const freeLessons = await prisma.lesson.findMany({
    where: {
      isFree: true,
      module: {
        course: {
          tenantId: user.tenantId,
          status: "PUBLISHED",
        },
      },
    },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })

  // Curso em destaque
  const featuredCourse = enrolledCourses[0] || availableCourses[0]

  // Banner URLs
  const heroBannerDesktop = customization?.heroImageUrl
  const heroBannerMobile = customization?.heroImageUrlMobile

  // Sua Jornada — dados reais de progresso
  const completedLessonsCount = await prisma.lessonProgress.count({
    where: { userId: user.id, status: 'COMPLETED' },
  })
  const journeyPercent = enrolledCourses.length > 0
    ? Math.round(
        enrolledCourses.reduce((acc, c) => acc + Number(c.enrollments[0]?.progress || 0), 0) /
          enrolledCourses.length
      )
    : 0

  // "Continue assistindo" — última aula assistida (curso em andamento).
  const lastProgress = await prisma.lessonProgress.findFirst({
    where: { userId: user.id, lastWatchedAt: { not: null } },
    orderBy: { lastWatchedAt: 'desc' },
    include: { lesson: { include: { module: { include: { course: { select: { title: true, slug: true, thumbnailUrl: true } } } } } } },
  })
  const continueCourse = lastProgress?.lesson.module.course || null

  // Curso da "sala" ao vivo (O Jardim). "Entrar na sala" leva a esse curso;
  // o acesso às aulas é controlado pela própria página do curso: quem tem
  // matrícula ativa assiste, quem não tem vê o CTA e não assiste.
  const jardimCourse = await getJardimCourse(user.tenantId)
  const salaHref = jardimCourse ? `/course/${jardimCourse.slug}` : '/community'

  return (
    <div>
      {/* Hero Section - Banner Principal da Plataforma (colado no topo, largura total) */}
      {(heroBannerDesktop || heroBannerMobile) && (
        <div className="w-full">
          {/* Banner Desktop */}
          {heroBannerDesktop && (
            <img
              src={heroBannerDesktop}
              alt="Banner"
              className="hidden md:block w-full h-auto"
            />
          )}

          {/* Banner Mobile (usa o desktop como fallback se não houver versão mobile) */}
          {(heroBannerMobile || heroBannerDesktop) && (
            <img
              src={heroBannerMobile || heroBannerDesktop!}
              alt="Banner"
              className="md:hidden w-full h-auto"
            />
          )}
        </div>
      )}

      {/* Seção de Curso em Destaque (se não houver banner) */}
      {!heroBannerDesktop && !heroBannerMobile && featuredCourse && (
        <div className="relative py-16 px-8 overflow-hidden mt-16">
          {/* Gradiente suave decorativo */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full opacity-20 rounded-bl-[100px]"
            style={{ backgroundColor: colors.primary }}
          />

          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl">
              <h1
                className="text-5xl md:text-6xl font-bold mb-4"
                style={{ color: colors.text }}
              >
                {featuredCourse.title}
              </h1>
              <p
                className="text-lg mb-8 opacity-80"
                style={{ color: colors.text }}
              >
                {featuredCourse.shortDesc || featuredCourse.description}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <Link href={`/course/${featuredCourse.slug}`} prefetch={false}>
                  <Button
                    size="lg"
                    className="font-semibold px-8 text-white hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Play className="h-5 w-5 mr-2 fill-current" />
                    {enrolledCourses.includes(featuredCourse) ? 'Continuar Assistindo' : 'Começar Agora'}
                  </Button>
                </Link>
                <Link href={`/course/${featuredCourse.slug}`} prefetch={false}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-semibold px-8"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    <Info className="h-5 w-5 mr-2" />
                    Ver Detalhes
                  </Button>
                </Link>
              </div>

              {/* Info adicional */}
              <div
                className="flex items-center gap-6 text-sm opacity-70"
                style={{ color: colors.text }}
              >
                {featuredCourse._count.modules > 0 && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>{featuredCourse._count.modules} módulos</span>
                  </div>
                )}
                {featuredCourse.estimatedDuration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{featuredCourse.estimatedDuration}h de conteúdo</span>
                  </div>
                )}
              </div>

              {enrolledCourses.includes(featuredCourse) && (
                <div className="mt-8">
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: `${Number(featuredCourse.enrollments[0].progress)}%`,
                        backgroundColor: colors.accent
                      }}
                    />
                  </div>
                  <p
                    className="text-sm mt-2 opacity-70"
                    style={{ color: colors.text }}
                  >
                    {Number(featuredCourse.enrollments[0].progress)}% concluído
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ao vivo — destaque principal (full-width, indicador pulsante) */}
      {customization?.liveClassSchedule && (
        <div className="container mx-auto px-8 pt-8">
          <div className="overflow-hidden rounded-2xl border-2 border-[#e0cdbf] bg-gradient-to-br from-[#f7f0e6] to-[#f2e6da] p-7 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f0dcd4] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#b5563f]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c0392b] opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#c0392b]" />
                  </span>
                  Ao vivo
                </span>
                <h2 className="mt-3 font-serif text-2xl text-[#3a352e] md:text-3xl">Aula ao vivo da semana</h2>
                <p className="mt-1 text-sm text-[#8a8172] md:text-base">
                  {customization.liveClassSchedule} · aprofundamento, oração e direcionamento juntas.
                </p>
              </div>
              <Link
                href={salaHref}
                className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3a352e] px-7 py-3.5 text-sm font-semibold text-[#f7f2ea] shadow-sm hover:opacity-90 md:text-base"
              >
                Entrar na sala
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Continue de onde parou / Comece a assistir — referente ao que a aluna está vendo */}
      <div className="container mx-auto px-8 pt-4">
        {continueCourse ? (
          <Link href={`/course/${continueCourse.slug}`} className="block">
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {continueCourse.thumbnailUrl && (
                  <img src={continueCourse.thumbnailUrl} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover" />
                )}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">Continue de onde parou</p>
                  <h3 className="font-serif text-xl text-primary">{continueCourse.title}</h3>
                </div>
              </div>
              <span className="inline-flex w-fit items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
                Continuar assistindo
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-accent">Sua jornada começa aqui</p>
              <h3 className="font-serif text-xl text-primary">Comece a assistir suas aulas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha um curso e dê o primeiro passo na sua jornada de transformação.
              </p>
            </div>
            <Link
              href={enrolledCourses.length > 0 ? '/my-courses' : '/courses'}
              className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {enrolledCourses.length > 0 ? 'Ver meus cursos' : 'Explorar cursos'}
            </Link>
          </div>
        )}
      </div>

      {/* Seções de Cursos */}
      <div className="container mx-auto px-8 pt-12 pb-20">
        {/* Continuar Assistindo */}
        {enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8" style={{ color: colors.text }}>
              Continuar Assistindo
            </h2>
            <div className="relative -mx-8 px-8">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth">
                {enrolledCourses.map((course) => {
                  const enrollment = course.enrollments[0]
                  return (
                    <Link key={course.id} href={`/course/${course.slug}`}>
                      <div className="group relative cursor-pointer flex-shrink-0 w-[180px] md:w-[200px] snap-start">
                        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: colors.primary, opacity: 0.15 }}
                            >
                              <span className="text-lg" style={{ color: colors.text }}>Sem imagem</span>
                            </div>
                          )}

                          {/* Progress Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-3 bg-black/30 backdrop-blur-sm">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${Number(enrollment.progress)}%`,
                                backgroundColor: colors.accent
                              }}
                            />
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center">
                              <Play className="h-16 w-16 text-white mx-auto mb-3" fill="white" />
                              <p className="text-white text-sm font-medium">{Number(enrollment.progress)}% concluído</p>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-base font-semibold mt-4 line-clamp-2" style={{ color: colors.text }}>
                          {course.title}
                        </h3>
                        {course.shortDesc && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {course.shortDesc}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Sua Jornada — progresso real, discreto */}
        {enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4" style={{ color: colors.text }}>
              Sua jornada
            </h2>
            <div className="max-w-xl rounded-2xl border border-border bg-card p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-sm" style={{ color: colors.text }}>
                  <span className="font-semibold">{completedLessonsCount}</span>{' '}
                  {completedLessonsCount === 1 ? 'aula concluída' : 'aulas concluídas'}
                </p>
                <span className="text-sm font-semibold text-accent">{journeyPercent}%</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent" style={{ width: `${journeyPercent}%` }} />
              </div>
            </div>
          </section>
        )}

        {/* Cursos Disponíveis */}
        {availableCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-8" style={{ color: colors.text }}>
              Para o seu próximo passo
            </h2>
            <div className="relative -mx-8 px-8">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth">
                {availableCourses.map((course) => (
                  <div key={course.id} className="group relative flex-shrink-0 w-[180px] md:w-[200px] snap-start">
                    {/* Imagem com Link para detalhes */}
                    <Link href={`/course/${course.slug}`} prefetch={false}>
                      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300 cursor-pointer">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: colors.primary, opacity: 0.15 }}
                          >
                            <span className="text-lg" style={{ color: colors.text }}>Sem imagem</span>
                          </div>
                        )}

                        {/* Badge Vagas Esgotadas */}
                        {course.isFullyBooked && (
                          <div className="absolute top-3 left-3 right-3">
                            <div className="bg-red-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-lg text-center">
                              🔒 VAGAS ESGOTADAS
                            </div>
                          </div>
                        )}

                        {/* Badge */}
                        {!course.isFullyBooked && course.badge && (
                          <div className="absolute top-3 left-3">
                            <span
                              className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg"
                              style={{ backgroundColor: colors.secondary }}
                            >
                              {course.badge}
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-center">
                            <Info className="h-16 w-16 text-white mx-auto mb-3" />
                            <p className="text-white text-sm font-medium">Ver Detalhes</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Título com Link */}
                    <Link href={`/course/${course.slug}`} prefetch={false}>
                      <h3 className="text-base font-semibold mt-4 line-clamp-2 cursor-pointer hover:opacity-80 transition-opacity" style={{ color: colors.text }}>
                        {course.title}
                      </h3>
                    </Link>

                    {/* Descrição */}
                    {course.shortDesc && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {course.shortDesc}
                      </p>
                    )}

                    {/* Botões de Compra */}
                    {!course.isFree && course.price && (
                      <div className="mt-3 space-y-3">
                        {/* Botão Preço Normal - sempre aparece */}
                        {course.isFullyBooked ? (
                          <button
                            disabled
                            className="w-full px-3 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed shadow-sm"
                          >
                            Vagas Esgotadas
                          </button>
                        ) : (
                          <a
                            href={course.checkoutUrl || `/course/${course.slug}`}
                            target={course.checkoutUrl ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                          >
                            <button className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-opacity shadow-sm hover:opacity-90" style={{ backgroundColor: colors.primary, color: 'white' }}>
                              {formatPrice(course.price, course.currency)} · Quero acessar
                            </button>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Seção "Área do Assinante" removida a pedido. */}

        {/* Cursos Exclusivos para Assinantes — desativado (não há mais assinatura) */}
        {false && isSubscriber && exclusiveCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8" style={{ color: colors.text }}>
              <span className="flex items-center gap-2">
                Cursos Exclusivos
                <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: colors.accent, color: 'white' }}>
                  Apenas Assinantes
                </span>
              </span>
            </h2>
            <div className="relative -mx-8 px-8">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth">
                {exclusiveCourses.map((course) => {
                  const isEnrolled = course.enrollments.length > 0
                  return (
                    <div key={course.id} className="group relative flex-shrink-0 w-[180px] md:w-[200px] snap-start">
                      <Link href={`/course/${course.slug}`} prefetch={false}>
                        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300 cursor-pointer">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: colors.primary, opacity: 0.15 }}
                            >
                              <span className="text-lg" style={{ color: colors.text }}>Sem imagem</span>
                            </div>
                          )}

                          {/* Badge Exclusivo */}
                          <div className="absolute top-3 left-3">
                            <span
                              className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg"
                              style={{ backgroundColor: colors.accent }}
                            >
                              EXCLUSIVO
                            </span>
                          </div>

                          {/* Hover Overlay */}
                          {isEnrolled && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="text-center">
                                <Play className="h-16 w-16 text-white mx-auto mb-3" fill="white" />
                                <p className="text-white text-sm font-medium">Acessar Curso</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>

                      <h3 className="text-base font-semibold mt-4 line-clamp-2" style={{ color: colors.text }}>
                        {course.title}
                      </h3>
                      {course.shortDesc && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {course.shortDesc}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Recomendados para Você */}
        {courses.length > 3 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8" style={{ color: colors.text }}>
              Recomendados para Você
            </h2>
            <div className="relative -mx-8 px-8">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth">
                {courses
                  .sort(() => Math.random() - 0.5)
                  .map((course) => (
                    <Link key={course.id} href={`/course/${course.slug}`}>
                      <div className="group relative cursor-pointer flex-shrink-0 w-[180px] md:w-[200px] snap-start">
                        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: colors.primary, opacity: 0.15 }}
                            >
                              <span className="text-lg" style={{ color: colors.text }}>Sem imagem</span>
                            </div>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center">
                              <Play className="h-16 w-16 text-white mx-auto mb-3" fill="white" />
                              <p className="text-white text-sm font-medium">Assistir Agora</p>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-base font-semibold mt-4 line-clamp-2" style={{ color: colors.text }}>
                          {course.title}
                        </h3>
                        {course.shortDesc && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {course.shortDesc}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Aulas Gratuitas — secundária, após os recomendados */}
        {freeLessons.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-8" style={{ color: colors.text }}>
              Aulas Gratuitas
            </h2>
            <div className="relative -mx-8 px-8">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth">
                {freeLessons.map((lesson) => {
                  const youtubeThumbnail = getYouTubeThumbnail(lesson.videoUrl)
                  const thumbnailUrl = youtubeThumbnail || lesson.module.thumbnailUrl || lesson.module.course.thumbnailUrl

                  return (
                  <Link key={lesson.id} href={`/course/${lesson.module.course.slug}/lesson/${lesson.id}`}>
                    <div className="group relative cursor-pointer flex-shrink-0 w-[280px] md:w-[340px] snap-start">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: colors.primary, opacity: 0.15 }}
                          >
                            <span className="text-lg" style={{ color: colors.text }}>Sem imagem</span>
                          </div>
                        )}

                        {/* Badge Grátis */}
                        <div className="absolute top-3 left-3">
                          <span
                            className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg"
                            style={{ backgroundColor: colors.accent }}
                          >
                            GRÁTIS
                          </span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-center">
                            <Play className="h-16 w-16 text-white mx-auto mb-3" fill="white" />
                            <p className="text-white text-sm font-medium">Assistir Agora</p>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold mt-4 line-clamp-2" style={{ color: colors.text }}>
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {lesson.module.course.title}
                      </p>
                    </div>
                  </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Loja Online — Em breve */}
        <section className="mb-4">
          <h2 className="font-serif text-3xl font-bold mb-6" style={{ color: colors.text }}>
            Loja online
          </h2>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <span className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              Em breve
            </span>
            <p className="mt-4 max-w-md text-muted-foreground">
              Produtos e itens especiais do Jardim de Rute estão chegando. Fique de olho.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
