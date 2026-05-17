import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Users, CalendarCheck, Video } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({ patient_id: '', diagnosis: '', prescription: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [aptRes, patRes] = await Promise.all([
        api.get('/doctor/appointments'),
        api.get('/doctor/patients')
      ]);
      setAppointments(aptRes.data);
      setPatients(patRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/doctor/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!reportData.patient_id || !reportData.diagnosis) return toast.error('Patient and Diagnosis are required');
    
    setSubmitting(true);
    try {
      await api.post('/doctor/records', reportData);
      toast.success('Medical report created successfully!');
      setReportData({ patient_id: '', diagnosis: '', prescription: '' });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');

  return (
    <div className="w-full animate-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dr. {user.name}</h1>
          <p className="text-slate-600 mt-1">Manage your patients and schedule</p>
        </div>
        <Link to="/telemedicine" className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
          <Video className="w-4 h-4" /> Start Virtual Clinic
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        <div className="bg-white rounded-3xl shadow-editorial border border-slate-100/60 p-8">
          <div className="flex items-center gap-6">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <CalendarCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Pending Requests</p>
              <h3 className="text-4xl font-extrabold text-slate-900">{pendingAppointments.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-editorial border border-slate-100/60 p-8">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-50 p-4 rounded-2xl">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Total Patients</p>
              <h3 className="text-4xl font-extrabold text-slate-900">{patients.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-editorial border border-slate-100/60 overflow-hidden mb-10">
        <div className="p-8 border-b border-slate-100/60">
          <h2 className="text-xl font-bold text-slate-900">Appointment Requests</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : pendingAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No pending appointments.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingAppointments.map((apt) => (
              <div key={apt.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="font-semibold text-slate-900">{apt.patient?.name || 'Unknown Patient'}</h4>
                  <p className="text-sm text-slate-500">{format(new Date(apt.date), 'PPP p')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(apt.id, 'approved')}
                    className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium text-sm transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(apt.id, 'rejected')}
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium text-sm transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-editorial border border-slate-100/60 overflow-hidden">
        <div className="p-8 border-b border-slate-100/60 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">Create Medical Report</h2>
          <p className="text-slate-500 mt-2">Add a new diagnosis and prescription for a patient.</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleCreateReport} className="space-y-6 max-w-3xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Patient</label>
              <select
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                value={reportData.patient_id}
                onChange={(e) => setReportData({...reportData, patient_id: e.target.value})}
              >
                <option value="">-- Choose a patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis / Notes</label>
              <textarea
                required
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                placeholder="Describe the diagnosis..."
                value={reportData.diagnosis}
                onChange={(e) => setReportData({...reportData, diagnosis: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prescription (Optional)</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                placeholder="Medication names, dosage, instructions..."
                value={reportData.prescription}
                onChange={(e) => setReportData({...reportData, prescription: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save Medical Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
