export default interface PractitionerEvent {
  id: string | null;
  title: string;
  description?: string;
  location?: string;
  hex_color: string;
  start_time: string;
  end_time: string;
  is_confirmed: boolean;
  is_all_day: boolean;
}
