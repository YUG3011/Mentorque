import LoginPage from './LoginPage';

const UserLogin = () => (
  <LoginPage
    role="USER"
    title="Welcome Back"
    subtitle="Sign in to access your mentoring dashboard"
    loginEndpoint="/auth/user/login"
    dashboardPath="/dashboard/user"
  />
);

export default UserLogin;
