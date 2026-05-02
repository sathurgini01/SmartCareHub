import { apiRequest } from '../api';
import { getSession } from './storage';

function getToken() {
  return getSession()?.token || '';
}

/**
 * Patient Admin Service
 * Handles administrative actions related to patients.
 */

export async function getAllPatients() {
  try {
    const response = await apiRequest('/patients/admin/all', { 
      token: getToken() 
    });
    
    // The backend returns an array directly: res.json(patients)
    // We should return it as { data: patients } for consistency with components
    if (Array.isArray(response)) {
      return { data: response };
    }
    
    if (response && response.data) {
      return response;
    }
    
    return { data: [] };
  } catch (error) {
    console.error('Error fetching all patients:', error);
    throw error;
  }
}

export async function getPatientById(id) {
  return await apiRequest(`/patients/admin/${id}`, { 
    token: getToken() 
  });
}

export async function updatePatient(id, updates) {
  return await apiRequest(`/patients/admin/update/${id}`, {
    method: 'PUT',
    body: updates,
    token: getToken()
  });
}

export async function deletePatient(id) {
  return await apiRequest(`/patients/admin/delete/${id}`, {
    method: 'DELETE',
    token: getToken()
  });
}

export async function getPatientPrescriptions(patientId) {
  return await apiRequest(`/patients/admin/patient/${patientId}/prescriptions`, {
    token: getToken()
  });
}
