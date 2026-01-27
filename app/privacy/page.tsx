import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            Integritetspolicy
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
                1. Introduktion
              </h2>
              <p className="text-gray-700">
                Mini ATS ("vi", "oss") värnar om din integritet. Denna policy
                beskriver hur vi samlar in, använder och skyddar dina
                personuppgifter i enlighet med GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                2. Personuppgifter vi samlar in
              </h2>
              <p className="text-gray-700 mb-3">
                Vi samlar in följande typer av data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  <strong>Kontoinformation:</strong> namn, e-postadress
                </li>
                <li>
                  <strong>Kandidatinformation:</strong> namn, e-post, telefon,
                  LinkedIn-profil
                </li>
                <li>
                  <strong>Jobbannonsinformation:</strong> titlar, beskrivningar
                </li>
                <li>
                  <strong>Användningsdata:</strong> inloggningar, aktivitet i
                  systemet
                </li>
                <li>
                  <strong>Teknisk data:</strong> IP-adress (för geografisk
                  språkdetektering och säkerhet)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                3. Hur vi använder dina uppgifter
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Tillhandahålla och förbättra våra tjänster</li>
                <li>Hantera användarkonton och autentisering</li>
                <li>
                  Automatiskt välja språk baserat på din geografiska plats
                </li>
                <li>Kommunicera med dig om tjänsten</li>
                <li>Säkerställa systemsäkerhet och förhindra missbruk</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                4. Lagring och säkerhet
              </h2>
              <p className="text-gray-700">
                Vi lagrar data hos Supabase (EU-region). Vi använder kryptering,
                Row Level Security (RLS) och moderna säkerhetsmetoder för att
                skydda dina uppgifter.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                5. Administratörsåtkomst och Support
              </h2>
              <p className="text-gray-700 mb-3">
                För att kunna ge dig support och felsöka problem kan våra
                administratörer i vissa fall få åtkomst till din organisations
                data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>Impersonation (Agera som):</strong> Administratörer
                  kan "agera som" din organisation för att se systemet från ditt
                  perspektiv och hjälpa till med problem.
                </li>
                <li>
                  <strong>Varför vi gör detta:</strong> För att kunna ge
                  effektiv support och lösa tekniska problem snabbt.
                </li>
                <li>
                  <strong>Säkerhet:</strong> All administratörsåtkomst loggas i
                  en säker granskningslogg med tidsstämpel, IP-adress och vilka
                  åtgärder som utfördes.
                </li>
                <li>
                  <strong>Begränsningar:</strong> Administratörer kan inte ändra
                  lösenord, ta bort organisationer eller utföra andra känsliga
                  operationer när de agerar som en organisation.
                </li>
                <li>
                  <strong>Legitimt intresse:</strong> Denna åtkomst baseras på
                  legitimt intresse för att tillhandahålla support och
                  upprätthålla tjänsten (GDPR artikel 6.1.f).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                6. Dina rättigheter (GDPR)
              </h2>
              <p className="text-gray-700 mb-3">Du har följande rättigheter:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  <strong>Rätt till tillgång:</strong> Begär kopia av dina
                  uppgifter
                </li>
                <li>
                  <strong>Rätt till rättelse:</strong> Korrigera felaktiga
                  uppgifter
                </li>
                <li>
                  <strong>Rätt till radering:</strong> Be oss radera dina
                  uppgifter
                </li>
                <li>
                  <strong>Rätt till dataportabilitet:</strong> Exportera dina
                  data
                </li>
                <li>
                  <strong>Rätt att invända:</strong> Motsätta dig viss
                  behandling
                </li>
              </ul>
              <p className="text-gray-700 mt-3">
                För att utöva dina rättigheter, kontakta oss på:{' '}
                <a
                  href="mailto:privacy@miniats.se"
                  className="text-cyan-600 hover:text-cyan-700 hover:underline"
                >
                  privacy@miniats.se
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                7. Cookies och språkdetektering
              </h2>
              <p className="text-gray-700">
                Vi använder endast nödvändiga cookies för autentisering och
                språkinställningar. Vi använder också din IP-adress för att
                automatiskt välja språk (svenska för besökare från Sverige,
                engelska för övriga). IP-adressen lagras inte permanent för
                detta ändamål. Läs mer i vår{' '}
                <Link
                  href="/cookies"
                  className="text-cyan-600 hover:text-cyan-700 hover:underline"
                >
                  Cookiepolicy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                8. Ändringar i policyn
              </h2>
              <p className="text-gray-700">
                Vi kan uppdatera denna policy. Väsentliga ändringar meddelas via
                e-post.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                9. Kontakt
              </h2>
              <p className="text-gray-700">
                För frågor om integritet, kontakta oss på:{' '}
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
