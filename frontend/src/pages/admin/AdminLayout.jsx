import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import AdminDashboard from './AdminDashboard';
import UsersList from './UsersList';
import MentorsList from './MentorsList';
import Recommendations from './Recommendations';
import Booking from './Booking';

const AdminLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="mentors" element={<MentorsList />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="book" element={<Booking />} />
            <Route path="bookings" element={<AdminDashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
