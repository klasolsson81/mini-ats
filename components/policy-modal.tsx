'use client';

import { useEffect } from 'react';
import { X, Shield, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'cookies';
}

export function PolicyModal({ isOpen, onClose, type }: PolicyModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Gradient border wrapper */}
        <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-cyan-400 via-blue-400 to-cyan-500 shadow-2xl flex flex-col max-h-[85vh]">
          <div className="bg-gray-900/85 backdrop-blur-md rounded-[14px] flex flex-col overflow-hidden border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg',
                    type === 'privacy'
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                      : 'bg-gradient-to-br from-amber-500 to-orange-600'
                  )}
                >
                  {type === 'privacy' ? (
                    <Shield className="w-5 h-5 text-white" />
                  ) : (
                    <Cookie className="w-5 h-5 text-white" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-white drop-shadow-md">
                  {type === 'privacy' ? 'Integritetspolicy' : 'Cookiepolicy'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/40 transition-colors"
                aria-label="Stäng"
              >
                <X className="w-5 h-5 text-white" aria-hidden="true" />
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {type === 'privacy' ? <PrivacyContent /> : <CookiesContent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-5 text-sm">
      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">1. Introduktion</h3>
        <p className="text-gray-200">
          Mini ATS (&ldquo;vi&rdquo;, &ldquo;oss&rdquo;) värnar om din integritet. Denna policy beskriver hur vi
          samlar in, använder och skyddar dina personuppgifter i enlighet med GDPR.
        </p>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">2. Personuppgifter vi samlar in</h3>
        <ul className="list-disc pl-5 text-gray-200 space-y-1">
          <li><strong className="text-gray-100">Kontoinformation:</strong> namn, e-postadress</li>
          <li><strong className="text-gray-100">Kandidatinformation:</strong> namn, e-post, telefon, LinkedIn-profil</li>
          <li><strong className="text-gray-100">Jobbannonsinformation:</strong> titlar, beskrivningar</li>
          <li><strong className="text-gray-100">Användningsdata:</strong> inloggningar, aktivitet i systemet</li>
          <li><strong className="text-gray-100">Teknisk data:</strong> IP-adress (för geografisk språkdetektering)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">3. Hur vi använder dina uppgifter</h3>
        <ul className="list-disc pl-5 text-gray-200 space-y-1">
          <li>Tillhandahålla och förbättra våra tjänster</li>
          <li>Hantera användarkonton och autentisering</li>
          <li>Automatiskt välja språk baserat på din geografiska plats</li>
          <li>Kommunicera med dig om tjänsten</li>
          <li>Säkerställa systemsäkerhet och förhindra missbruk</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">4. Lagring och säkerhet</h3>
        <p className="text-gray-200">
          Vi lagrar data hos Supabase (EU-region). Vi använder kryptering, Row Level Security
          (RLS) och moderna säkerhetsmetoder för att skydda dina uppgifter.
        </p>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">5. Administratörsåtkomst</h3>
        <p className="text-gray-200 mb-2">
          För support kan våra administratörer få åtkomst till din organisations data:
        </p>
        <ul className="list-disc pl-5 text-gray-200 space-y-1">
          <li>All administratörsåtkomst loggas i en säker granskningslogg</li>
          <li>Administratörer kan inte ändra lösenord eller utföra känsliga operationer</li>
          <li>Baseras på legitimt intresse (GDPR artikel 6.1.f)</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">6. Dina rättigheter (GDPR)</h3>
        <ul className="list-disc pl-5 text-gray-200 space-y-1">
          <li><strong className="text-gray-100">Rätt till tillgång:</strong> Begär kopia av dina uppgifter</li>
          <li><strong className="text-gray-100">Rätt till rättelse:</strong> Korrigera felaktiga uppgifter</li>
          <li><strong className="text-gray-100">Rätt till radering:</strong> Be oss radera dina uppgifter</li>
          <li><strong className="text-gray-100">Rätt till dataportabilitet:</strong> Exportera dina data</li>
        </ul>
        <p className="text-gray-200 mt-2">
          Kontakta oss på:{' '}
          <a href="mailto:klasolsson81@gmail.com" className="text-cyan-400 hover:text-cyan-300 hover:underline">
            klasolsson81@gmail.com
          </a>
        </p>
      </section>

      <p className="text-xs text-gray-400 pt-4 border-t border-gray-700">
        Senast uppdaterad: 2026-01-27
      </p>
    </div>
  );
}

function CookiesContent() {
  return (
    <div className="space-y-5 text-sm">
      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">1. Vad är cookies?</h3>
        <p className="text-gray-200">
          Cookies är små textfiler som lagras på din enhet när du besöker en webbplats.
          De hjälper webbplatsen att komma ihåg dina inställningar.
        </p>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">2. Vilka cookies använder vi?</h3>
        <p className="text-gray-200 mb-3">Nödvändiga cookies för att tjänsten ska fungera:</p>

        <div className="overflow-hidden rounded-lg border border-cyan-400/30 bg-gray-800/50">
          <table className="w-full text-xs">
            <thead className="bg-cyan-900/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-cyan-300">Cookie</th>
                <th className="px-3 py-2 text-left font-semibold text-cyan-300">Syfte</th>
                <th className="px-3 py-2 text-left font-semibold text-cyan-300">Livstid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="px-3 py-2 font-mono text-cyan-400">sb-*-auth-token</td>
                <td className="px-3 py-2 text-gray-200">Autentisering</td>
                <td className="px-3 py-2 text-gray-400">7 dagar</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-cyan-400">NEXT_LOCALE</td>
                <td className="px-3 py-2 text-gray-200">Språkval (SV/EN)</td>
                <td className="px-3 py-2 text-gray-400">1 år</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-cyan-400">IMPERSONATE_*</td>
                <td className="px-3 py-2 text-gray-200">Admin-session</td>
                <td className="px-3 py-2 text-gray-400">Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-200 mt-3">
          Vi använder <strong className="text-gray-100">inga</strong> analytics- eller marknadsföringscookies.
        </p>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">3. Automatisk språkdetektering</h3>
        <p className="text-gray-200">
          Vi använder din geografiska plats (via IP-adress) för att automatiskt välja språk:
        </p>
        <ul className="list-disc pl-5 text-gray-200 mt-2">
          <li>Besök från <strong className="text-gray-100">Sverige</strong> → Svenska (SV)</li>
          <li>Från <strong className="text-gray-100">andra länder</strong> → Engelska (EN)</li>
        </ul>
        <p className="text-gray-200 mt-2">
          Du kan alltid ändra språk manuellt. Din IP-adress lagras inte.
        </p>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">4. Hantera cookies</h3>
        <p className="text-gray-200">
          Du kan radera cookies i din webbläsares inställningar. Nödvändiga cookies krävs
          för att tjänsten ska fungera.
        </p>
      </section>

      <section>
        <h3 className="text-base font-bold text-cyan-300 mb-2">5. Kontakt</h3>
        <p className="text-gray-200">
          För frågor om cookies, kontakta oss på:{' '}
          <a href="mailto:klasolsson81@gmail.com" className="text-cyan-400 hover:text-cyan-300 hover:underline">
            klasolsson81@gmail.com
          </a>
        </p>
      </section>

      <p className="text-xs text-gray-400 pt-4 border-t border-gray-700">
        Senast uppdaterad: 2026-01-27
      </p>
    </div>
  );
}
