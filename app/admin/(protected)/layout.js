import '@/app/admin.css';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminFromCookies } from '@/lib/adminAuth';
import LogoutButton from '@/components/admin/LogoutButton';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/**
 * Every protected admin page renders through here, so this is the single place
 * the signed session cookie is actually verified. Middleware only checked that
 * a cookie exists; a forged or expired one is rejected here, before any lead
 * data is read. The login page sits outside this group by design.
 */
export default async function ProtectedAdminLayout({ children }) {
  const session = await getAdminFromCookies();
  if (!session) redirect('/admin/login');

  return (
    <div className="admin-shell">
      <header className="admin-bar">
        <div className="admin-bar-inner">
          <Link href="/admin" className="admin-brand">
            Olmem Technical Services <span>Admin</span>
          </Link>
          <nav className="admin-nav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/leads">Leads</Link>
            <Link href="/">View Site</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="admin-body">{children}</div>
    </div>
  );
}
