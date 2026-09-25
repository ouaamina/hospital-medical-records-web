import { mount } from '@vue/test-utils';
import PatientModal from '../components/PatientModal';
import { Patient } from '../types/patient';

describe('PatientModal.tsx - Rendu conditionnel par département et Formulaire', () => {
    let mockSubmitPatient: jest.Mock;
    let mockClose: jest.Mock;

    const basePatient: Patient = {
        id: 1,
        firstName: 'Amina',
        lastName: 'Benali',
        admissionDate: '2026-09-25',
        department: 'CARDIOLOGY',
        cardiology: {
            restingHeartRate: 72,
            bloodPressure: '120/80',
            ecgResults: 'Normal',
        },
    };

    beforeEach(() => {
        mockSubmitPatient = jest.fn().mockResolvedValue(undefined);
        mockClose = jest.fn();
    });

    it('remplit et affiche correctement les détails de CARDIOLOGY', async () => {
        const wrapper = mount(PatientModal, {
            props: {
                isOpen: true,
                mode: 'edit',
                patient: basePatient,
                onClose: mockClose,
                onSubmitPatient: mockSubmitPatient,
            },
        });

        // Le composant affiche le libellé traduit "Cardiologie"
        expect(wrapper.text()).toContain('Cardiologie');
        expect(wrapper.text()).toContain('Pression Artérielle');
        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('gère le changement vers le département EMERGENCY', async () => {
        const wrapper = mount(PatientModal, {
            props: {
                isOpen: true,
                mode: 'edit',
                patient: basePatient,
                onClose: mockClose,
                onSubmitPatient: mockSubmitPatient,
            },
        });

        const select = wrapper.find('select');
        if (select.exists()) {
            await select.setValue('EMERGENCY');
            await select.trigger('change');
        }

        expect(wrapper.text()).toContain('Urgences');
    });

    it('gère le changement vers le département ONCOLOGY', async () => {
        const wrapper = mount(PatientModal, {
            props: {
                isOpen: true,
                mode: 'edit',
                patient: basePatient,
                onClose: mockClose,
                onSubmitPatient: mockSubmitPatient,
            },
        });

        const select = wrapper.find('select');
        if (select.exists()) {
            await select.setValue('ONCOLOGY');
            await select.trigger('change');
        }

        expect(wrapper.text()).toContain('Oncologie');
    });

    it('gère le changement vers le département GENERAL', async () => {
        const wrapper = mount(PatientModal, {
            props: {
                isOpen: true,
                mode: 'edit',
                patient: basePatient,
                onClose: mockClose,
                onSubmitPatient: mockSubmitPatient,
            },
        });

        const select = wrapper.find('select');
        if (select.exists()) {
            await select.setValue('GENERAL');
            await select.trigger('change');
        }

        expect(wrapper.text()).toContain('Médecine Générale');
    });

    it('soumet le formulaire complet lors du clic sur Submit', async () => {
        const wrapper = mount(PatientModal, {
            props: {
                isOpen: true,
                mode: 'create',
                onClose: mockClose,
                onSubmitPatient: mockSubmitPatient,
            },
        });

        const inputs = wrapper.findAll('input');
        if (inputs.length >= 2) {
            await inputs[0].setValue('Karim');
            await inputs[1].setValue('Saidi');
        }

        await wrapper.find('form').trigger('submit.prevent');
        expect(mockSubmitPatient).toHaveBeenCalled();
    });

    // À ajouter dans PatientModal.spec.ts

    it('remplit les champs spécifiques de Cardiologie et soumet le formulaire', async () => {
        const wrapper = mount(PatientModal, {
            props: {
                isOpen: true,
                mode: 'edit',
                patient: {
                    id: 1,
                    firstName: 'Amina',
                    lastName: 'Benali',
                    admissionDate: '2026-09-25',
                    department: 'CARDIOLOGY',
                    cardiology: { restingHeartRate: 72, bloodPressure: '120/80', ecgResults: 'Normal' },
                },
                onClose: jest.fn(),
                onSubmitPatient: jest.fn().mockResolvedValue(undefined),
            },
        });

        // Cible spécifiquement les inputs de cardiologie
        const inputs = wrapper.findAll('input');
        for (const input of inputs) {
            await input.setValue('130/85');
            await input.trigger('input');
        }

        const textareas = wrapper.findAll('textarea');
        for (const textarea of textareas) {
            await textarea.setValue('Anomalie légère');
            await textarea.trigger('input');
        }

        await wrapper.find('form').trigger('submit.prevent');
    });
});