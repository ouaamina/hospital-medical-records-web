import { defineComponent, ref, reactive, watch, PropType } from 'vue';
import {
    Patient,
    Department,
    CardiologyDetails,
    EmergencyDetails,
    OncologyDetails,
    GeneralDetails
} from '../types/patient';

export type ModalMode = 'create' | 'view' | 'edit';

export default defineComponent({
    name: 'PatientModal',
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
        mode: {
            type: String as PropType<ModalMode>,
            default: 'create',
        },
        patient: {
            type: Object as PropType<Patient | null>,
            default: null,
        },
        onClose: {
            type: Function as PropType<() => void>,
            required: true,
        },
        onSubmitPatient: {
            type: Function as PropType<(patient: Patient, id?: number) => Promise<void>>,
            required: true,
        },
    },
    setup(props) {
        const currentMode = ref<ModalMode>(props.mode);
        const department = ref<Department>('GENERAL');
        const isSubmitting = ref<boolean>(false);
        const errorMessage = ref<string | null>(null);

        const baseForm = reactive({
            firstName: '',
            lastName: '',
            admissionDate: new Date().toISOString().split('T')[0],
        });

        const generalForm = reactive<GeneralDetails>({
            consultationReason: '',
            referringDoctor: '',
            notes: '',
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

        const formatDateForInput = (dateStr?: string): string => {
            if (!dateStr) return new Date().toISOString().split('T')[0];

            const formatted = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];

            if (/^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
                return formatted;
            }

            const parsedDate = new Date(dateStr);
            return !isNaN(parsedDate.getTime())
                ? parsedDate.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
        };

        // Réinitialise et remplit complètement les formulaires selon les données du patient
        const populateForm = (data: Patient | null) => {
            if (!data) {
                baseForm.firstName = '';
                baseForm.lastName = '';
                baseForm.admissionDate = formatDateForInput();
                department.value = 'GENERAL';

                // Reset complet des sous-formulaires
                Object.assign(generalForm, { consultationReason: '', referringDoctor: '', notes: '' });
                Object.assign(cardiologyForm, { ecgResults: '', restingHeartRate: 70, bloodPressure: '120/80' });
                Object.assign(emergencyForm, { arrivalTime: '12:00', triageLevel: 3, initialSeverity: 'MODERATE' });
                Object.assign(oncologyForm, { tumorType: '', stage: 'Stage I', currentTreatment: 'Aucun' });
                return;
            }

            // 1. Informations de base
            baseForm.firstName = data.firstName || '';
            baseForm.lastName = data.lastName || '';
            baseForm.admissionDate = formatDateForInput(data.admissionDate);

            // 2. Sélection du Service
            const currentDept = data.department || 'GENERAL';
            department.value = currentDept;

            // 3. Charger les données spécifiques selon le service
            if (data.general) {
                Object.assign(generalForm, {
                    consultationReason: data.general.consultationReason ?? '',
                    referringDoctor: data.general.referringDoctor ?? '',
                    notes: data.general.notes ?? '',
                });
            }

            if (data.cardiology) {
                Object.assign(cardiologyForm, {
                    ecgResults: data.cardiology.ecgResults ?? '',
                    restingHeartRate: data.cardiology.restingHeartRate ?? 70,
                    bloodPressure: data.cardiology.bloodPressure ?? '120/80',
                });
            }

            if (data.emergency) {
                Object.assign(emergencyForm, {
                    arrivalTime: data.emergency.arrivalTime ?? '12:00',
                    triageLevel: data.emergency.triageLevel ?? 3,
                    initialSeverity: data.emergency.initialSeverity ?? 'MODERATE',
                });
            }

            if (data.oncology) {
                Object.assign(oncologyForm, {
                    tumorType: data.oncology.tumorType ?? '',
                    stage: data.oncology.stage ?? 'Stage I',
                    currentTreatment: data.oncology.currentTreatment ?? 'Aucun',
                });
            }
        };

        // Écouteur réactif avec deep: true
        watch(
            () => [props.isOpen, props.patient, props.mode],
            ([isOpen]) => {
                currentMode.value = props.mode;
                errorMessage.value = null;

                if (isOpen) {
                    populateForm(props.patient);
                }
            },
            { immediate: true, deep: true }
        );

        const handleSubmit = async (e: Event) => {
            e.preventDefault();
            if (currentMode.value === 'view') return;

            isSubmitting.value = true;
            errorMessage.value = null;

            const payload: Patient = {
                firstName: baseForm.firstName,
                lastName: baseForm.lastName,
                admissionDate: baseForm.admissionDate,
                department: department.value,
            };

            if (department.value === 'GENERAL') payload.general = { ...generalForm };
            if (department.value === 'CARDIOLOGY') payload.cardiology = { ...cardiologyForm };
            if (department.value === 'EMERGENCY') payload.emergency = { ...emergencyForm };
            if (department.value === 'ONCOLOGY') payload.oncology = { ...oncologyForm };

            try {
                await props.onSubmitPatient(payload, props.patient?.id);
                props.onClose();
            } catch (err: unknown) {
                errorMessage.value = err instanceof Error ? err.message : 'Erreur lors de l’enregistrement';
            } finally {
                isSubmitting.value = false;
            }
        };

        const getTitle = () => {
            if (currentMode.value === 'create') return '➕ Nouveau Patient';
            if (currentMode.value === 'edit') return `✏️ Modifier le Patient ${props.patient?.lastName} ${props.patient?.firstName}`;
            return `📋 Dossier Médical #${props.patient?.id}`;
        };

        return () => {
            if (!props.isOpen) return null;

            const isReadOnly = currentMode.value === 'view';

            return (
                <div style={styles.overlay}>
                    <div style={styles.modalCard}>
                        {/* Entête */}
                        <div style={styles.header}>
                            <h3 style={styles.title}>{getTitle()}</h3>
                            <button onClick={props.onClose} style={styles.closeBtn}>&times;</button>
                        </div>

                        {errorMessage.value && <div style={styles.errorBanner}>{errorMessage.value}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            {/* Informations générales */}
                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isReadOnly}
                                        value={baseForm.lastName}
                                        onInput={(e: Event) => baseForm.lastName = (e.target as HTMLInputElement).value}
                                        style={{ ...styles.input, backgroundColor: isReadOnly ? '#f1f5f9' : '#ffffff' }}
                                    />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Prénom *</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={isReadOnly}
                                        value={baseForm.firstName}
                                        onInput={(e: Event) => baseForm.firstName = (e.target as HTMLInputElement).value}
                                        style={{ ...styles.input, backgroundColor: isReadOnly ? '#f1f5f9' : '#ffffff' }}
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.col}>
                                    <label style={styles.label}>Date d'admission *</label>
                                    <input
                                        type="date"
                                        required
                                        disabled={isReadOnly}
                                        value={baseForm.admissionDate}
                                        onInput={(e: Event) => baseForm.admissionDate = (e.target as HTMLInputElement).value}
                                        style={{ ...styles.input, backgroundColor: isReadOnly ? '#f1f5f9' : '#ffffff' }}
                                    />
                                </div>
                                <div style={styles.col}>
                                    <label style={styles.label}>Service Médical *</label>
                                    <select
                                        disabled={isReadOnly}
                                        value={department.value}
                                        onChange={(e: Event) => department.value = (e.target as HTMLSelectElement).value as Department}
                                        style={{ ...styles.select, backgroundColor: isReadOnly ? '#f1f5f9' : '#ffffff' }}
                                    >
                                        <option value="GENERAL">Médecine Générale</option>
                                        <option value="CARDIOLOGY">Cardiologie </option>
                                        <option value="EMERGENCY">Urgences </option>
                                        <option value="ONCOLOGY">Oncologie </option>
                                    </select>
                                </div>
                            </div>

                            {/* Détails Cardiologie */}
                            {department.value === 'CARDIOLOGY' && (
                                <div style={{ ...styles.deptBox, borderColor: '#007bff', background: '#f4f8ff' }}>
                                    <h4 style={{ ...styles.deptTitle, color: '#007bff' }}>Détails</h4>
                                    <div style={styles.row}>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Pression Artérielle</label>
                                            <input
                                                type="text"
                                                disabled={isReadOnly}
                                                value={cardiologyForm.bloodPressure}
                                                onInput={(e: Event) => cardiologyForm.bloodPressure = (e.target as HTMLInputElement).value}
                                                style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                            />
                                        </div>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Fréquence Cardiaque (BPM)</label>
                                            <input
                                                type="number"
                                                disabled={isReadOnly}
                                                value={cardiologyForm.restingHeartRate}
                                                onInput={(e: Event) => cardiologyForm.restingHeartRate = Number((e.target as HTMLInputElement).value)}
                                                style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <label style={styles.label}>Résultat ECG</label>
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            value={cardiologyForm.ecgResults}
                                            onInput={(e: Event) => cardiologyForm.ecgResults = (e.target as HTMLInputElement).value}
                                            style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Détails Urgences */}
                            {department.value === 'EMERGENCY' && (
                                <div style={{ ...styles.deptBox, borderColor: '#dc3545', background: '#fff5f5' }}>
                                    <h4 style={{ ...styles.deptTitle, color: '#dc3545' }}>Détails </h4>
                                    <div style={styles.row}>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Heure d'arrivée</label>
                                            <input
                                                type="time"
                                                disabled={isReadOnly}
                                                value={emergencyForm.arrivalTime}
                                                onInput={(e: Event) => emergencyForm.arrivalTime = (e.target as HTMLInputElement).value}
                                                style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                            />
                                        </div>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Niveau de Tri (1 à 5)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                disabled={isReadOnly}
                                                value={emergencyForm.triageLevel}
                                                onInput={(e: Event) => emergencyForm.triageLevel = Number((e.target as HTMLInputElement).value)}
                                                style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <label style={styles.label}>Sévérité Initiale</label>
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            value={emergencyForm.initialSeverity}
                                            onInput={(e: Event) => emergencyForm.initialSeverity = (e.target as HTMLInputElement).value}
                                            style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Détails Oncologie */}
                            {department.value === 'ONCOLOGY' && (
                                <div style={{ ...styles.deptBox, borderColor: '#28a745', background: '#f4fff6' }}>
                                    <h4 style={{ ...styles.deptTitle, color: '#28a745' }}>Détails </h4>
                                    <div style={styles.row}>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Type de Tumeur</label>
                                            <input
                                                type="text"
                                                disabled={isReadOnly}
                                                value={oncologyForm.tumorType}
                                                onInput={(e: Event) => oncologyForm.tumorType = (e.target as HTMLInputElement).value}
                                                style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                            />
                                        </div>
                                        <div style={styles.col}>
                                            <label style={styles.label}>Stade</label>
                                            <input
                                                type="text"
                                                disabled={isReadOnly}
                                                value={oncologyForm.stage}
                                                onInput={(e: Event) => oncologyForm.stage = (e.target as HTMLInputElement).value}
                                                style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <label style={styles.label}>Traitement en Cours</label>
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            value={oncologyForm.currentTreatment}
                                            onInput={(e: Event) => oncologyForm.currentTreatment = (e.target as HTMLInputElement).value}
                                            style={{ ...styles.input, backgroundColor: isReadOnly ? '#ffffff' : '#ffffff' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Actions de bas de page */}
                            <div style={styles.footer}>
                                <button type="button" onClick={props.onClose} style={styles.cancelBtn}>
                                    {isReadOnly ? 'Fermer' : 'Annuler'}
                                </button>

                                {isReadOnly ? (
                                    <button
                                        type="button"
                                        onClick={() => currentMode.value = 'edit'}
                                        style={styles.editBtn}
                                    >
                                        ✏️ Passer en Mode Édition
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting.value}
                                        style={styles.submitBtn}
                                    >
                                        {isSubmitting.value
                                            ? 'Enregistrement...'
                                            : (currentMode.value === 'edit' ? 'Mettre à jour' : 'Enregistrer')}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            );
        };
    },
});

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
        maxWidth: '580px',
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
    editBtn: {
        padding: '10px 18px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#d97706',
        color: '#ffffff',
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