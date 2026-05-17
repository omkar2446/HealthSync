import { Link } from 'react-router-dom';
import { Shield, Clock, HeartPulse, Activity, ArrowRight, Video } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-slow" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mt-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 text-primary font-bold text-sm mb-10 shadow-sm animate-enter">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            HealthSync Pro is Live
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] leading-[1.1] font-extrabold tracking-tight text-slate-900 mb-8 animate-enter [animation-delay:100ms]">
            Modern Healthcare <br className="hidden md:block" />
            <span className="text-gradient">Tomorrow's Needs</span>
          </h1>
          
          <p className="mt-6 text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto font-medium leading-relaxed animate-enter [animation-delay:200ms]">
            Experience seamless healthcare management with AI-powered insights, secure records, and instant telemedicine access.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-enter [animation-delay:300ms]">
            <Link to="/register" className="group bg-slate-900 hover:bg-primary text-white px-10 py-5 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_50px_rgba(79,70,229,0.4)] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95">
              Get Started Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-10 py-5 rounded-full font-bold text-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center active:scale-95">
              Patient Portal Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white relative z-20 border-t border-slate-100 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Comprehensive Solutions</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Everything you need to manage your health in one secure, intelligent platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<HeartPulse className="w-10 h-10 text-rose-500" />}
              colorClass="bg-rose-50"
              title="AI Symptom Checker"
              description="Get instant insights into your symptoms powered by advanced AI before your appointment."
            />
            <FeatureCard 
              icon={<Video className="w-10 h-10 text-primary" />}
              colorClass="bg-indigo-50"
              title="Telemedicine Portal"
              description="Connect with top specialists instantly through crystal-clear video consultations."
            />
            <FeatureCard 
              icon={<Shield className="w-10 h-10 text-teal-500" />}
              colorClass="bg-teal-50"
              title="Secure Cloud Records"
              description="Your medical history, prescriptions, and reports are encrypted and stored safely."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, colorClass, title, description }) => (
  <div className="bg-white p-10 rounded-3xl shadow-editorial border border-slate-100/60 hover:-translate-y-3 transition-transform duration-300 group cursor-default">
    <div className={`w-20 h-20 ${colorClass} rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-2xl font-extrabold text-slate-900 mb-4">{title}</h3>
    <p className="text-lg text-slate-500 leading-relaxed font-medium">{description}</p>
  </div>
);

export default Home;
