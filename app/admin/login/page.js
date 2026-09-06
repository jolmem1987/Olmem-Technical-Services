import '@/app/admin.css';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = {
  title: 'Admin Sign In',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">Olmem Technical Services</p>
        <h1>Admin Sign In</h1>
        <p className="admin-login-note">
          Internal lead dashboard. Access is restricted to the site administrator.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
