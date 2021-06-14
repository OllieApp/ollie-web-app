import { Address, PractitionerSchedule } from './../../types';
export interface UpdatePractitionerRequest {
  title?: string;
  email?: string;
  phone?: string;
  bio?: string;
  address?: Partial<Address>;
  consultationPricingFrom?: number;
  consultationPricingTo?: number;
  schedules?: PractitionerSchedule[];
}
