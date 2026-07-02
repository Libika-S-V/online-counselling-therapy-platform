import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, FileText, Briefcase, DollarSign, Image as ImageIcon, ArrowRight, MapPin, Globe, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const SignupPage = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [role, setRole] = useState('client'); // client or therapist
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', state: '', preferredLanguage: 'en',
    licenseNumber: '', licenseType: 'Psychology', specializations: '', languages: '', bio: '', experience: '', sessionFee: ''
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFile = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('phone', formData.phone);
    submitData.append('state', formData.state);
    submitData.append('preferredLanguage', formData.preferredLanguage);
    submitData.append('role', role);
    
    if (role === 'therapist') {
      submitData.append('licenseNumber', formData.licenseNumber);
      submitData.append('licenseType', formData.licenseType);
      submitData.append('specializations', formData.specializations);
      submitData.append('languages', formData.languages);
      submitData.append('bio', formData.bio);
      submitData.append('experience', formData.experience);
      submitData.append('sessionFee', formData.sessionFee);
    }
    
    if (file) submitData.append('profilePhoto', file);

    const res = await signup(submitData, true);
    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'therapist') navigate('/therapist');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <div className={`w-full ${role === 'therapist' ? 'max-w-3xl' : 'max-w-md'} bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all duration-300`}>
        {loading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center"><LoadingSpinner /></div>}
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">Create an Account</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join Serein today to begin your journey</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
          <button 
            type="button" 
            onClick={() => setRole('client')}
            className={`flex-1 py-2 font-medium rounded-lg transition-colors ${role === 'client' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            I'm a Client
          </button>
          <button 
            type="button" 
            onClick={() => setRole('therapist')}
            className={`flex-1 py-2 font-medium rounded-lg transition-colors ${role === 'therapist' ? 'bg-white dark:bg-slate-700 shadow-sm text-secondary-600 dark:text-secondary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            I'm a Therapist
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`grid gap-6 ${role === 'therapist' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Common Fields */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-800 dark:text-slate-200">Basic Info</h3>
              <InputField icon={User} label={t('auth.fullName') || "Full Name"} name="name" type="text" value={formData.name} onChange={handleChange} required />
              <InputField icon={Mail} label={t('auth.email') || "Email Address"} name="email" type="email" value={formData.email} onChange={handleChange} required />
              <InputField icon={Lock} label={t('auth.password') || "Password"} name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Min 8 chars, 1 uppercase, 1 number" />
              <InputField icon={Phone} label={t('auth.phone') || "Phone Number (10 digits)"} name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="e.g. 9876543210" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('auth.state') || "State"}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <select name="state" value={formData.state} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="">Select State</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Punjab">Punjab</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('auth.preferredLanguage') || "Preferred Language"}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-slate-400" />
                    </div>
                    <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                      <option value="kn">Kannada</option>
                      <option value="bn">Bengali</option>
                      <option value="mr">Marathi</option>
                      <option value="gu">Gujarati</option>
                      <option value="pa">Punjabi</option>
                      <option value="ur">Urdu</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Photo (Optional)</label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleFile} className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/50 dark:file:text-primary-400" />
                </div>
              </div>
            </div>

            {/* Therapist Only Fields */}
            {role === 'therapist' && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-800 dark:text-slate-200">Professional Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField icon={Briefcase} label="License Number" name="licenseNumber" type="text" value={formData.licenseNumber} onChange={handleChange} required />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Type</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CheckCircle className="h-5 w-5 text-slate-400" />
                      </div>
                      <select name="licenseType" value={formData.licenseType} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 outline-none">
                        <option value="Psychology">Psychology</option>
                        <option value="Counseling">Counseling</option>
                        <option value="Psychiatry">Psychiatry</option>
                        <option value="AYUSH-Yoga">AYUSH-Yoga</option>
                        <option value="AYUSH-Ayurveda">AYUSH-Ayurveda</option>
                      </select>
                    </div>
                  </div>
                </div>

                <InputField icon={Briefcase} label="Specializations (comma separated)" name="specializations" type="text" value={formData.specializations} onChange={handleChange} placeholder="e.g. Anxiety, Trauma" required />
                <InputField icon={FileText} label="Languages (comma separated)" name="languages" type="text" value={formData.languages} onChange={handleChange} placeholder="e.g. English, Spanish" />
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <InputField icon={Briefcase} label="Experience (Years)" name="experience" type="number" value={formData.experience} onChange={handleChange} required />
                  </div>
                  <div className="flex-1">
                    <InputField icon={DollarSign} label="Session Fee (₹)" name="sessionFee" type="number" value={formData.sessionFee} onChange={handleChange} required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Bio</label>
                  <textarea 
                    name="bio" required minLength={100} rows={4}
                    value={formData.bio} onChange={handleChange}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about your practice (min 100 chars)..."
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 text-white font-medium py-4 rounded-xl transition-colors shadow-md disabled:opacity-70 mt-4
              ${role === 'therapist' ? 'bg-secondary-600 hover:bg-secondary-700' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {role === 'therapist' ? (t('auth.signupTherapist') || "Register as Therapist") : (t('auth.signupClient') || "Complete Sign Up")} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

// Reusable Input Field
const InputField = ({ icon: Icon, label, name, type, value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <input 
        type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
      />
    </div>
  </div>
);

export default SignupPage;
