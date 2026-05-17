import { Link } from 'react-router-dom';
import { Shield, Clock, HeartPulse, Activity } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-teal-50 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
              Modern Healthcare for <br/>
              <span className="gradient-text">Tomorrow's Needs</span>
            </h1>
            <p className="mt-4 text-xl text-slate-600 mb-10">
              Experience seamless healthcare management with AI-powered insights, secure records, and instant telemedicine access.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                Get Started
              </Link>
              <Link to="/login" className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-full font-medium text-lg shadow-sm hover:shadow-md transition-all">
                Patient Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Comprehensive Health Solutions</h2>
            <p className="mt-4 text-lg text-slate-600">Everything you need to manage your health in one secure place.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<HeartPulse className="w-8 h-8 text-rose-500" />}
              title="AI Symptom Checker"
              description="Get instant insights into your symptoms powered by advanced AI before your appointment."
            />
            <FeatureCard 
              icon={<Clock className="w-8 h-8 text-primary" />}
              title="Instant Booking"
              description="Book, reschedule, or cancel appointments with top doctors 24/7."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-teal-500" />}
              title="Secure Records"
              description="Your medical history and reports are encrypted and stored safely on the cloud."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-effect p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300">
    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export default Home;
