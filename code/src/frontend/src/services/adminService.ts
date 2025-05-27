import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Admin service for administrative functions
 */
const adminService = {
  /**
   * Get all services with filtering (admin view)
   * @param params Query parameters
   * @returns Promise with services
   */
  getAllServices: async (params: any = {}) => {
    const response = await axios.get(
      `${API_URL}/api/admin/services`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        params,
      }
    );
    return response.data;
  },

  /**
   * Get service by ID (admin view)
   * @param id Service ID
   * @returns Promise with service
   */
  getServiceById: async (id: string) => {
    const response = await axios.get(
      `${API_URL}/api/admin/services/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Approve service
   * @param id Service ID
   * @returns Promise with response
   */
  approveService: async (id: string) => {
    const response = await axios.put(
      `${API_URL}/api/admin/services/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Reject service
   * @param id Service ID
   * @param reason Rejection reason
   * @returns Promise with response
   */
  rejectService: async (id: string, reason: string) => {
    const response = await axios.put(
      `${API_URL}/api/admin/services/${id}/reject`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },
};

export default adminService;