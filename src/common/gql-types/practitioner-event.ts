export interface PractitionerEvent {
  id: string | null;
  title: string;
  description?: string;
  location?: string;
  hex_color: string;
  start_time: Date;
  end_time: Date;
  is_confirmed: boolean;
  is_all_day: boolean;
}
