import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import PatientDashboard from '../components/dashboards/PatientDashboard';
import DoctorDashboard from '../components/dashboards/DoctorDashboard';
import AdminDashboardView from '../components/dashboards/AdminDashboardView';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'admin':
      return <AdminDashboardView />;
    default:
      return <div>Role not recognized</div>;
  }
};

export default Dashboard;
