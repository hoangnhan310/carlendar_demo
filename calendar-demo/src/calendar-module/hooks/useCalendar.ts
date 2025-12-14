/**
 * useCalendar Hook
 * Custom hook để quản lý calendar state và logic
 */

import { useMemo, useState } from 'react';
import type { Reminder } from '../../types/api';
import type { CalendarDay } from '../types';
import { formatDateKey, getMonthKey } from '../utils/dateUtils';
import { reminderDateKey, reminderMinutes } from '../utils/reminderUtils';

export const useCalendar = (events: Reminder[]) => {
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  const monthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);

  const monthEvents = useMemo(
    () =>
      events.filter((event) => {
        const dateKey = reminderDateKey(event);
        return dateKey ? dateKey.startsWith(monthKey) : false;
      }),
    [events, monthKey]
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDay = (firstOfMonth.getDay() + 6) % 7;
    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - startDay);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const dateKey = formatDateKey(date);
      const eventsForDay = events
        .filter((event) => reminderDateKey(event) === dateKey)
        .sort((a, b) => {
          const aMinutes = reminderMinutes(a);
          const bMinutes = reminderMinutes(b);
          if (aMinutes === null && bMinutes === null) {
            return 0;
          }
          if (aMinutes === null) {
            return 1;
          }
          if (bMinutes === null) {
            return -1;
          }
          return aMinutes - bMinutes;
        });
      const weekday = date.getDay();

      return {
        date,
        dateKey,
        isToday: dateKey === todayKey,
        isCurrentMonth: date.getMonth() === currentMonth.getMonth(),
        isWeekend: weekday === 0 || weekday === 6,
        events: eventsForDay
      };
    });
  }, [currentMonth, events, todayKey]);

  const selectedDay = useMemo(
    () => calendarDays.find((day) => day.dateKey === selectedDateKey),
    [calendarDays, selectedDateKey]
  );

  const selectedDayEvents = selectedDay?.events ?? [];

  const monthLabel = useMemo(() => {
    const formatted = new Intl.DateTimeFormat('vi-VN', {
      month: 'long',
      year: 'numeric'
    }).format(currentMonth);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [currentMonth]);

  const selectedDayLabel = useMemo(() => {
    if (!selectedDay) {
      return 'Chọn một ngày để xem chi tiết';
    }
    const formatted = new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(selectedDay.date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [selectedDay]);

  const changeMonth = (offset: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(formatDateKey(now));
  };

  return {
    todayKey,
    currentMonth,
    selectedDateKey,
    setSelectedDateKey,
    monthKey,
    monthEvents,
    calendarDays,
    selectedDay,
    selectedDayEvents,
    monthLabel,
    selectedDayLabel,
    changeMonth,
    goToToday
  };
};
