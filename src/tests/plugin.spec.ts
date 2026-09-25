import { createApp } from 'vue';
import { HospitalMedicalRecordsPlugin, PatientModal } from '../index';

describe('HospitalMedicalRecordsPlugin', () => {
    it('installe correctement le plugin dans une application Vue 3', () => {
        const app = createApp({});
        app.use(HospitalMedicalRecordsPlugin);

        // Vérification de l'injection globale et du composant
        expect(app.config.globalProperties.$patientService).toBeDefined();
        expect(app.component('PatientModal')).toBeDefined();
    });

    it('exporte les composants et services', () => {
        expect(PatientModal).toBeDefined();
    });
});