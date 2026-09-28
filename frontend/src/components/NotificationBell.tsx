import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink, Mail, Send, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'OFFER' | 'REJECT';
  emailSubject?: string;
  emailHtml?: string;
  emailStatus: 'SENT' | 'PENDING' | 'FAILED';
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // Ignore network errors on background poll
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await api.post('/notifications/test-email', {
        to: 'prathmeshchopade96@gmail.com',
      });
      setTestEmailResult({
        success: res.data.success,
        message: res.data.message || 'Test email dispatched successfully!',
      });
      fetchNotifications();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setTestEmailResult({
        success: false,
        message: axiosErr.response?.data?.message || 'SMTP request failed.',
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
      case 'OFFER':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'REJECT':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        title="Notifications & Emails"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">Notifications & Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Admin Email Quick Test Banner */}
          {isAdmin && (
            <div className="px-4 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between gap-2 text-xs">
              <span className="text-blue-900 font-medium truncate">
                Live Gmail: <strong className="font-semibold">prathmeshchopade96@gmail.com</strong>
              </span>
              <button
                disabled={isTestingEmail}
                onClick={handleTestEmail}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                {isTestingEmail ? 'Sending...' : 'Test Send'}
              </button>
            </div>
          )}

          {testEmailResult && (
            <div
              className={`px-4 py-2 text-xs border-b ${
                testEmailResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testEmailResult.message}
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNotif(n)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${
                    !n.isRead ? 'bg-blue-50/30 font-medium' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 flex-shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                    {n.emailSubject && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        <Mail className="w-2.5 h-2.5" /> Email Preview Available
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Email / Notification Preview Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">Dispatched Email & Notification Details</span>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Title</span>
                <p className="text-base font-bold text-slate-900">{selectedNotif.title}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Message</span>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedNotif.message}
                </p>
              </div>

              {selectedNotif.emailSubject && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Email Subject
                  </span>
                  <p className="text-sm font-semibold text-blue-800">{selectedNotif.emailSubject}</p>
                </div>
              )}

              {selectedNotif.emailHtml && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Official Email Template Dispatched to Student
                  </span>
                  <div
                    className="border border-slate-200 rounded-xl p-4 bg-white shadow-inner max-h-72 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedNotif.emailHtml }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>Status: <strong className="text-slate-700">{selectedNotif.emailStatus}</strong></span>
                <span>{new Date(selectedNotif.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationBell;
