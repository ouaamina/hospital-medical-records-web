import apiClient from '../api/apiClient';
import { patientService } from '../api/patient.service';
import { Patient } from '../types/patient';

// Simulation (mock) du client Axios centralisé
jest.mock('../api/apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('PatientService', () => {
    // Données de test réutilisables
    const mockPatient: Patient = {
        id: 1,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        department: 'GENERAL',
        admissionDate: '2026-09-24'
    } as  Patient;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('devrait récupérer la liste de tous les patients (getPatients)', async () => {
        const mockList: Patient[] = [mockPatient];
        mockedApiClient.get.mockResolvedValueOnce({ data: mockList });

        const result = await patientService.getPatients();

        expect(mockedApiClient.get).toHaveBeenCalledWith('/patients');
        expect(result).toEqual(mockList);
    });

    it('devrait récupérer un patient par son ID (getPatientById)', async () => {
        mockedApiClient.get.mockResolvedValueOnce({ data: mockPatient });

        const result = await patientService.getPatientById(1);

        expect(mockedApiClient.get).toHaveBeenCalledWith('/patients/1');
        expect(result).toEqual(mockPatient);
    });

    it('devrait créer un nouveau patient (createPatient)', async () => {
        const newPatient: Patient = { firstName: 'Alice', lastName: 'Martin' } as Patient;
        const createdPatient: Patient = { id: 2, ...newPatient };

        mockedApiClient.post.mockResolvedValueOnce({ data: createdPatient });

        const result = await patientService.createPatient(newPatient);

        expect(mockedApiClient.post).toHaveBeenCalledWith('/patients', newPatient);
        expect(result).toEqual(createdPatient);
    });

    it('devrait mettre à jour un patient (updatePatient)', async () => {
        const updatedPatientData: Patient = { ...mockPatient, firstName: 'Jean-Paul' };
        mockedApiClient.put.mockResolvedValueOnce({ data: updatedPatientData });

        const result = await patientService.updatePatient(1, updatedPatientData);

        expect(mockedApiClient.put).toHaveBeenCalledWith('/patients/1', updatedPatientData);
        expect(result).toEqual(updatedPatientData);
    });

    it('devrait supprimer un patient par son ID (deletePatient)', async () => {
        mockedApiClient.delete.mockResolvedValueOnce({ data: null });

        await patientService.deletePatient(1);

        expect(mockedApiClient.delete).toHaveBeenCalledWith('/patients/1');
    });

    it('devrait propager les erreurs en cas d’échec de l’API', async () => {
        const errorMessage = 'Erreur réseau';
        mockedApiClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(patientService.getPatients()).rejects.toThrow(errorMessage);
    });
});