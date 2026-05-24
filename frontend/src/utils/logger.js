import axios from 'axios';
import { apiUrl } from '../config/api';

/**
 * Manually log an activity to the backend.
 * Useful for actions that happen primarily in localStorage.
 * 
 * @param {string} action - The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} resource - The resource affected (e.g., 'Bulty', 'Ledger')
 * @param {string} resourceId - Optional ID of the resource
 * @param {object} details - Optional details about the change
 */
export const logActivity = async (action, resource, resourceId = null, details = {}) => {
  try {
    // Check if user is logged in
    const storedUser = localStorage.getItem('abbasi-cable-user');
    if (!storedUser) return;
    
    const user = JSON.parse(storedUser);
    
    // We send a POST to the manual log endpoint
    await axios.post(apiUrl('/logs/manual'), {
      action,
      resource,
      resourceId,
      details: {
        ...details,
        source: 'frontend-manual'
      }
    });
  } catch (error) {
    console.error('Manual Log Error:', error);
  }
};
