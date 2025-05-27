import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Supplier service for managing supplier profiles
 */
const supplierService = {
  /**
   * Register a new supplier
   * @param supplierData Supplier registration data
   * @returns Promise with response
   */
  registerSupplier: async (supplierData: any) => {
    const response = await axios.post(
      `${API_URL}/api/suppliers`,
      supplierData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get current supplier profile
   * @returns Promise with supplier profile
   */
  getSupplierProfile: async () => {
    const response = await axios.get(
      `${API_URL}/api/suppliers/me`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Update supplier profile
   * @param supplierData Supplier profile data
   * @returns Promise with response
   */
  updateSupplierProfile: async (supplierData: any) => {
    const response = await axios.put(
      `${API_URL}/api/suppliers/me`,
      supplierData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get all suppliers (admin only)
   * @param params Query parameters
   * @returns Promise with suppliers
   */
  getAllSuppliers: async (params: any = {}) => {
    const response = await axios.get(
      `${API_URL}/api/suppliers`,
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
   * Get supplier by ID (admin only)
   * @param id Supplier ID
   * @returns Promise with supplier
   */
  getSupplierById: async (id: string) => {
    const response = await axios.get(
      `${API_URL}/api/suppliers/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },
};

export default supplierService;