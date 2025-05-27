import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Service service for managing services
 */
const serviceService = {
  /**
   * Create a new service
   * @param serviceData Service data
   * @returns Promise with response
   */
  createService: async (serviceData: any) => {
    const response = await axios.post(
      `${API_URL}/api/services`,
      serviceData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get supplier's services
   * @returns Promise with services
   */
  getMyServices: async () => {
    const response = await axios.get(
      `${API_URL}/api/services/my`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get service by ID
   * @param id Service ID
   * @returns Promise with service
   */
  getServiceById: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/services/${id}`);
    return response.data;
  },

  /**
   * Update service
   * @param id Service ID
   * @param serviceData Service data
   * @returns Promise with response
   */
  updateService: async (id: string, serviceData: any) => {
    const response = await axios.put(
      `${API_URL}/api/services/${id}`,
      serviceData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Delete service
   * @param id Service ID
   * @returns Promise with response
   */
  deleteService: async (id: string) => {
    const response = await axios.delete(
      `${API_URL}/api/services/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },
  
  /**
   * Update service status (activate/deactivate)
   * @param id Service ID
   * @param status New status (ACTIVE or INACTIVE)
   * @returns Promise with response
   */
  updateServiceStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    const response = await axios.patch(
      `${API_URL}/api/services/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get all services with filtering
   * @param params Query parameters
   * @returns Promise with services
   */
  getAllServices: async (params: any = {}) => {
    const response = await axios.get(
      `${API_URL}/api/services`,
      { params }
    );
    return response.data;
  },

  /**
   * Get all categories
   * @returns Promise with categories
   */
  getAllCategories: async () => {
    const response = await axios.get(`${API_URL}/api/services/categories`);
    return response.data;
  },

  /**
   * Upload service image (simulated)
   * @param file Image file
   * @returns Promise with image URL
   */
  uploadImage: async (file: File) => {
    // This is a mock implementation as we don't have a real file upload endpoint
    // In a real application, this would upload to S3, Azure Blob, etc.
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a fake URL for the uploaded image
        const fakeUrl = `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/800/600`;
        resolve({ url: fakeUrl });
      }, 1000);
    });
  },
};

export default serviceService;