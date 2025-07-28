import apiClient from './client';

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
  is_active: boolean;
  can_delete: boolean;
}

export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await apiClient.get('/services/');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    throw error;
  }
};
