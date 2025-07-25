import apiClient from './client';

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
  username?: string;
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
    console.error("Erro ao buscar funcionários:", error);
    throw error;
  }
};

export const getEmployee = async (id: number): Promise<Employee> => {
  try {
    const response = await apiClient.get(`/employees/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    throw error;
  }
};

export const updateEmployee = async (id: number, employeeData: UpdateEmployee): Promise<Employee> => {
  try {
    const response = await apiClient.patch(`/employees/${id}/`, employeeData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    throw error;
  }
};

export const createEmployee = async (employeeData: CreateEmployee) => {
  try {
    const response = await apiClient.post('/employees/', employeeData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    throw error;
  }
};

export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/employees/${id}/`);
  } catch (error) {
    console.error("Erro ao deletar funcionário:", error);
    throw error;
  }
};
