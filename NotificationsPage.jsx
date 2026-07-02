import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Bell, CheckCheck, Trash2, AlertCircle, Calendar, MessageSquare, DollarSign, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const NOTIFICATION_ICONS = {
  appointment_confirmed: { icon: Calendar, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  appointment_cancelled: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  appointment_reminder: { icon: Calendar, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  therapist_approved: { icon: UserCheck, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  therapist_rejected: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  payment_success: { icon: DollarSign, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
  new_message: { icon: MessageSquare, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  announcement: { icon: Bell, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  default: { icon: Bell, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', { params: { page: pageNum, limit: 20 } });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(page); }, [page]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to update notifications.');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted.');
    } catch {
      toast.error('Failed to delete notification.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <EmptyState message="You're all caught up! No notifications yet." />
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => {
            const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;
            const Icon = config.icon;
            return (
              <div key={notification._id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  notification.isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.isRead && (
                    <button onClick={() => markAsRead(notification._id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Read
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notification._id)}
                    className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
            {page} / {pagination.pages}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
