import { DoctorCategory, MedicalAid } from './types';

export const DoctorCategories: Record<DoctorCategory, string> = {
  [DoctorCategory.Unknown]: 'Select a specialty',
  [DoctorCategory.GeneralPractitioner]: 'General Practitioner',
  [DoctorCategory.Psychologist]: 'Psychologist',
  [DoctorCategory.Gynecologist]: 'Gynecologist',
  [DoctorCategory.Physiotherapist]: 'Physiotherapist',
  [DoctorCategory.WellnessCenter]: 'Wellness Center',
  [DoctorCategory.Biokineticist]: 'Biokineticist',
  [DoctorCategory.Dentist]: 'Dentist',
};

export const MedicalAids: Record<MedicalAid, string> = {
  [MedicalAid.DiscoveryHealth]: 'Discovery Health',
  [MedicalAid.Momentum]: 'Momentum',
  [MedicalAid.FedHealth]: 'FedHealth',
  [MedicalAid.Bonitas]: 'Bonitas',
  [MedicalAid.Medshield]: 'Medshield',
  [MedicalAid.Medihelp]: 'Medihelp',
  [MedicalAid.EssentialMed]: 'EssentialMed',
  [MedicalAid.Profmed]: 'Profmed',
  [MedicalAid.Bestmed]: 'Bestmed',
  [MedicalAid.Platinum]: 'Platinum',
};
