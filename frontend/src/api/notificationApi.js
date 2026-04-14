import { notificationAPI } from './axiosConfig';

// Backend requires ?userId=xxx
export const getMyNotifications = (userId) =>
  notificationAPI.get('/me', { params: { userId } });

export const getNotificationById = (id) =>
  notificationAPI.get(`/${id}`);

export const getAdminLogs = () =>
  notificationAPI.get('/admin/logs');
