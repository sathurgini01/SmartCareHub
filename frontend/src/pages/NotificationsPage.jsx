import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import ShellLayout from '../components/common/ShellLayout';
import PageBanner from '../components/common/PageBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiMessageSquare, FiCheckCircle, FiTrash2, FiClock } from 'react-icons/fi';

const NOTIF_URL = 'http://localhost:5000/api/notifications';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${NOTIF_URL}/me?userId=${user.id}`);
      setNotifications(res.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${NOTIF_URL}/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await axios.delete(`${NOTIF_URL}/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = () => {
    return <FiClock />;
  };

  if (loading) return <LoadingSpinner label="Loading your notifications..." />;

  return (
    <ShellLayout>
      <PageBanner 
        eyebrow="Communication Center"
        title="Notifications"
        subtitle="Keep track of your appointments, consultations, and system alerts."
      />

      <div className="notifications-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '3rem', color: '#475569', marginBottom: '20px' }}>🔔</div>
            <h3 style={{ color: '#f1f5f9' }}>No notifications yet</h3>
            <p style={{ color: '#94a3b8' }}>When you book appointments or receive updates, they will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`card notification-card ${!notif.isRead ? 'unread' : ''}`}
                style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  padding: '20px',
                  borderLeft: notif.isRead ? '1px solid #1e293b' : '4px solid #16a34a',
                  background: notif.isRead ? 'rgba(15, 23, 42, 0.6)' : 'rgba(22, 163, 74, 0.05)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={() => !notif.isRead && markAsRead(notif._id)}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#1e293b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  color: notif.isRead ? '#64748b' : '#16a34a',
                  flexShrink: 0
                }}>
                  {getIcon(notif.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700 }}>{notif.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock /> {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Badge 
                        status={notif.category.includes('completion') ? 'success' : 'info'} 
                        text={notif.category.replace(/_/g, ' ').toUpperCase()} 
                      />
                    </div>
                    <button 
                      onClick={() => deleteNotif(notif._id)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
                      title="Delete notification"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .notification-card:hover {
          transform: translateX(4px);
          background: rgba(30, 41, 59, 0.8) !important;
        }
        .notification-card.unread {
          box-shadow: 0 0 15px rgba(22, 163, 74, 0.1);
        }
      `}</style>
    </ShellLayout>
  );
};

export default NotificationsPage;
