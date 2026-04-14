import { notificationAPI } from './axiosConfig';

export const getMyNotifications = () =>
  notificationAPI.get('/me');

export const getNotificationById = (id) =>
  notificationAPI.get(`/${id}`);

export const getAdminLogs = () =>
  notificationAPI.get('/admin/logs');
