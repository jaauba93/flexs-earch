import AdminLoginForm from '@/components/admin/AdminLoginForm'

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e8f0ff_0%,#f5f7fc_45%,#eef2f8_100%)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1240px] items-center">
        <div className="grid w-full gap-8 overflow-hidden rounded-[36px] border border-white/70 bg-white/70 shadow-[0_40px_120px_rgba(15,29,74,0.12)] backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-between bg-[linear-gradient(145deg,#000759_0%,#1537b1_45%,#5ca9ff_100%)] p-8 text-white lg:p-12">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/70">Colliers Flex</p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white">
                CMS do zarządzania ofertami, zdjęciami i przyszłymi tłumaczeniami frontu.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/78">
                Panel administracyjny został zaprojektowany jako lekkie, uporządkowane środowisko pracy: edycja ofert,
                upload zdjęć budynków i masowe operacje przez pliki CSV / Excel bez konieczności wchodzenia do Supabase.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Oferty', 'Edycja danych publikowanych biur i parametrów komercyjnych.'],
                ['Zdjęcia', 'Upload i porządkowanie galerii budynków z poziomu CMS.'],
                ['Import', 'Masowe add / update / delete przez plik zamiast Table Editor.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[24px] border border-white/15 bg-white/10 p-4">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center p-6 lg:p-12">
            <div className="w-full rounded-[30px] border border-[#e7edf8] bg-white p-6 shadow-[0_24px_60px_rgba(15,29,74,0.08)] lg:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7b8bb5]">Logowanie administratora</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#000759]">Wejdź do panelu CMS</h2>
              <p className="mt-3 text-sm leading-7 text-[#51628b]">
                Sam panel działa po polsku. Wielojęzyczność przygotowujemy dla treści i frontu publicznego.
              </p>

              <div className="mt-8">
                <AdminLoginForm nextPath={params.next} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
