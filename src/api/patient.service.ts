import apiClient from './apiClient'; // Import du client centralisé
import { Patient } from '../types/patient';

export class PatientService {
    // Utilise le client partagé
    private client = apiClient;

    async getPatients(): Promise<Patient[]> {
        const response = await this.client.get<Patient[]>('/patients');
        return response.data;
    }

    async getPatientById(id: number): Promise<Patient> {
        const response = await this.client.get<Patient>(`/patients/${id}`);
        return response.data;
    }

    async createPatient(patient: Patient): Promise<Patient> {
        const response = await this.client.post<Patient>('/patients', patient);
        return response.data;
    }

    async updatePatient(id: number, patient: Patient): Promise<Patient> {
        const response = await this.client.put<Patient>(`/patients/${id}`, patient);
        return response.data;
    }

    async deletePatient(id: number | undefined): Promise<void> {
        await this.client.delete(`/patients/${id}`);
    }
}

export const patientService = new PatientService();