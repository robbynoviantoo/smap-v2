import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export interface CalendarEventItem {
  id: number | string;
  title: string;
  start: string;
  end?: string;
  all_day?: boolean;
  color?: string;
}

export const eventService = {
  async getEvents() {
    const res = await apiClient.get<ApiResponse<CalendarEventItem[]>>('/events');
    return res.data;
  },

  async createEvent(data: {
    title: string;
    start: string;
    end?: string;
    all_day?: boolean;
    color?: string;
  }) {
    const res = await apiClient.post<ApiResponse<CalendarEventItem>>('/events', data);
    return res.data;
  },

  async updateEvent(
    id: number | string,
    data: {
      title: string;
      start: string;
      end?: string;
      all_day?: boolean;
      color?: string;
    }
  ) {
    const res = await apiClient.put<ApiResponse<CalendarEventItem>>(`/events/${id}`, data);
    return res.data;
  },

  async deleteEvent(id: number | string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/events/${id}`);
    return res.data;
  },

  async syncHolidays(year?: number) {
    const res = await apiClient.post<ApiResponse<any>>('/events/sync-holidays', { year });
    return res.data;
  },
};
