import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X } from 'lucide-react';
import { fetchNotifications, markAsRead, markAllRead } from '../../redux/slices/notificationSlice';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
  'task-assigned': '📋',
  'submission-reviewed': '✅',
  'submission-approved': '🎉',
  'submission-rejected': '❌',
  'certificate-ready': '🏆',
  'internship-update': '📢',
  'welcome': '👋',
  'enrollment-confirmed': '🚀',
  'achievement-unlocked': '⚡',
  'mentor-message': '💬',
};

export default function NotificationPanel({ onClose }) {
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector(s => s.notifications);
  const ref = useRef();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAll = () => dispatch(markAllRead());
  const handleRead = (id) => dispatch(markAsRead(id));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      className="absolute right-0 top-full mt-2 w-80 card shadow-2xl z-50 overflow-hidden"
      style={{ maxHeight: '480px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-400" />
          <span className="text-white font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="badge-brand text-xs px-1.5 py-0.5">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="btn-ghost p-1 text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <CheckCheck size={13} /> All read
            </button>
          )}
          <button onClick={onClose} className="btn-ghost p-1.5 text-gray-400">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10">
            <Bell size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {items.map(notif => (
              <div
                key={notif._id}
                onClick={() => { if (!notif.isRead) handleRead(notif._id); }}
                className={`px-4 py-3 cursor-pointer hover:bg-surface-elevated/60 transition-colors ${!notif.isRead ? 'bg-brand-500/5' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{TYPE_ICONS[notif.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-xs font-medium leading-snug">{notif.title}</p>
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                    {notif.actionUrl && (
                      <Link
                        to={notif.actionUrl}
                        className="text-brand-400 text-xs hover:text-brand-300 mt-1 inline-block"
                        onClick={onClose}
                      >
                        {notif.actionLabel || 'View →'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
