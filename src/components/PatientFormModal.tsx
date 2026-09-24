import { defineComponent, ref, reactive, PropType } from 'vue';
import {
    Patient,
    Department,
    CardiologyDetails,
    EmergencyDetails,
    OncologyDetails
} from '../types/patient';

export default defineComponent({
    name: 'PatientFormModal',
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
        onClose: {
            type: Function as PropType<() => void>,
            required: true,
        },
        onSubmitPatient: {
            type: Function as PropType<(patient: Patient) => Promise<void>>,
            required: true,
        },
    },
    setup(props) {
        const department = ref<Department>('CARDIOLOGY');
        const isSubmitting = ref<boolean>(false);
        const errorMessage = ref<string | null>(null);

        const baseForm = reactive({
            firstName: '',
            lastName: '',
            admissionDate: new Date().toISOString().split('T')[0],
        });

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
            currentTreatment: 'Aucun',
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
            oncologyForm.currentTreatment = 'Aucun';
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

            if (department.value === 'CARDIOLOGY') payload.cardiology = { ...cardiologyForm };
            if (department.value === 'EMERGENCY') payload.emergency = { ...emergencyForm };
            if (department.value === 'ONCOLOGY') payload.oncology = { ...oncologyForm };

            try {
                await props.onSubmitPatient(payload);
                resetForm();
                props.onClose();
            } catch (err: unknown) {
                errorMessage.value = err instanceof Error ? err.message : 'Erreur lors de la création';
            } finally {
                isSubmitting.value = false;
            }
        };

        return () => {
            if (!props.isOpen) return null;

            return (
                <div style={styles.overlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.header}>
                            <h3 style={styles.title}>➕ Nouveau Dossier Patient</h3>
                            <button onClick={props.onClose} style={styles.closeBtn}>&times;</button>
                        </div>

                        {errorMessage.value && <div style={styles.errorBanner}>{errorMessage.value}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ex: Dupont"
                                        value={baseForm.lastName}
                                        onInput={(e: Event) => baseForm.lastName = (e.target as HTMLInputElement).value}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Prénom *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ex: Jean"
                                        value={baseForm.firstName}
                                        onInput={(e: Event) => baseForm.firstName = (e.target as HTMLInputElement).value}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Date d'admission *</label>
                                    <input
                                        type="date"
                                        required
                                        value={baseForm.admissionDate}
                                        onInput={(e: Event) => baseForm.admissionDate = (e.target as HTMLInputElement).value}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Service Médical *</label>
                                    <select
                                        value={department.value}
                                        onChange={(e: Event) => department.value = (e.target as HTMLSelectElement).value as Department}
                                        style={styles.select}
                                    >
                                        <option value="CARDIOLOGY">Cardiologie 🫀</option>
                                        <option value="EMERGENCY">Urgences 🚨</option>
                                        <option value="ONCOLOGY">Oncologie 🔬</option>
                                    </select>
                                </div>
                            </div>

                            {/* Champs Spécifiques Dynamiques */}
                            {department.value === 'CARDIOLOGY' && (
                                <div style={{ ...styles.deptBox, borderColor: '#007bff', background: '#f4f8ff' }}>
                                    <h4 style={{ ...styles.deptTitle, color: '#007bff' }}>Détails Cardiologie</h4>
                                    <div style={styles.row}>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Pression Artérielle</label>
                                            <input
                                                type="text"
                                                value={cardiologyForm.bloodPressure}
                                                onInput={(e: Event) => cardiologyForm.bloodPressure = (e.target as HTMLInputElement).value}
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Fréquence Cardiaque (BPM)</label>
                                            <input
                                                type="number"
                                                value={cardiologyForm.restingHeartRate}
                                                onInput={(e: Event) => cardiologyForm.restingHeartRate = Number((e.target as HTMLInputElement).value)}
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <label style={styles.label}>Résultat ECG</label>
                                        <input
                                            type="text"
                                            placeholder="Normal / Arythmie / Sinusal"
                                            value={cardiologyForm.ecgResults}
                                            onInput={(e: Event) => cardiologyForm.ecgResults = (e.target as HTMLInputElement).value}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>
                            )}

                            {department.value === 'EMERGENCY' && (
                                <div style={{ ...styles.deptBox, borderColor: '#dc3545', background: '#fff5f5' }}>
                                    <h4 style={{ ...styles.deptTitle, color: '#dc3545' }}>Détails Urgences</h4>
                                    <div style={styles.row}>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Heure d'arrivée</label>
                                            <input
                                                type="time"
                                                value={emergencyForm.arrivalTime}
                                                onInput={(e: Event) => emergencyForm.arrivalTime = (e.target as HTMLInputElement).value}
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Niveau de Tri (1 à 5)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={emergencyForm.triageLevel}
                                                onInput={(e: Event) => emergencyForm.triageLevel = Number((e.target as HTMLInputElement).value)}
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {department.value === 'ONCOLOGY' && (
                                <div style={{ ...styles.deptBox, borderColor: '#28a745', background: '#f4fff6' }}>
                                    <h4 style={{ ...styles.deptTitle, color: '#28a745' }}>Détails Oncologie</h4>
                                    <div style={styles.row}>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Type de Tumeur</label>
                                            <input
                                                type="text"
                                                placeholder="Carcinome, Lymphome..."
                                                value={oncologyForm.tumorType}
                                                onInput={(e: Event) => oncologyForm.tumorType = (e.target as HTMLInputElement).value}
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Stade</label>
                                            <input
                                                type="text"
                                                value={oncologyForm.stage}
                                                onInput={(e: Event) => oncologyForm.stage = (e.target as HTMLInputElement).value}
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={styles.footer}>
                                <button type="button" onClick={props.onClose} style={styles.cancelBtn}>
                                    Annuler
                                </button>
                                <button type="submit" disabled={isSubmitting.value} style={styles.submitBtn}>
                                    {isSubmitting.value ? 'Enregistrement...' : 'Enregistrer le Patient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        };
    },
});

// Styles CSS inline pour un rendu propre sans dépendance CSS externe
const styles = {
    overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
    },
    header: {
        padding: '16px 24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    title: {
        margin: 0,
        fontSize: '18px',
        color: '#0f172a',
        fontWeight: 600,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#64748b',
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        padding: '12px 24px',
        fontSize: '14px',
        borderBottom: '1px solid #fecaca',
    },
    form: {
        padding: '24px',
    },
    row: {
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
    },
    col: {
        flex: 1,
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: '#334155',
        marginBottom: '6px',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        boxSizing: 'border-box' as const,
        outline: 'none',
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box' as const,
    },
    deptBox: {
        borderLeft: '4px solid',
        padding: '16px',
        borderRadius: '6px',
        marginTop: '12px',
        marginBottom: '20px',
    },
    deptTitle: {
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: 600,
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0',
    },
    cancelBtn: {
        padding: '10px 16px',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        color: '#475569',
        fontWeight: 600,
        cursor: 'pointer',
    },
    submitBtn: {
        padding: '10px 18px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        fontWeight: 600,
        cursor: 'pointer',
    },
};