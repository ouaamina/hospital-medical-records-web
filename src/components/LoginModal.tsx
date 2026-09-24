import { defineComponent, ref, reactive, PropType } from 'vue';
import { LoginCredentials } from '../types/auth';

export default defineComponent({
    name: 'LoginModal',
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
        onClose: {
            type: Function as PropType<() => void>,
            required: true,
        },
        onLogin: {
            type: Function as PropType<(credentials: LoginCredentials) => Promise<void>>,
            required: true,
        },
    },
    setup(props) {
        const isSubmitting = ref(false);
        const errorMessage = ref<string | null>(null);
        const showPassword = ref(false);

        const form = reactive<LoginCredentials>({
            email: '',
            password: '',
        });

        const handleSubmit = async (e: Event) => {
            e.preventDefault();
            if (!form.email || !form.password) {
                errorMessage.value = 'Veuillez remplir tous les champs requis.';
                return;
            }

            isSubmitting.value = true;
            errorMessage.value = null;

            try {
                await props.onLogin({ ...form });
                // Reset du formulaire en cas de succès
                form.email = '';
                form.password = '';
                props.onClose();
            } catch (err: unknown) {
                errorMessage.value = err instanceof Error
                    ? err.message
                    : 'Identifiants incorrects ou erreur réseau.';
            } finally {
                isSubmitting.value = false;
            }
        };

        return () => {
            if (!props.isOpen) return null;

            return (
                <div style={styles.overlay}>
                    <div style={styles.modalCard}>
                        {/* En-tête */}
                        <div style={styles.header}>
                            <div style={styles.iconContainer}>
                                🔒
                            </div>
                            <h3 style={styles.title}>Connexion Sécurisée</h3>
                            <p style={styles.subtitle}>Accédez au système de gestion médicale</p>
                        </div>

                        {/* Bannière d'erreur */}
                        {errorMessage.value && (
                            <div style={styles.errorBanner}>
                                ⚠️ {errorMessage.value}
                            </div>
                        )}

                        {/* Formulaire */}
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.field}>
                                <label style={styles.label}>Adresse Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="medecin@hopital.fr"
                                    value={form.email}
                                    onInput={(e: Event) => form.email = (e.target as HTMLInputElement).value}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Mot de passe</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        type={showPassword.value ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={form.password}
                                        onInput={(e: Event) => form.password = (e.target as HTMLInputElement).value}
                                        style={styles.input}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => showPassword.value = !showPassword.value}
                                        style={styles.togglePasswordBtn}
                                        title={showPassword.value ? 'Masquer' : 'Afficher'}
                                    >
                                        {showPassword.value ? '👁️' : '🙈'}
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={styles.footer}>
                                <button
                                    type="button"
                                    onClick={props.onClose}
                                    style={styles.cancelBtn}
                                    disabled={isSubmitting.value}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting.value}
                                    style={styles.submitBtn}
                                >
                                    {isSubmitting.value ? 'Connexion en cours...' : 'Se connecter'}
                                </button>
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
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
    },
    header: {
        padding: '24px 24px 12px 24px',
        textAlign: 'center' as const,
        backgroundColor: '#ffffff',
    },
    iconContainer: {
        fontSize: '32px',
        marginBottom: '8px',
    },
    title: {
        margin: 0,
        fontSize: '20px',
        color: '#0f172a',
        fontWeight: 700,
    },
    subtitle: {
        margin: '4px 0 0 0',
        fontSize: '13px',
        color: '#64748b',
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        padding: '10px 20px',
        fontSize: '13px',
        borderLeft: '4px solid #ef4444',
        margin: '0 24px 12px 24px',
        borderRadius: '4px',
    },
    form: {
        padding: '0 24px 24px 24px',
    },
    field: {
        marginBottom: '16px',
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
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        boxSizing: 'border-box' as const,
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    passwordWrapper: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
    },
    togglePasswordBtn: {
        position: 'absolute' as const,
        right: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        opacity: 0.7,
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '24px',
    },
    cancelBtn: {
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        color: '#475569',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
    },
    submitBtn: {
        flex: 1,
        padding: '10px 18px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    },
};