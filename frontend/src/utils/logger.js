import axios from 'axios';

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
    // We send a POST to a dedicated log endpoint
    // Since the audit middleware only logs requests to actual API resources,
    // we might need a separate endpoint for manual frontend logs.
    // However, for now, let's just use the backend's log recording logic.
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('abbasi-cable-user');
    if (!storedUser) return;
    
    const user = JSON.parse(storedUser);
    
    // We can hit a dummy endpoint or a specific one
    await axios.post('http://localhost:5000/api/logs/manual', {
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
