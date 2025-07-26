import apiClient from './client';

export interface CreateEmployee {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
}

export interface UpdateEmployee {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  username?: string;
  phone?: string;
  role?: string;
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
    console.error("Erro ao buscar funcionários:", error);
    throw error;
  }
};

export const getProfessionals = async (): Promise<Employee[]> => {
  try {
    const response = await apiClient.get('/professionals/');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    throw error;
  }
};

export const getUsersByRole = async (roles: string[]): Promise<Employee[]> => {
  try {
    const response = await apiClient.get('/users/', {
      params: {
        role: roles.join(',')
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuários por papel:", error);
    throw error;
  }
};

export const getEmployee = async (id: number): Promise<Employee> => {
  try {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    throw error;
  }
};

export const updateEmployee = async (id: number, employeeData: UpdateEmployee): Promise<Employee> => {
  try {
    const response = await apiClient.patch(`/users/${id}/`, employeeData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    throw error;
  }
};

export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}/`);
  } catch (error) {
    console.error("Erro ao deletar funcionário:", error);
    throw error;
  }
};

export const createUser = async (userData: CreateEmployee) => {
  try {
    let endpoint = '';
    if (userData.role === 'EMPLOYEE') {
      endpoint = '/employees/';
    } else if (userData.role === 'PROFESSIONAL') {
      endpoint = '/professionals/';
    } else {
      endpoint = '/users/'; 
    }
    const response = await apiClient.post(endpoint, userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};
