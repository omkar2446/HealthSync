import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, User, Clock } from 'lucide-react';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctor_id: '', date: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get('/patient/doctors');
        setDoctors(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, doctor_id: data[0].id }));
        }
      } catch (error) {
        toast.error('Failed to load doctors');
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctor_id || !formData.date) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/patient/appointments', formData);
      toast.success('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glass-effect p-8 rounded-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="bg-primary/10 p-3 rounded-xl">
            <CalendarIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>
            <p className="text-slate-500">Schedule a visit with our specialists</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Select Doctor
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              value={formData.doctor_id}
              onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
            >
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
