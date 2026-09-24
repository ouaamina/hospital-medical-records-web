import { App, Plugin } from 'vue';
import { patientService, PatientService } from './api/patient.service';
import PatientModal from './components/PatientModal';

export const HospitalMedicalRecordsPlugin: Plugin = {
    install(app: App): void {
        app.config.globalProperties.$patientService = patientService;
        app.provide<PatientService>('patientService', patientService);
        app.component('PatientModal', PatientModal);
    },
};

export { PatientModal };
export * from './types/patient';
export * from './api/patient.service';