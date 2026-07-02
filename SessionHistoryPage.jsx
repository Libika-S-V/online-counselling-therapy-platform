import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  History, Calendar, Clock, Video, MessageSquare, FileText,
  ChevronDown, ChevronUp, Star, User, Download
} from 'lucide-react';

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
};

const SessionHistoryPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [appRes, assRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/assessments/my')
        ]);
        setAppointments(appRes.data.filter(a => a.status === 'completed'));
        setAssessments(assRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const downloadInvoice = async (appointmentId) => {
    try {
      const invoiceRes = await api.get(`/invoices/appointment/${appointmentId}`);
      const pdfRes = await api.get(`/invoices/${invoiceRes.data._id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Invoice might not exist
    }
  };

  const SEVERITY_DOT = {
    Minimal: 'bg-green-500', Low: 'bg-green-500', Good: 'bg-green-500',
    Mild: 'bg-yellow-500', Moderate: 'bg-orange-500', High: 'bg-orange-500',
    'Moderately Severe': 'bg-red-500', Severe: 'bg-red-600', 'Very Low': 'bg-red-600'
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Session History</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'sessions', label: '🗓 Past Sessions', count: appointments.length },
          { id: 'assessments', label: '🧠 Assessments', count: assessments.length }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}>
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Past Sessions */}
          {activeTab === 'sessions' && (
            appointments.length === 0
              ? <EmptyState message="No completed sessions yet. Book your first session to get started." />
              : (
                <div className="space-y-4">
                  {appointments.map(apt => {
                    const isExpanded = expandedId === apt._id;
                    const therapist = user.role === 'client' ? apt.therapistId : apt.clientId;
                    return (
                      <div key={apt._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          onClick={() => setExpandedId(isExpanded ? null : apt._id)}>
                          <div className="flex items-center gap-4">
                            {therapist?.profilePhoto ? (
                              <img src={therapist.profilePhoto.startsWith('http') ? therapist.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${therapist.profilePhoto}`}
                                alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-indigo-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {user.role === 'client'
                                  ? `Session with Dr. ${therapist?.name || 'Therapist'}`
                                  : `Client: ${therapist?.name || 'Client'}`}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(apt.date), 'dd MMM yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {apt.timeSlot}
                                </span>
                                <span className="flex items-center gap-1">
                                  {apt.sessionType === 'video' ? <Video className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                                  {apt.sessionType}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_STYLES[apt.status]}`}>
                              {apt.status}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">₹{apt.fee}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              {apt.clientSummary && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Session Summary
                                  </h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{apt.clientSummary}</p>
                                </div>
                              )}
                              <div className="flex flex-col gap-3">
                                <Link to={`/book/${apt.therapistId?._id}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors text-center justify-center">
                                  <Calendar className="w-4 h-4" /> Book Follow-up
                                </Link>
                                <button onClick={() => downloadInvoice(apt._id)}
                                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors justify-center">
                                  <Download className="w-4 h-4" /> Download Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
          )}

          {/* Assessment History */}
          {activeTab === 'assessments' && (
            assessments.length === 0
              ? <EmptyState message="No assessments taken yet. Take your first assessment to track your progress." />
              : (
                <div className="space-y-4">
                  {assessments.map(assessment => {
                    const dotColor = SEVERITY_DOT[assessment.severity] || 'bg-slate-400';
                    return (
                      <div key={assessment._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{assessment.type} Assessment</p>
                              <p className="text-sm text-slate-500">{format(new Date(assessment.completedAt), 'dd MMM yyyy, hh:mm a')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{assessment.totalScore}</p>
                            <p className={`text-sm font-semibold ${
                              ['Severe', 'Moderately Severe', 'High', 'Very Low'].includes(assessment.severity)
                                ? 'text-red-600' : ['Mild', 'Moderate'].includes(assessment.severity)
                                ? 'text-orange-600' : 'text-green-600'
                            }`}>{assessment.severity}</p>
                          </div>
                        </div>
                        <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{assessment.interpretation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          )}
        </>
      )}
    </div>
  );
};

export default SessionHistoryPage;
