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

  const impersonation = await getImpersonationStatus();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar profile={profile} isImpersonating={impersonation.isImpersonating} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        {impersonation.isImpersonating && (
          <ImpersonationBanner tenantName={impersonation.tenantName!} />
        )}
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
