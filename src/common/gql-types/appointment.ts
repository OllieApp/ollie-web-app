import User from './user';

export default interface Appointment {
  id: string;
  status_id: number;
  start_time: string;
  end_time: string;
  doctor_video_url: string;
  is_virtual: boolean;
  user: User;
}
