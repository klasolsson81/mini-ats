import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Integritetspolicy
          </h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                1. Introduktion
              </h2>
              <p className="text-gray-600">
                Mini ATS ("vi", "oss") värnar om din integritet. Denna policy beskriver hur vi samlar in, använder och skyddar dina personuppgifter.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                2. Personuppgifter vi samlar in
              </h2>
              <p className="text-gray-600">Vi samlar in följande typer av data:</p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Kontoinformation: namn, e-postadress</li>
                <li>Kandidatinformation: namn, e-post, telefon, LinkedIn-profil</li>
                <li>Jobbannonsinformation: titlar, beskrivningar</li>
                <li>Användningsdata: inloggningar, aktivitet i systemet</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                3. Hur vi använder dina uppgifter
              </h2>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Tillhandahålla och förbättra våra tjänster</li>
                <li>Hantera användarkonton och autentisering</li>
                <li>Kommunicera med dig om tjänsten</li>
                <li>Säkerställa systemsäkerhet</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                4. Lagring och säkerhet
              </h2>
              <p className="text-gray-600">
                Vi lagrar data hos Supabase (EU-region). Vi använder kryptering, RLS-policyer och moderna säkerhetsmetoder för att skydda dina uppgifter.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                5. Dina rättigheter (GDPR)
              </h2>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Rätt till tillgång: Begär kopia av dina uppgifter</li>
                <li>Rätt till rättelse: Korrigera felaktiga uppgifter</li>
                <li>Rätt till radering: Be oss radera dina uppgifter</li>
                <li>Rätt till dataportabilitet: Exportera dina data</li>
                <li>Rätt att invända: Motsätta dig viss behandling</li>
              </ul>
              <p className="text-gray-600 mt-4">
                För att utöva dina rättigheter, kontakta oss på: privacy@miniats.se
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                6. Cookies
              </h2>
              <p className="text-gray-600">
                Vi använder endast nödvändiga cookies för autentisering och språkinställningar. Läs mer i vår{' '}
                <Link href="/cookies" className="text-blue-600 hover:underline">
                  Cookiepolicy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                7. Ändringar i policyn
              </h2>
              <p className="text-gray-600">
                Vi kan uppdatera denna policy. Väsentliga ändringar meddelas via e-post.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">
                8. Kontakt
              </h2>
              <p className="text-gray-600">
                För frågor om integritet, kontakta oss på: privacy@miniats.se
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
