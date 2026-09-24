export type Department = 'CARDIOLOGY' | 'EMERGENCY' | 'ONCOLOGY' | 'GENERAL';

export interface CardiologyDetails {
    ecgResults?: string;
    restingHeartRate?: number;
    bloodPressure?: string;
}

export interface EmergencyDetails {
    arrivalTime?: string;
    triageLevel?: number;
    initialSeverity?: string;
}

export interface OncologyDetails {
    tumorType?: string;
    stage?: string;
    currentTreatment?: string;
}

export interface GeneralDetails {
    consultationReason?: string;
    referringDoctor?: string;
    notes?: string;
}

export interface Patient {
    id?: number;
    firstName: string;
    lastName: string;
    admissionDate: string;
    department: Department;
    cardiology?: CardiologyDetails;
    emergency?: EmergencyDetails;
    oncology?: OncologyDetails;
    general?: GeneralDetails;
}