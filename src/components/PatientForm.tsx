import { defineComponent, ref, reactive, PropType } from 'vue';
import {
    Patient,
    Department,
    CardiologyDetails,
    EmergencyDetails,
    OncologyDetails
} from '../types/patient';

export default defineComponent({
    name: 'PatientForm',
    props: {
        onSubmitPatient: {
            type: Function as PropType<(patient: Patient) => Promise<void>>,
            required: true,
        },
    },
    setup(props) {
        const department = ref<Department>('CARDIOLOGY');
        const isSubmitting = ref<boolean>(false);
        const errorMessage = ref<string | null>(null);

        // Champs de base du patient
        const baseForm = reactive({
            firstName: '',
            lastName: '',
            admissionDate: new Date().toISOString().split('T')[0],
        });

        // Détails par département
        const cardiologyForm = reactive<CardiologyDetails>({
            ecgResults: '',
            restingHeartRate: 70,
            bloodPressure: '120/80',
        });

        const emergencyForm = reactive<EmergencyDetails>({
            arrivalTime: '12:00',
            triageLevel: 3,
            initialSeverity: 'MODERATE',
        });

        const oncologyForm = reactive<OncologyDetails>({
            tumorType: '',
            stage: 'Stage I',
            currentTreatment: 'None',
        });

        const resetForm = () => {
            baseForm.firstName = '';
            baseForm.lastName = '';
            cardiologyForm.ecgResults = '';
            cardiologyForm.restingHeartRate = 70;
            cardiologyForm.bloodPressure = '120/80';
            emergencyForm.arrivalTime = '12:00';
            emergencyForm.triageLevel = 3;
            emergencyForm.initialSeverity = 'MODERATE';
            oncologyForm.tumorType = '';
            oncologyForm.stage = 'Stage I';
            oncologyForm.currentTreatment = 'None';
            errorMessage.value = null;
        };

        const handleSubmit = async (e: Event) => {
            e.preventDefault();
            isSubmitting.value = true;
            errorMessage.value = null;

            const payload: Patient = {
                firstName: baseForm.firstName,
                lastName: baseForm.lastName,
                admissionDate: baseForm.admissionDate,
                department: department.value,
            };

            if (department.value === 'CARDIOLOGY') {
                payload.cardiology = { ...cardiologyForm };
            } else if (department.value === 'EMERGENCY') {
                payload.emergency = { ...emergencyForm };
            } else if (department.value === 'ONCOLOGY') {
                payload.oncology = { ...oncologyForm };
            }

            try {
                await props.onSubmitPatient(payload);
                resetForm();
            } catch (err: unknown) {
                errorMessage.value = err instanceof Error ? err.message : 'Erreur lors de la création';
            } finally {
                isSubmitting.value = false;
            }
        };

        return () => (
            <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Nouveau Dossier Patient</h3>
                {errorMessage.value && <p style={{ color: 'red' }}>{errorMessage.value}</p>}

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Nom :</label>
                    <input
                        type="text"
                        required
                        value={baseForm.lastName}
                        onInput={(e: Event) => baseForm.lastName = (e.target as HTMLInputElement).value}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Prénom :</label>
                    <input
                        type="text"
                        required
                        value={baseForm.firstName}
                        onInput={(e: Event) => baseForm.firstName = (e.target as HTMLInputElement).value}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Date d'admission :</label>
                    <input
                        type="date"
                        required
                        value={baseForm.admissionDate}
                        onInput={(e: Event) => baseForm.admissionDate = (e.target as HTMLInputElement).value}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Département / Service :</label>
                    <select
                        value={department.value}
                        onChange={(e: Event) => department.value = (e.target as HTMLSelectElement).value as Department}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                    >
                        <option value="CARDIOLOGY">Cardiologie</option>
                        <option value="EMERGENCY">Urgences</option>
                        <option value="ONCOLOGY">Oncologie</option>
                    </select>
                </div>

                {/* Section Dynamique : Cardiologie */}
                {department.value === 'CARDIOLOGY' && (
                    <div style={{ borderLeft: '4px solid #007bff', paddingLeft: '10px', marginBottom: '15px' }}>
                        <h4>Données Cardiologie</h4>
                        <div style={{ marginBottom: '8px' }}>
                            <label>Résultat ECG :</label>
                            <input
                                type="text"
                                value={cardiologyForm.ecgResults}
                                onInput={(e: Event) => cardiologyForm.ecgResults = (e.target as HTMLInputElement).value}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <label>Fréquence cardiaque au repos :</label>
                            <input
                                type="number"
                                value={cardiologyForm.restingHeartRate}
                                onInput={(e: Event) => cardiologyForm.restingHeartRate = Number((e.target as HTMLInputElement).value)}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                        <div>
                            <label>Pression artérielle :</label>
                            <input
                                type="text"
                                value={cardiologyForm.bloodPressure}
                                onInput={(e: Event) => cardiologyForm.bloodPressure = (e.target as HTMLInputElement).value}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                    </div>
                )}

                {/* Section Dynamique : Urgences */}
                {department.value === 'EMERGENCY' && (
                    <div style={{ borderLeft: '4px solid #dc3545', paddingLeft: '10px', marginBottom: '15px' }}>
                        <h4>Données Urgences</h4>
                        <div style={{ marginBottom: '8px' }}>
                            <label>Heure d'arrivée :</label>
                            <input
                                type="text"
                                value={emergencyForm.arrivalTime}
                                onInput={(e: Event) => emergencyForm.arrivalTime = (e.target as HTMLInputElement).value}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <label>Niveau de tri (1-5) :</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={emergencyForm.triageLevel}
                                onInput={(e: Event) => emergencyForm.triageLevel = Number((e.target as HTMLInputElement).value)}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                        <div>
                            <label>Sévérité initiale :</label>
                            <input
                                type="text"
                                value={emergencyForm.initialSeverity}
                                onInput={(e: Event) => emergencyForm.initialSeverity = (e.target as HTMLInputElement).value}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                    </div>
                )}

                {/* Section Dynamique : Oncologie */}
                {department.value === 'ONCOLOGY' && (
                    <div style={{ borderLeft: '4px solid #28a745', paddingLeft: '10px', marginBottom: '15px' }}>
                        <h4>Données Oncologie</h4>
                        <div style={{ marginBottom: '8px' }}>
                            <label>Type de tumeur :</label>
                            <input
                                type="text"
                                value={oncologyForm.tumorType}
                                onInput={(e: Event) => oncologyForm.tumorType = (e.target as HTMLInputElement).value}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <label>Stade :</label>
                            <input
                                type="text"
                                value={oncologyForm.stage}
                                onInput={(e: Event) => oncologyForm.stage = (e.target as HTMLInputElement).value}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                        <div>
                            <label>Traitement en cours :</label>
                            <input
                                type="text"
                                value={oncologyForm.currentTreatment}
                                onInput={(e: Event) => oncologyForm.currentTreatment = (e.target as HTMLInputElement).value}
                                style={{ width: '100%', padding: '6px' }}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting.value}
                    style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {isSubmitting.value ? 'Enregistrement...' : 'Créer le patient'}
                </button>
            </form>
        );
    },
});