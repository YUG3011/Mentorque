import LoginPage from './LoginPage';

const MentorLogin = () => (
  <LoginPage
    role="MENTOR"
    title="Mentor Portal"
    subtitle="Sign in to manage your mentoring schedule"
    loginEndpoint="/auth/mentor/login"
    dashboardPath="/dashboard/mentor"
  />
);

export default MentorLogin;
