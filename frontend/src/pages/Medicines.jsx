import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Pill, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ medicine_name: '', schedule: '' });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/patient/medicines');
      setMedicines(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicine_name || !formData.schedule) return;

    try {
      await api.post('/patient/medicines', formData);
      toast.success('Medicine reminder added!');
      setFormData({ medicine_name: '', schedule: '' });
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to add reminder');
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-editorial border border-slate-100/60 p-8 md:p-12 animate-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-teal-100 p-4 rounded-2xl">
          <Pill className="w-8 h-8 text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medicine Reminders</h1>
          <p className="text-slate-600 mt-1">Never miss a dose with smart alerts</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Medicine</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Medicine Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="e.g., Paracetamol 500mg"
                  value={formData.medicine_name}
                  onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Schedule (Time)</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="e.g., 08:00 AM, 08:00 PM"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-6"
              >
                <Plus className="w-5 h-5" /> Add Reminder
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading medicines...</div>
          ) : medicines.length === 0 ? (
            <div className="glass-effect rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
              <Pill className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg">No medicines added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicines.map((med) => (
                <div key={med.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Pill className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{med.medicine_name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        {med.schedule}
                      </div>
                    </div>
                  </div>
                  <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-teal-600 transition-colors">
                    <CheckCircle2 className="w-8 h-8" />
                    <span className="text-xs font-bold uppercase tracking-wider">Take</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Medicines;
