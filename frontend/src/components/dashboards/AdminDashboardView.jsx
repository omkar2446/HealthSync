import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Users, Calendar as CalendarIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardView = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({ total_users: 0, total_appointments: 0 });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [analyticsRes, usersRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/users')
        ]);
        setAnalytics(analyticsRes.data);
        setUsersList(usersRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
        <p className="text-slate-600 mt-1">System overview and user management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-effect p-6 rounded-2xl border-l-4 border-l-purple-500">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{analytics.total_users}</h3>
            </div>
          </div>
        </div>
        
        <div className="glass-effect p-6 rounded-2xl border-l-4 border-l-orange-500">
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Appointments</p>
              <h3 className="text-2xl font-bold text-slate-900">{analytics.total_appointments}</h3>
            </div>
          </div>
        </div>

        <div className="glass-effect p-6 rounded-2xl border-l-4 border-l-red-500">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">System Status</p>
              <h3 className="text-lg font-bold text-green-600">Healthy</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardView;
