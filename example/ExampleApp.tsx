import { defineComponent, ref, inject, onMounted } from 'vue';
import { PatientService } from '../src/api/patient.service';
import { Patient } from '../src/types/patient';
import PatientModal, { ModalMode } from '../src/components/PatientModal';

export default defineComponent({
    name: 'ExampleApp',
    setup() {
        const patientService = inject<PatientService>('patientService');
        const patients = ref<Patient[]>([]);
        const loading = ref<boolean>(false);
        const error = ref<string | null>(null);

        // État de la modal
        const isModalOpen = ref<boolean>(false);
        const modalMode = ref<ModalMode>('create');
        const selectedPatient = ref<Patient | null>(null);

        const loadPatients = async (): Promise<void> => {
            if (!patientService) return;
            loading.value = true;
            try {
                patients.value = await patientService.getPatients();
            } catch (err: unknown) {
                error.value = err instanceof Error ? err.message : 'Erreur lors du chargement';
            } finally {
                loading.value = false;
            }
        };

        const handleOpenCreateModal = () => {
            selectedPatient.value = null;
            modalMode.value = 'create';
            isModalOpen.value = true;
        };

        const handleOpenViewModal = (patient: Patient) => {
            selectedPatient.value = patient;
            modalMode.value = 'view';
            isModalOpen.value = true;
        };

        const handleOpenEditModal = (patient: Patient) => {
            selectedPatient.value = patient;
            modalMode.value = 'edit';
            isModalOpen.value = true;
        };

        const handleSavePatient = async (patientData: Patient, id?: number): Promise<void> => {
            if (!patientService) return;

            try {
                if (id) {
                    // Mode Mettre à jour
                    await patientService.updatePatient(id, patientData);
                    // On rebraque sur l'API pour récupérer la donnée parfaitement structurée
                    await loadPatients();
                } else {
                    // Mode Créer
                    const created = await patientService.createPatient(patientData);
                    patients.value.push(created);
                }
            } catch (err) {
                console.error("Erreur lors de la sauvegarde :", err);
            }
        };

        // 1. Ajouter la méthode handleDeletePatient dans le setup()
        const handleDeletePatient = async (patient: Patient): Promise<void> => {
            if (!patientService) return;

            // Confirmation avant suppression
            if (confirm(`Êtes-vous sûr de vouloir supprimer le dossier de ${patient.lastName} ${patient.firstName} ?`)) {
                try {
                    await patientService.deletePatient(patient.id);
                    // Recharger la liste des patients mis à jour
                    await loadPatients();
                } catch (err) {
                    console.error("Erreur lors de la suppression :", err);
                    alert("Impossible de supprimer ce patient.");
                }
            }
        };
        const getBadgeStyle = (dept: string) => {
            switch (dept) {
                case 'CARDIOLOGY': return { bg: '#dbeafe', color: '#1e40af', label: 'Cardiologie' };
                case 'EMERGENCY': return { bg: '#fee2e2', color: '#991b1b', label: 'Urgences' };
                case 'ONCOLOGY': return { bg: '#dcfce7', color: '#166534', label: 'Oncologie' };
                default: return { bg: '#f1f5f9', color: '#475569', label: dept };
            }
        };

        onMounted(() => {
            loadPatients();
        });

        return () => (
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>🏥 Gestion des Dossiers Médicaux</h1>
                            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Plugin Vue 3 - Support TSX et API REST</p>
                        </div>
                        <button
                            onClick={handleOpenCreateModal}
                            style={{
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                            }}
                        >
                            + Nouveau Patient
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        {loading.value && <p style={{ padding: '20px', color: '#64748b' }}>Chargement des données...</p>}
                        {error.value && <p style={{ padding: '20px', color: '#dc2626' }}>{error.value}</p>}

                        {!loading.value && patients.value.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                <p style={{ fontSize: '16px', margin: 0 }}>Aucun dossier patient enregistré.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={tableThStyle}>ID</th>
                                    <th style={tableThStyle}>Patient</th>
                                    <th style={tableThStyle}>Service</th>
                                    <th style={tableThStyle}>Admission</th>
                                    <th style={{ ...tableThStyle, textAlign: 'right' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {patients.value.map((patient) => {
                                    const deptKey = (patient.department || 'GENERAL').toUpperCase();
                                    const badge = getBadgeStyle(deptKey);
                                    return (
                                        <tr key={patient.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={tableTdStyle}>#{patient.id}</td>
                                            <td style={{ ...tableTdStyle, fontWeight: 600, color: '#0f172a' }}>
                                                {patient.lastName} {patient.firstName}
                                            </td>
                                            <td style={tableTdStyle}>
                        <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: badge.bg,
                            color: badge.color,
                        }}>
                            {badge.label}
                        </span>
                                            </td>
                                            <td style={{ ...tableTdStyle, color: '#64748b' }}>{patient.admissionDate}</td>
                                            <td style={{ ...tableTdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>

                                                {/* Bouton Voir */}
                                                <button
                                                    onClick={() => handleOpenViewModal(patient)}
                                                    style={viewBtnStyle}
                                                    title="Voir Détails"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" >
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    Voir
                                                </button>

                                                {/* Bouton Modifier */}
                                                <button
                                                    onClick={() => handleOpenEditModal(patient)}
                                                    style={{ ...editBtnStyle, marginLeft: '6px' }}
                                                    title="Modifier"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" >
                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                    </svg>
                                                    Modifier
                                                </button>

                                                {/* Bouton Supprimer */}
                                                <button
                                                    onClick={() => handleDeletePatient(patient)}
                                                    style={{ ...deleteBtnStyle, marginLeft: '6px' }}
                                                    title="Supprimer"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"   >
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    </svg>
                                                    Supprimer
                                                </button>

                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>                        )}
                    </div>

                    {/* Modal unifiée */}
                    <PatientModal
                        isOpen={isModalOpen.value}
                        mode={modalMode.value}
                        patient={selectedPatient.value}
                        onClose={() => isModalOpen.value = false}
                        onSubmitPatient={handleSavePatient}
                    />
                </div>
            </div>
        );
    },
});

const tableThStyle = {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase' as const,
};

const tableTdStyle = {
    padding: '14px 16px',
    fontSize: '14px',
};

const actionBtnStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    fontWeight: 500,
    color: '#2563eb',
    cursor: 'pointer',
};

// Styles des boutons d'action
const btnBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
};

const viewBtnStyle = {
    ...btnBaseStyle,
    backgroundColor: '#eff6ff', // Bleu très clair
    color: '#2563eb',          // Bleu intense
};

const editBtnStyle = {
    ...btnBaseStyle,
    backgroundColor: '#fffbeb', // Ambre très clair
    color: '#d97706',          // Ambre / Orange
};

const deleteBtnStyle = {
    ...btnBaseStyle,
    backgroundColor: '#fef2f2', // Rouge très clair
    color: '#dc2626',          // Rouge
};