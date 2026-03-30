import LoginPage from './LoginPage';

const AdminLogin = () => (
  <LoginPage
    role="ADMIN"
    title="Admin Control"
    subtitle="Full system access for administrators"
    loginEndpoint="/auth/admin/login"
    dashboardPath="/dashboard/admin"
  />
);

export default AdminLogin;
