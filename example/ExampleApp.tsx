import { defineComponent, ref, computed, inject, onMounted } from 'vue';
import { PatientService } from '../src/api/patient.service';
import { Patient } from '../src/types/patient';
import PatientModal, { ModalMode } from '../src/components/PatientModal';
import { AuthService } from '../src/api/auth.service';
import LoginModal from '../src/components/LoginModal';
import { User, LoginCredentials } from '../src/types/auth';

export default defineComponent({
    name: 'ExampleApp',
    setup() {
        // Services
        const authService = new AuthService();
        const patientService = inject<PatientService>('patientService');

        // États Auth
        const currentUser = ref<User | null>(null);
        const isLoginModalOpen = ref(false);

        // États Patients
        const patients = ref<Patient[]>([]);
        const loading = ref<boolean>(false);
        const error = ref<string | null>(null);

        // États Modales Patient
        const isModalOpen = ref<boolean>(false);
        const modalMode = ref<ModalMode>('create');
        const selectedPatient = ref<Patient | null>(null);

        // -------------------------------------------------------------
        // 📄 ÉTATS ET LOGIQUE DE PAGINATION
        // -------------------------------------------------------------
        const currentPage = ref<number>(1);
        const pageSize = ref<number>(5); // 5 patients par page

        const totalPages = computed(() => {
            return Math.ceil(patients.value.length / pageSize.value) || 1;
        });

        const paginatedPatients = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value;
            const end = start + pageSize.value;
            return patients.value.slice(start, end);
        });

        const goToPage = (page: number) => {
            if (page >= 1 && page <= totalPages.value) {
                currentPage.value = page;
            }
        };
        // -------------------------------------------------------------

        // Vérification de la session au chargement
        const checkAuthStatus = async () => {
            if (authService.isAuthenticated()) {
                try {
                    currentUser.value = await authService.getCurrentUser();
                    await loadPatients();
                } catch (err) {
                    console.error("Session expirée", err);
                    authService.logout();
                    currentUser.value = null;
                }
            }
        };

        const handleLogin = async (credentials: LoginCredentials) => {
            const authData = await authService.login(credentials);
            currentUser.value = authData.user;
            await loadPatients();
        };

        const handleLogout = () => {
            authService.logout();
            currentUser.value = null;
            patients.value = [];
        };

        const loadPatients = async (): Promise<void> => {
            if (!patientService) return;
            loading.value = true;
            try {
                patients.value = await patientService.getPatients();
                currentPage.value = 1; // Revenir à la première page
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
                    await patientService.updatePatient(id, patientData);
                    await loadPatients();
                } else {
                    const created = await patientService.createPatient(patientData);
                    patients.value.push(created);
                }
            } catch (err) {
                console.error("Erreur lors de la sauvegarde :", err);
            }
        };

        const handleDeletePatient = async (patient: Patient): Promise<void> => {
            if (!patientService) return;

            if (confirm(`Êtes-vous sûr de vouloir supprimer le dossier de ${patient.lastName} ${patient.firstName} ?`)) {
                try {
                    await patientService.deletePatient(patient.id);
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
            checkAuthStatus();
        });

        return () => (
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>

                    {/* Header avec zone Utilisateur / Connexion */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>🏥 Gestion des Dossiers Médicaux</h1>
                            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Plugin Vue 3 - Support TSX et API REST</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {currentUser.value ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                                        👤 {currentUser.value.name}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        style={{ ...btnBaseStyle, backgroundColor: '#fef2f2', color: '#dc2626' }}
                                    >
                                        Déconnexion
                                    </button>
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
                            ) : (
                                <button
                                    onClick={() => isLoginModalOpen.value = true}
                                    style={{
                                        backgroundColor: '#2563eb',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '10px 18px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    🔒 Se connecter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Contenu principal / Table */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        {!currentUser.value ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                <p style={{ fontSize: '16px', margin: 0 }}>Veuillez vous connecter pour accéder aux dossiers patients.</p>
                            </div>
                        ) : loading.value ? (
                            <p style={{ padding: '20px', color: '#64748b' }}>Chargement des données...</p>
                        ) : error.value ? (
                            <p style={{ padding: '20px', color: '#dc2626' }}>{error.value}</p>
                        ) : patients.value.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                <p style={{ fontSize: '16px', margin: 0 }}>Aucun dossier patient enregistré.</p>
                            </div>
                        ) : (
                            <div>
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
                                    {paginatedPatients.value.map((patient) => {
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

                                                    <button
                                                        onClick={() => handleOpenViewModal(patient)}
                                                        style={viewBtnStyle}
                                                        title="Voir Détails"
                                                    >
                                                        Voir
                                                    </button>

                                                    <button
                                                        onClick={() => handleOpenEditModal(patient)}
                                                        style={{ ...editBtnStyle, marginLeft: '6px' }}
                                                        title="Modifier"
                                                    >
                                                        Modifier
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeletePatient(patient)}
                                                        style={{ ...deleteBtnStyle, marginLeft: '6px' }}
                                                        title="Supprimer"
                                                    >
                                                        Supprimer
                                                    </button>

                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>

                                {/* BARRE DE PAGINATION */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    backgroundColor: '#f8fafc',
                                    borderTop: '1px solid #e2e8f0',
                                    fontSize: '13px',
                                    color: '#64748b',
                                }}>
                                    <div>
                                        Affichage de {((currentPage.value - 1) * pageSize.value) + 1} à {Math.min(currentPage.value * pageSize.value, patients.value.length)} sur {patients.value.length} patients
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => goToPage(currentPage.value - 1)}
                                            disabled={currentPage.value === 1}
                                            style={{
                                                ...pageBtnStyle,
                                                opacity: currentPage.value === 1 ? 0.5 : 1,
                                                cursor: currentPage.value === 1 ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            ◀ Précédent
                                        </button>

                                        {Array.from({ length: totalPages.value }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => goToPage(p)}
                                                style={{
                                                    ...pageBtnStyle,
                                                    backgroundColor: currentPage.value === p ? '#2563eb' : '#ffffff',
                                                    color: currentPage.value === p ? '#ffffff' : '#334155',
                                                    fontWeight: currentPage.value === p ? '700' : '500',
                                                    border: currentPage.value === p ? '1px solid #2563eb' : '1px solid #cbd5e1',
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => goToPage(currentPage.value + 1)}
                                            disabled={currentPage.value === totalPages.value}
                                            style={{
                                                ...pageBtnStyle,
                                                opacity: currentPage.value === totalPages.value ? 0.5 : 1,
                                                cursor: currentPage.value === totalPages.value ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            Suivant ▶
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modales */}
                    <PatientModal
                        isOpen={isModalOpen.value}
                        mode={modalMode.value}
                        patient={selectedPatient.value}
                        onClose={() => isModalOpen.value = false}
                        onSubmitPatient={handleSavePatient}
                    />

                    <LoginModal
                        isOpen={isLoginModalOpen.value}
                        onClose={() => isLoginModalOpen.value = false}
                        onLogin={handleLogin}
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
    backgroundColor: '#eff6ff',
    color: '#2563eb',
};

const editBtnStyle = {
    ...btnBaseStyle,
    backgroundColor: '#fffbeb',
    color: '#d97706',
};

const deleteBtnStyle = {
    ...btnBaseStyle,
    backgroundColor: '#fef2f2',
    color: '#dc2626',
};

const pageBtnStyle = {
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: '12px',
    cursor: 'pointer',
};