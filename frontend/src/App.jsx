import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import DashboardLayout from './components/layout/DashboardLayout';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import BookAppointment from '../pages/BookAppointment';
import MedicalRecords from '../pages/MedicalRecords';
import AdminDashboard from '../pages/AdminDashboard';
import DoctorPanel from '../pages/DoctorPanel';
import SymptomChecker from '../pages/SymptomChecker';
import Medicines from '../pages/Medicines';
import Telemedicine from '../pages/Telemedicine';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
          <Routes>
            {/* Public Routes with Navbar */}
            <Route path="/" element={<div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow"><Home /></main></div>} />
            <Route path="/login" element={<div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow"><Login /></main></div>} />
            <Route path="/register" element={<div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow"><Register /></main></div>} />
            
            {/* Authenticated Routes with DashboardLayout */}
            <Route element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/records" element={<MedicalRecords />} />
                <Route path="/symptom-checker" element={<SymptomChecker />} />
                <Route path="/medicines" element={<Medicines />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['doctor', 'patient']} />}>
                <Route path="/telemedicine" element={<Telemedicine />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route path="/doctor-panel" element={<DoctorPanel />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
