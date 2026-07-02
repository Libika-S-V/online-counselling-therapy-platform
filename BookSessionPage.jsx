import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Video, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import RazorpayCheckout from '../components/RazorpayCheckout';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const BookSessionPage = () => {
  const { t } = useTranslation();
  const { id } = useParams(); // Therapist userId
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);

  // Booking State
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('video'); // Default

  // Generate next 14 days for selection
  const today = startOfToday();
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/therapists/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching therapist:', err);
        setError('Failed to load therapist availability.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !sessionType) {
      toast.error('Please select a date, time slot, and session type.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/appointments', {
        therapistId: profile.userId._id,
        sessionType,
        date: selectedDate.toISOString(),
        timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`
      });
      
      if (response.data.razorpayOrder) {
        setOrderData(response.data.razorpayOrder);
        setAppointmentId(response.data.appointment._id);
        toast.success(t('booking.orderCreated') || 'Booking initiated. Please complete payment.');
      } else {
        // Fallback if no payment gateway
        toast.success(t('booking.success') || 'Session booked successfully!');
        navigate('/appointments');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="py-12"><ErrorMessage message={error} /></div>;

  // Determine available slots for selected date
  let daySlots = [];
  if (selectedDate && profile) {
    const dayOfWeek = format(selectedDate, 'EEEE'); // e.g. "Monday"
    const daySchedule = profile.availability.find(d => d.day === dayOfWeek);
    if (daySchedule) {
      daySlots = daySchedule.slots.filter(s => !s.isBooked);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          {profile.userId?.profilePhoto ? (
            <img src={profile.userId.profilePhoto.startsWith('http') ? profile.userId.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${profile.userId.profilePhoto}`} alt="Therapist" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 text-primary-600 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">{t('booking.title') || "Book a Session"}</h1>
            <p className="text-slate-600 dark:text-slate-400">with {profile.userId?.name}</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-10">
          {/* Step 1: Select Date */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm">1</span>
              {t('booking.selectDate') || "Select Date"}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
              {upcomingDays.map((date, idx) => {
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const dayName = format(date, 'EEE');
                const dayNum = format(date, 'd');
                const month = format(date, 'MMM');
                
                // Check if therapist has any slots for this day of week
                const fullDayName = format(date, 'EEEE');
                const hasSchedule = profile.availability.some(d => d.day === fullDayName && d.slots.length > 0);

                return (
                  <button
                    key={idx}
                    disabled={!hasSchedule}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all ${
                      !hasSchedule ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20' :
                      isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' :
                      'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm font-medium">{dayName}</span>
                    <span className="text-2xl font-bold my-1">{dayNum}</span>
                    <span className="text-xs uppercase tracking-wider">{month}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Select Time Slot */}
          <section className={`transition-opacity duration-300 ${!selectedDate ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm">2</span>
              {t('booking.selectTime') || "Select Time"}
            </h2>
            
            {!selectedDate ? (
              <p className="text-slate-500 italic">Please select a date first.</p>
            ) : daySlots.length === 0 ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-800/30">
                No available slots for this date. Please select another day.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {daySlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-slate-900 font-medium' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Clock className="w-4 h-4" /> {slot.startTime}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Step 3: Session Type & Confirm */}
          <section className={`transition-opacity duration-300 ${!selectedSlot ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm">3</span>
              Session Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('booking.sessionType') || "Session Format"}</label>
                <div className="flex gap-4">
                  {profile?.sessionType.includes('video') || profile?.sessionType.includes('both') ? (
                    <button
                      onClick={() => setSessionType('video')}
                      className={`flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-xl border transition-all ${
                        sessionType === 'video' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <Video className="w-6 h-6 mb-2" />
                      <span className="font-medium">{t('booking.video') || "Video Call"}</span>
                    </button>
                  ) : null}
                  
                  {profile?.sessionType.includes('chat') || profile?.sessionType.includes('both') ? (
                    <button
                      onClick={() => setSessionType('chat')}
                      className={`flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-xl border transition-all ${
                        sessionType === 'chat' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <MessageSquare className="w-6 h-6 mb-2" />
                      <span className="font-medium">{t('booking.chat') || "Live Chat"}</span>
                    </button>
                  ) : null}
                </div>
              </div>

              {!orderData ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Booking Summary</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <p>Date: <span className="font-medium text-slate-900 dark:text-white">{selectedDate ? format(selectedDate, 'PPP') : '—'}</span></p>
                      <p>Time: <span className="font-medium text-slate-900 dark:text-white">{selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : '—'}</span></p>
                      <p>Fee: <span className="font-medium text-slate-900 dark:text-white">₹{profile?.sessionFee}</span></p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBooking}
                    disabled={submitting || !selectedDate || !selectedSlot}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Initiating...' : 'Confirm & Proceed to Payment'} <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <RazorpayCheckout 
                  orderDetails={orderData} 
                  appointmentId={appointmentId}
                  onPaymentSuccess={() => navigate('/appointments')} 
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BookSessionPage;
