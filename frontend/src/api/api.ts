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

export interface CreateEmployee {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateEmployee {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export interface Employee {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
}

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await apiClient.get('/employees/');
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const createEmployee = async (employeeData: CreateEmployee) => {
  try {
    const response = await apiClient.post('/employees/', employeeData);
    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export default apiClient;