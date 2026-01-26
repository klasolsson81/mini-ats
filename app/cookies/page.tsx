import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Cookiepolicy
          </h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                1. Vad är cookies?
              </h2>
              <p className="text-gray-600">
                Cookies är små textfiler som lagras på din enhet när du besöker en webbplats. De hjälper webbplatsen att komma ihåg dina inställningar och förbättra din upplevelse.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                2. Vilka cookies använder vi?
              </h2>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                Nödvändiga cookies (Krävs)
              </h3>
              <p className="text-gray-600">
                Dessa cookies är nödvändiga för att tjänsten ska fungera:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>
                  <strong>Autentiseringscookies (Supabase)</strong>: Håller dig inloggad mellan sessioner. Löper ut efter 7 dagar.
                </li>
                <li>
                  <strong>NEXT_LOCALE</strong>: Sparar ditt språkval (svenska/engelska).
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                Analyticscookies (Ingen)
              </h3>
              <p className="text-gray-600">
                Vi använder för närvarande <strong>inga</strong> analytics- eller marknadsföringscookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                3. Hantera cookies
              </h2>
              <p className="text-gray-600">
                Du kan när som helst radera cookies i din webbläsares inställningar. Observera att nödvändiga cookies krävs för att tjänsten ska fungera.
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li><strong>Chrome</strong>: Inställningar → Sekretess och säkerhet → Rensa webbinformation</li>
                <li><strong>Firefox</strong>: Inställningar → Sekretess & säkerhet → Cookies och webbplatsdata</li>
                <li><strong>Safari</strong>: Inställningar → Sekretess → Hantera webbplatsdata</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                4. Tredjepartscookies
              </h2>
              <p className="text-gray-600">
                Vi använder Supabase för autentisering. Supabase kan sätta egna cookies för att hantera sessioner. Läs mer i{' '}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Supabase Integritetspolicy
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                5. Ändringar i cookiepolicyn
              </h2>
              <p className="text-gray-600">
                Om vi börjar använda ytterligare cookies (t.ex. analytics) kommer vi att uppdatera denna policy och informera dig.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                6. Kontakt
              </h2>
              <p className="text-gray-600">
                För frågor om cookies, kontakta oss på: privacy@miniats.se
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Senast uppdaterad: 2026-01-26
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/app"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← Tillbaka till appen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
