import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { getImpersonationStatus } from '@/lib/actions/impersonate';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Force password change on first login
  if (profile.must_change_password) {
    redirect('/change-password');
  }

  const impersonation = await getImpersonationStatus();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar profile={profile} isImpersonating={impersonation.isImpersonating} />
      <div className="flex flex-1 flex-col relative">
        {impersonation.isImpersonating && (
          <ImpersonationBanner tenantName={impersonation.tenantName!} />
        )}
        <main className="flex-1 overflow-y-auto relative z-10 animate-flow-main">
          <div className="min-h-full flex flex-col">
            <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-12 max-w-[1600px] flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
