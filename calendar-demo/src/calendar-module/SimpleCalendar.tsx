import { useState } from 'react';
import './styles/simple-calendar.css';

// Simple Event type
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  time?: string; // Format: HH:MM
  description?: string;
}

interface SimpleCalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ 
  events = [], 
  onDateClick,
  onEventClick 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get first day of month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Get last day of month
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date);
    const lastDay = getLastDayOfMonth(date);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0);
    const prevMonthDays = prevMonthLastDay.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(date.getFullYear(), date.getMonth() - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(date.getFullYear(), date.getMonth(), i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(date.getFullYear(), date.getMonth() + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  // Check if date is weekend
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    if (onDateClick) {
      onDateClick(dateStr);
    }
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  // Get selected date events
  const selectedDateEvents = selectedDate 
    ? events.filter(event => event.date === selectedDate)
    : [];

  return (
    <div className="calendar-layout">
      <div className="calendar-main">
        {/* Toolbar */}
        <div className="calendar-toolbar">
          <h2 className="calendar-month-label">{monthName}</h2>
          <div className="calendar-toolbar-controls">
            <button onClick={goToPreviousMonth} className="btn btn-secondary">
              Tháng trước
            </button>
            <button onClick={goToToday} className="btn btn-secondary">
              Hôm nay
            </button>
            <button onClick={goToNextMonth} className="btn btn-secondary">
              Tháng sau
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {/* Day names */}
          {dayNames.map((name, index) => (
            <div 
              key={name} 
              className={`calendar-day-name ${index === 0 || index === 6 ? 'weekend' : ''}`}
            >
              {name}
            </div>
          ))}

          {/* Calendar cells */}
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const dateStr = formatDate(day.date);
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={index}
                className={`calendar-cell ${!day.isCurrentMonth ? 'outside' : ''} ${
                  isToday(day.date) ? 'today' : ''
                } ${isSelected ? 'selected' : ''} ${isWeekend(day.date) ? 'weekend' : ''}`}
                onClick={() => handleDateClick(day.date)}
              >
                <div className="calendar-cell-header">
                  <span className="calendar-date">{day.date.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <span className="calendar-event-count">{dayEvents.length} sự kiện</span>
                  )}
                </div>

                {/* Events */}
                {dayEvents.length > 0 && (
                  <div className="calendar-events">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="calendar-event-chip"
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        {event.time && (
                          <span className="calendar-event-time">{event.time}</span>
                        )}
                        <span className="calendar-event-title">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="calendar-more">+{dayEvents.length - 3} khác</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="calendar-sidebar">
        <div className="calendar-sidebar-header">
          <div>
            <h3 className="calendar-sidebar-title">
              {selectedDate ? 'Chi tiết ngày' : 'Chưa chọn ngày'}
            </h3>
            {selectedDate && (
              <p className="calendar-sidebar-date">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        <div className="calendar-sidebar-body">
          {selectedDate && selectedDateEvents.length > 0 ? (
            selectedDateEvents.map(event => (
              <div key={event.id} className="calendar-sidebar-event">
                <div className="calendar-sidebar-event-header">
                  <h4>{event.title}</h4>
                </div>
                <div className="calendar-sidebar-meta">
                  {event.time && <span>🕒 {event.time}</span>}
                  {event.description && <span>{event.description}</span>}
                </div>
              </div>
            ))
          ) : selectedDate ? (
            <div className="empty-state subtle">
              <p>Không có sự kiện nào trong ngày này</p>
            </div>
          ) : (
            <div className="empty-state subtle">
              <p>Chọn một ngày để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendar;
