import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen circuit-bg">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Back link */}
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till appen
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Cookie className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            Cookiepolicy
          </h1>
        </div>

        {/* Content card */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 p-[1.5px]">
            <div className="absolute inset-[1.5px] rounded-[14px] bg-gradient-to-br from-white via-blue-50/50 to-white backdrop-blur-xl" />
          </div>

          <div className="relative p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                1. Vad är cookies?
              </h2>
              <p className="text-gray-700">
                Cookies är små textfiler som lagras på din enhet när du besöker
                en webbplats. De hjälper webbplatsen att komma ihåg dina
                inställningar och förbättra din upplevelse.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                2. Vilka cookies använder vi?
              </h2>

              <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                Nödvändiga cookies (Krävs)
              </h3>
              <p className="text-gray-700 mb-3">
                Dessa cookies är nödvändiga för att tjänsten ska fungera:
              </p>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Cookie
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Syfte
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Livstid
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-mono text-gray-900">
                        sb-*-auth-token
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        Håller dig inloggad (Supabase autentisering)
                      </td>
                      <td className="px-4 py-3 text-gray-600">7 dagar</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-gray-900">
                        NEXT_LOCALE
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        Sparar ditt språkval (SV/EN)
                      </td>
                      <td className="px-4 py-3 text-gray-600">1 år</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-gray-900">
                        IMPERSONATE_*
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        Admin impersonation-session (endast admin)
                      </td>
                      <td className="px-4 py-3 text-gray-600">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
                Analytics- och marknadsföringscookies
              </h3>
              <p className="text-gray-700">
                Vi använder för närvarande <strong>inga</strong> analytics- eller
                marknadsföringscookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                3. Automatisk språkdetektering
              </h2>
              <p className="text-gray-700">
                Vi använder din ungefärliga geografiska plats (baserat på din
                IP-adress via Vercel) för att automatiskt välja språk första
                gången du besöker sidan:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li>
                  Om du besöker från <strong>Sverige</strong> → Svenska (SV)
                </li>
                <li>
                  Från <strong>andra länder</strong> → Engelska (EN)
                </li>
              </ul>
              <p className="text-gray-700 mt-2">
                Du kan alltid ändra språk manuellt i menyn. Din IP-adress lagras
                inte för detta ändamål.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                4. Hantera cookies
              </h2>
              <p className="text-gray-700 mb-3">
                Du kan när som helst radera cookies i din webbläsares
                inställningar. Observera att nödvändiga cookies krävs för att
                tjänsten ska fungera.
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>
                  <strong>Chrome</strong>: Inställningar → Sekretess och
                  säkerhet → Rensa webbinformation
                </li>
                <li>
                  <strong>Firefox</strong>: Inställningar → Sekretess & säkerhet
                  → Cookies och webbplatsdata
                </li>
                <li>
                  <strong>Safari</strong>: Inställningar → Sekretess → Hantera
                  webbplatsdata
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                5. Tredjepartscookies
              </h2>
              <p className="text-gray-700">
                Vi använder Supabase för autentisering. Supabase kan sätta egna
                cookies för att hantera sessioner. Läs mer i{' '}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 hover:text-cyan-700 hover:underline"
                >
                  Supabase Integritetspolicy
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                6. Kontakt
              </h2>
              <p className="text-gray-700">
                För frågor om cookies, kontakta oss på:{' '}
                <a
                  href="mailto:privacy@miniats.se"
                  className="text-cyan-600 hover:text-cyan-700 hover:underline"
                >
                  privacy@miniats.se
                </a>
              </p>
            </section>

            <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
              Senast uppdaterad: 2026-01-27
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
