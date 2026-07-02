import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Video, MessageCircle, ShieldCheck, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 -translate-y-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-400/20 dark:bg-primary-600/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute top-40 translate-x-1/3 w-[600px] h-[300px] bg-secondary-400/20 dark:bg-secondary-600/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium text-sm mb-8 border border-primary-100 dark:border-primary-800/50">
          <Sparkles className="w-4 h-4" />
          <span>Your safe space for mental wellness</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-outfit font-bold text-slate-900 dark:text-white tracking-tight max-w-4xl leading-tight mb-6">
          Find clarity and peace with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">expert therapy.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10">
          Connect with licensed professionals for secure, confidential video and chat sessions. Your journey to better mental health starts here.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/therapists" className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-lg hover:shadow-primary-600/25">
            Find a Therapist <ArrowRight className="w-5 h-5" />
          </Link>
          {!user && (
            <Link to="/signup" className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-sm">
              I'm a Therapist
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950/50 rounded-3xl mb-24 border border-slate-100 dark:border-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-4">How Serein Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">A seamless experience designed around your privacy and comfort.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Calendar} 
              title="1. Book a Session" 
              desc="Browse verified therapists, filter by your needs, and instantly book an available time slot."
              color="text-secondary-500"
              bg="bg-secondary-50 dark:bg-secondary-900/20"
            />
            <FeatureCard 
              icon={Video} 
              title="2. Connect Securely" 
              desc="Join high-quality video calls or private text chats directly within the platform."
              color="text-primary-500"
              bg="bg-primary-50 dark:bg-primary-900/20"
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="3. Grow Safely" 
              desc="Your data is encrypted. Track your mood, manage your sessions, and prioritize your well-being."
              color="text-emerald-500"
              bg="bg-emerald-50 dark:bg-emerald-900/20"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color, bg }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center mb-6`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
