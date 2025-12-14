import SimpleCalendar, { CalendarEvent } from './calendar-module/SimpleCalendar';
import './calendar-module/styles/simple-calendar.css';
import './App.css';

// Sample events data
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Họp team',
    date: '2025-12-09',
    time: '09:00',
    description: 'Họp planning sprint mới',
  },
  {
    id: '2',
    title: 'Review code',
    date: '2025-12-09',
    time: '14:00',
    description: 'Review pull requests',
  },
  {
    id: '3',
    title: 'Demo sản phẩm',
    date: '2025-12-10',
    time: '10:00',
    description: 'Demo cho khách hàng',
  },
  {
    id: '4',
    title: 'Training',
    date: '2025-12-11',
    time: '15:00',
    description: 'Đào tạo công nghệ mới',
  },
  {
    id: '5',
    title: 'Sinh nhật công ty',
    date: '2025-12-15',
    time: '18:00',
    description: 'Tiệc kỷ niệm 5 năm thành lập',
  },
];

function App() {
  const handleDateClick = (date: string) => {
    console.log('Date clicked:', date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    alert(`Sự kiện: ${event.title}\nThời gian: ${event.time || 'Không có'}\nMô tả: ${event.description || 'Không có'}`);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
        Lịch nhắc hẹn
      </h1>
      <SimpleCalendar 
        events={sampleEvents}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />
    </div>
  );
}

export default App;
