import apiClient from './client';

export interface CreateAppointment {
  client_name: string;
  client_contact: string;
  service_id: number;
  employee_id: number;
  start_time: string;
  notes?: string;
}

export interface UpdateAppointment {
  client_name?: string;
  client_contact?: string;
  service_id?: number;
  employee_id?: number;
  start_time?: string;
  notes?: string;
  status?: string;
}

export interface Appointment {
  id: number;
  client_name: string;
  client_contact: string;
  service: {
    id: number;
    name: string;
    duration: number;
    price: string;
  };
  employee: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: string;
  };
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get('/appointments/');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    throw error;
  }
};

export const getAppointment = async (id: number): Promise<Appointment> => {
  try {
    const response = await apiClient.get(`/appointments/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    throw error;
  }
};

export const createAppointment = async (appointmentData: CreateAppointment): Promise<Appointment> => {
  try {
    const response = await apiClient.post('/appointments/', appointmentData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    throw error;
  }
};

export const updateAppointment = async (id: number, appointmentData: UpdateAppointment): Promise<Appointment> => {
  try {
    const response = await apiClient.patch(`/appointments/${id}/`, appointmentData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    throw error;
  }
};

export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/appointments/${id}/`);
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    throw error;
  }
};
