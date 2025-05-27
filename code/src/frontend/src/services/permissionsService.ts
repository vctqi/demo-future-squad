import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Permissions service for managing user roles and permissions
 */
const permissionsService = {
  /**
   * Get current user permissions
   * @returns Promise with user permissions
   */
  getUserPermissions: async () => {
    const response = await axios.get(`${API_URL}/api/permissions/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    return response.data;
  },

  /**
   * Update user role (admin only)
   * @param userId User ID
   * @param role New role
   * @returns Promise with response
   */
  updateUserRole: async (userId: string, role: string) => {
    const response = await axios.put(
      `${API_URL}/api/permissions/users/${userId}/role`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Approve supplier (admin only)
   * @param supplierId Supplier ID
   * @returns Promise with response
   */
  approveSupplier: async (supplierId: string) => {
    const response = await axios.put(
      `${API_URL}/api/permissions/suppliers/${supplierId}/approve`,
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
   * Reject supplier (admin only)
   * @param supplierId Supplier ID
   * @param reason Rejection reason
   * @returns Promise with response
   */
  rejectSupplier: async (supplierId: string, reason: string) => {
    const response = await axios.put(
      `${API_URL}/api/permissions/suppliers/${supplierId}/reject`,
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

export default permissionsService;