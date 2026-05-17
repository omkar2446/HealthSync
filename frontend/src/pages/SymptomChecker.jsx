import { useState } from 'react';
import api from '../lib/api';
import { Activity, Search, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/patient/symptom-checker', { symptoms });
      setResult(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-editorial border border-slate-100/60 p-8 md:p-12 animate-enter">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <Activity className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">AI Symptom Checker</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Describe how you're feeling, and our smart AI will suggest possible conditions and precautions. 
          Remember, this does not replace a professional medical diagnosis.
        </p>
      </div>

      <div className="glass-effect rounded-3xl p-8 shadow-lg mb-8 border border-white/50">
        <form onSubmit={handleCheck}>
          <div className="relative">
            <textarea
              className="w-full px-6 py-5 bg-white border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-purple-500 transition-colors text-lg resize-none pr-16"
              rows={4}
              placeholder="E.g., I have a severe headache since morning and mild fever..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 font-medium leading-relaxed">{result.warning}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Possible Conditions
              </h3>
              <ul className="space-y-3">
                {result.diseases.map((disease, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    {disease}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-500" /> Precautions
              </h3>
              <ul className="space-y-3">
                {result.precautions.map((prec, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    {prec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
