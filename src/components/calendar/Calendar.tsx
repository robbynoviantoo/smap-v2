'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from '@fullcalendar/core';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import { eventService, CalendarEventItem } from '@/services/eventService';
import { useSidebar } from '@/context/SidebarContext';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';
import { RefreshCw, Trash2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const Calendar: React.FC = () => {
  const { t } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventLevel, setEventLevel] = useState('Primary');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isExpanded, isMobileOpen } = useSidebar();
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: 'danger',
    Success: 'success',
    Primary: 'primary',
    Warning: 'warning',
  };

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const res = await eventService.getEvents();
      if (res.data) {
        const mapped = res.data.map((e: CalendarEventItem) => ({
          id: e.id.toString(),
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: e.all_day ?? true,
          extendedProps: {
            calendar: e.color || 'Primary',
          },
        }));
        setEvents(mapped);
      }
    } catch {
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // 1. Listen to sidebar state transitions (Expand, Collapse, Hover, Mobile Drawer)
  // Calls calendarApi.updateSize() repeatedly during and immediately after the 300ms CSS transition
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    calendarApi.updateSize();
    const timers = [
      setTimeout(() => calendarApi.updateSize(), 50),
      setTimeout(() => calendarApi.updateSize(), 150),
      setTimeout(() => calendarApi.updateSize(), 300),
      setTimeout(() => calendarApi.updateSize(), 400),
    ];

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isExpanded, isMobileOpen]);

  // 2. Continuous ResizeObserver on calendar wrapper: auto-adjusts on ANY container size change
  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        calendarApi.updateSize();
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split('T')[0] || '');
    setEventEndDate(event.end?.toISOString().split('T')[0] || '');
    setEventLevel(event.extendedProps.calendar || 'Primary');
    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    if (!eventTitle.trim()) {
      alert.error('Judul agenda/kegiatan wajib diisi!');
      return;
    }

    try {
      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent.id as string, {
          title: eventTitle,
          start: eventStartDate,
          end: eventEndDate,
          color: eventLevel,
        });
        alert.success('Agenda kegiatan berhasil diperbarui!');
      } else {
        await eventService.createEvent({
          title: eventTitle,
          start: eventStartDate,
          end: eventEndDate,
          color: eventLevel,
        });
        alert.success('Agenda kegiatan berhasil ditambahkan!');
      }
      closeModal();
      resetModalFields();
      loadEvents();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menyimpan kegiatan.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    const confirmed = await alert.confirm(
      'Hapus Agenda Kegiatan?',
      `Agenda "${selectedEvent.title}" akan dihapus dari kalender.`
    );
    if (!confirmed) return;

    try {
      await eventService.deleteEvent(selectedEvent.id as string);
      alert.success('Agenda kegiatan berhasil dihapus.');
      closeModal();
      resetModalFields();
      loadEvents();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal menghapus kegiatan.');
    }
  };

  const handleSyncHolidays = async () => {
    try {
      setIsSyncing(true);
      await eventService.syncHolidays(new Date().getFullYear());
      alert.success('Berhasil sinkronisasi hari libur nasional Indonesia!');
      loadEvents();
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Gagal sinkronisasi libur nasional.');
    } finally {
      setIsSyncing(false);
    }
  };

  const resetModalFields = () => {
    setEventTitle('');
    setEventStartDate('');
    setEventEndDate('');
    setEventLevel('Primary');
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={loadEvents}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('common.refresh')}</span>
          </button>

          <button
            onClick={handleSyncHolidays}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-xl hover:bg-brand-100 shadow-sm transition-all"
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CalendarIcon className="w-3.5 h-3.5" />
            )}
            <span>{t('calendar.sync_holidays')}</span>
          </button>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
        >
          <span>{t('calendar.add_agenda')}</span>
        </button>
      </div>

      {/* Calendar container with ResizeObserver ref and overflow containment */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 w-full overflow-hidden shadow-sm">
        <div ref={containerRef} className="custom-calendar w-full overflow-hidden">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            handleWindowResize={true}
            windowResizeDelay={50}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
          />
        </div>

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6 lg:p-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h5 className="font-bold text-gray-900 dark:text-white text-base">
                {selectedEvent ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Kegiatan Baru'}
              </h5>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Judul Kegiatan / Event <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Audit K3, Training Eksternal, Rapat Bulanan"
                  className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  Label Warna
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {Object.entries(calendarsEvents).map(([key]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEventLevel(key)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        eventLevel === key
                          ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              {selectedEvent ? (
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('common.delete')}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleAddOrUpdateEvent}
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                >
                  {selectedEvent ? t('common.save') : t('calendar.add_agenda')}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorKey = eventInfo.event.extendedProps?.calendar?.toLowerCase() || 'primary';
  const colorClass = `fc-bg-${colorKey}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm text-[11px]`}>
      <div className="fc-event-title font-medium">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
