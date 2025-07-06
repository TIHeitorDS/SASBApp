import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface EmployeeData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export const createEmployee = async (employeeData: EmployeeData) => {
  try {
    const response = await apiClient.post('/employees/', employeeData);
    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export default apiClient;