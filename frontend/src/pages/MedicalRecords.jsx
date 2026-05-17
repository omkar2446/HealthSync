import { useState, useEffect } from 'react';
import api from '../lib/api';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data } = await api.get('/patient/records');
        setRecords(data);
      } catch (error) {
        console.error('Failed to fetch records:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="w-full bg-white rounded-3xl shadow-editorial border border-slate-100/60 p-8 md:p-12 animate-enter">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-teal-50 p-3 rounded-xl">
          <FileText className="w-8 h-8 text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-slate-600">Your prescriptions and diagnoses history</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="glass-effect rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center">
          <FileText className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-lg">No medical records found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map(record => (
            <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Diagnosis</h3>
                  <p className="text-slate-700 mt-1">{record.diagnosis}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-500 block">{format(new Date(record.created_at), 'PPP')}</span>
                  <span className="text-sm text-primary font-medium">Dr. {record.doctor?.name || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Prescription</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{record.prescription}</p>
              </div>

              {/* Future feature: Download PDF */}
              <div className="mt-4 flex justify-end">
                <button className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
