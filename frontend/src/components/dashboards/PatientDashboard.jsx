import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Calendar, FileText, Clock, Activity, AlertCircle, Phone, Heart, PlusCircle, Video } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [healthStats, setHealthStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ heart_rate: '', oxygen_level: '' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [aptRes, statsRes] = await Promise.all([
          api.get('/patient/appointments'),
          api.get('/patient/health-stats')
        ]);
        setAppointments(aptRes.data);
        setHealthStats(statsRes.data.reverse()); // Chronological for charts
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const triggerSOS = (e) => {
    e.preventDefault();
    // Immediately start the direct phone call
    window.location.href = 'tel:9405909432';

    // Trigger the background API call silently
    api.post('/patient/sos').catch(err => {
      console.error('Failed to trigger SOS API:', err);
    });
  };

  const handleLogVitals = async (e) => {
    e.preventDefault();
    if (!vitalsForm.heart_rate || !vitalsForm.oxygen_level) return;
    try {
      await api.post('/patient/health-stats', vitalsForm);
      toast.success('Vitals logged successfully!');
      setVitalsForm({ heart_rate: '', oxygen_level: '' });
      setShowLogForm(false);
      const statsRes = await api.get('/patient/health-stats');
      setHealthStats(statsRes.data.reverse());
    } catch (err) {
      toast.error('Failed to log vitals');
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'approved');

  return (
    <div className="w-full animate-enter">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
          <p className="text-slate-600 mt-1">Here is your health overview</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={triggerSOS} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2 animate-pulse">
            <AlertCircle className="w-5 h-5" /> SOS EMERGENCY
          </button>
          <Link to="/book-appointment" className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Book Appointment
          </Link>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Health Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" /> Health Vitals
            </h2>
            <button 
              onClick={() => setShowLogForm(!showLogForm)} 
              className="text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              {showLogForm ? 'Cancel' : 'Log Vitals'}
            </button>
          </div>

          {showLogForm && (
            <form onSubmit={handleLogVitals} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap gap-4 items-end animate-fade-in">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Heart Rate (bpm)</label>
                <input 
                  type="number" required min="30" max="250"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  value={vitalsForm.heart_rate}
                  onChange={(e) => setVitalsForm({...vitalsForm, heart_rate: e.target.value})}
                  placeholder="e.g. 72"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">SpO2 (%)</label>
                <input 
                  type="number" required min="50" max="100"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  value={vitalsForm.oxygen_level}
                  onChange={(e) => setVitalsForm({...vitalsForm, oxygen_level: e.target.value})}
                  placeholder="e.g. 98"
                />
              </div>
              <button type="submit" className="bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm">
                Save
              </button>
            </form>
          )}

          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading chart...</div>
          ) : healthStats.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Activity className="w-12 h-12 mb-3 opacity-20" />
              <p>No health data logged yet.</p>
              <p className="text-sm">Click 'Log Vitals' to add your first entry.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[90, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="heart_rate" name="Heart Rate (bpm)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="oxygen_level" name="SpO2 (%)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Visits</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{upcomingAppointments.length}</span>
          </div>
          <div className="flex-grow overflow-y-auto max-h-[300px]">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Clock className="w-10 h-10 text-slate-300 mb-3" />
                <p>No upcoming appointments.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <h4 className="font-semibold text-slate-900">Dr. {apt.doctor?.name || 'Unknown'}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(apt.date), 'PPP p')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
             <Link to="/book-appointment" className="text-sm font-semibold text-primary hover:text-blue-700">View All Calendar &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
