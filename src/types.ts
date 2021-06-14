export interface AuthUser {
  firstName: string;
  lastName: string;
  category: number;
  gender: number;
  email?: string;
  password?: string;
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
  Biokineticist,
  Dentist,
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

export enum WeekDay {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

export interface Address {
  line1?: string;
  line2: string;
  suburb?: string;
  city?: string;
  postalCode?: string;
  stateProvinceCounty?: string;
  countryCode?: string;
  location?: Location | null;
}

export interface PractitionerSchedule {
  daysOfWeek: WeekDay[];
  startTime: string;
  endTime: string;
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

export interface Practitioner {
  id: string;
  title: string;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  description?: string | null;
  address?: Address;
  appointmentTimeSlot: number;
  consultationPricingRange: number;
  medicalAids: MedicalAid[];
  category: DoctorCategory;
  location?: Location | null;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  schedules: PractitionerSchedule[];
  gender: Gender;
  languages: Language[];
  avatarUrl?: string | null;
}

export interface User {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl?: string | null;
  countryCode: string;
  zipCode?: string | null;
  city?: string | null;
  address?: string | null;
  medicalAidNumber?: string | null;
  medicalAidPlan?: string | null;
  medicalAid?: MedicalAid | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
}
