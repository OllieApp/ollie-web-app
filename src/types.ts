export interface AuthUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    category: number;
    gender: number;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    countryCode: string;
    zipCode?: string;
    city?: string;
    address?: string;
    medicalAidNumber?: string;
    medicalAidPlan?: string;
    medicalAid?: MedicalAid;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isActive: boolean;
}

export interface Practitioner {
    id: string;
    title: string;
    email?: string;
    phone?: string;
    bio?: string;
    description?: string;
    address?: string;
    appointmentTimeSlot: number;
    consultationPricingRange: number;
    medicalAids: MedicalAid[];
    category: DoctorCategory;
    location?: Location;
    isActive: boolean;
    isVerified: boolean;
    rating: number;
    schedules: PractitionerSchedule[];
    gender: Gender;
    languages: Language[];
    avatarUrl?: string;
}

export interface Location {
    latitude: number;
    longitude: number;
}

export enum DoctorCategory {
    Unknown,
    GeneralPractitioner = 1,
    Psychologist,
    Gynecologist,
    Physiotherapist,
    WellnessCenter,
}

export enum DoctorAvailability {
    Weekdays,
    WeekdaysAndSat,
    AllDays,
}

export enum Gender {
    Other = 0,
    Male = 1,
    Female = 2,
}

export enum Language {
    isiZulu = 1,
    isiXhosa = 2,
    Afrikaans = 3,
    English = 4,
    // eslint-disable-next-line @typescript-eslint/camelcase
    Sesotho_sa_Leboa = 5,
    Setswana = 6,
    Sesotho = 7,
    Xitsonga = 8,
    siSwati = 9,
    Tshivenda = 10,
    isiNdebele = 11,
}

export interface PractitionerSchedule {
    daysOfWeek: WeekDay[];
    startTime: string;
    endTime: string;
}

export enum WeekDay {
    Sunday = 1,
    Monday = 2,
    Tuesday = 3,
    Wednesday = 4,
    Thursday = 5,
    Friday = 6,
    Saturday = 7,
}

export enum MedicalAid {
    DiscoveryHealth = 1,
    FedHealth = 2,
    Medihelp = 3,
    Medshield = 4,
    Bonitas = 5,
    Momentum = 6,
    EssentialMed = 7,
    Profmed = 8,
    Bestmed = 9,
    Platinum = 10,
}
