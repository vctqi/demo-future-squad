import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Contract service for managing service contracts
 */
const contractService = {
  /**
   * Create a new contract
   * @param contractData Contract data
   * @returns Promise with response
   */
  createContract: async (contractData: any) => {
    const response = await axios.post(
      `${API_URL}/api/contracts`,
      contractData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get all contracts for the current client
   * @returns Promise with contracts
   */
  getMyContracts: async () => {
    const response = await axios.get(
      `${API_URL}/api/contracts/my`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get contract by ID
   * @param id Contract ID
   * @returns Promise with contract
   */
  getContractById: async (id: string) => {
    const response = await axios.get(
      `${API_URL}/api/contracts/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Update contract status
   * @param id Contract ID
   * @param status New status
   * @returns Promise with response
   */
  updateContractStatus: async (id: string, status: string) => {
    const response = await axios.patch(
      `${API_URL}/api/contracts/${id}/status`,
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
   * Cancel contract
   * @param id Contract ID
   * @param reason Cancellation reason
   * @returns Promise with response
   */
  cancelContract: async (id: string, reason: string) => {
    const response = await axios.post(
      `${API_URL}/api/contracts/${id}/cancel`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get contract terms template
   * @param serviceId Service ID
   * @returns Promise with contract terms template
   */
  getContractTerms: async (serviceId: string) => {
    const response = await axios.get(
      `${API_URL}/api/contracts/terms/${serviceId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Mock payment processing (for demo purposes)
   * @param contractId Contract ID
   * @param paymentData Payment data
   * @returns Promise with response
   */
  processPayment: async (contractId: string, paymentData: any) => {
    const response = await axios.post(
      `${API_URL}/api/contracts/${contractId}/payment`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Sign contract
   * @param contractId Contract ID
   * @returns Promise with response
   */
  signContract: async (contractId: string) => {
    const response = await axios.post(
      `${API_URL}/api/contracts/${contractId}/sign`,
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
   * Get contract history
   * @param contractId Contract ID
   * @returns Promise with contract history
   */
  getContractHistory: async (contractId: string) => {
    const response = await axios.get(
      `${API_URL}/api/contracts/${contractId}/history`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    return response.data;
  },
};

export default contractService;