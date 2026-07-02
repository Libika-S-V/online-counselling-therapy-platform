import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Trash2, Save, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityPage = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/therapists/${user.id}`);
        // Initialize days if not present
        const currentAvail = res.data.availability || [];
        const initializedAvail = DAYS_OF_WEEK.map(day => {
          const existing = currentAvail.find(a => a.day === day);
          return existing ? existing : { day, slots: [] };
        });
        setAvailability(initializedAvail);
      } catch (err) {
        toast.error('Failed to load availability');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleAddSlot = (dayIndex) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots.push({ startTime: '09:00', endTime: '10:00', isBooked: false });
    setAvailability(newAvail);
  };

  const handleRemoveSlot = (dayIndex, slotIndex) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(newAvail);
  };

  const handleTimeChange = (dayIndex, slotIndex, field, value) => {
    const newAvail = [...availability];
    newAvail[dayIndex].slots[slotIndex][field] = value;
    setAvailability(newAvail);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/therapists/profile', { availability });
      toast.success('Availability updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-secondary-500" /> Manage Availability
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Set your weekly recurring schedule. Clients will see this when booking.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 whitespace-nowrap"
        >
          {saving ? 'Saving...' : 'Save Schedule'} <Save className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {availability.map((dayData, dayIndex) => (
          <div key={dayData.day} className="border-b border-slate-200 dark:border-slate-800 last:border-0 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-full md:w-1/4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{dayData.day}</h3>
                <p className="text-sm text-slate-500 mt-1">{dayData.slots.length} slot(s)</p>
              </div>
              
              <div className="w-full md:w-3/4 space-y-4">
                {dayData.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <input 
                      type="time" 
                      value={slot.startTime} 
                      onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                    <span className="text-slate-400">to</span>
                    <input 
                      type="time" 
                      value={slot.endTime} 
                      onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                    
                    <div className="flex-1"></div>
                    
                    {slot.isBooked ? (
                      <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded font-medium">Booked</span>
                    ) : (
                      <button 
                        onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  onClick={() => handleAddSlot(dayIndex)}
                  className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 font-medium text-sm hover:underline p-2"
                >
                  <Plus className="w-4 h-4" /> Add Time Slot
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityPage;
