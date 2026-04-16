import React from 'react';
import { getStatusBadge } from '../../utils/formatters';

const AppointmentStatus = ({ status }) => {
  return <span className={`badge ${getStatusBadge(status)}`}>{status}</span>;
};
export default AppointmentStatus;
