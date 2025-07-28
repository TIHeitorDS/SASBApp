import apiClient from './client';
import type { Employee } from './employees';

export const getMe = async (): Promise<Employee> => {
  try {
    const response = await apiClient.get('/me/');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error);
    throw error;
  }
};
