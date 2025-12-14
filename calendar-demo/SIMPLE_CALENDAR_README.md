# Simple Calendar Module

## Mô tả
Calendar đơn giản chỉ tập trung vào giao diện, không có API hay phần quản lý status phức tạp.

## Cách sử dụng

### 1. Copy files
Copy các file sau vào project của bạn:
```
calendar-module/
  ├── SimpleCalendar.tsx
  └── styles/
      └── simple-calendar.css
```

### 2. Thêm CSS variables vào global CSS
```css
:root {
  --color-primary: #006d77;
  --color-secondary: #83c5be;
  --color-danger: #c1121f;
  --color-muted: #6b7280;
  --transition-fast: 0.15s ease;
}
```

### 3. Sử dụng trong component

```tsx
import SimpleCalendar, { CalendarEvent } from './calendar-module/SimpleCalendar';
import './calendar-module/styles/simple-calendar.css';

const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'Họp team',
    date: '2025-12-09', // Format: YYYY-MM-DD
    time: '09:00',      // Optional: HH:MM
    description: 'Họp planning sprint mới', // Optional
  },
  // ... more events
];

function App() {
  const handleDateClick = (date: string) => {
    console.log('Date clicked:', date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
  };

  return (
    <SimpleCalendar 
      events={events}
      onDateClick={handleDateClick}
      onEventClick={handleEventClick}
    />
  );
}
```

## Props

### `SimpleCalendar`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `events` | `CalendarEvent[]` | No | Danh sách sự kiện |
| `onDateClick` | `(date: string) => void` | No | Callback khi click vào ngày |
| `onEventClick` | `(event: CalendarEvent) => void` | No | Callback khi click vào sự kiện |

### `CalendarEvent`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | ID duy nhất của sự kiện |
| `title` | `string` | Yes | Tiêu đề sự kiện |
| `date` | `string` | Yes | Ngày (YYYY-MM-DD) |
| `time` | `string` | No | Giờ (HH:MM) |
| `description` | `string` | No | Mô tả chi tiết |

## Features

✅ Hiển thị lịch theo tháng
✅ Điều hướng tháng (trước/sau/hôm nay)
✅ Hiển thị sự kiện trên từng ngày
✅ Click vào ngày để xem chi tiết
✅ Click vào sự kiện để xem thông tin
✅ Highlight ngày hôm nay
✅ Highlight cuối tuần
✅ Sidebar hiển thị chi tiết ngày được chọn
✅ Responsive design
✅ Không cần API, mock data, hay dependencies phức tạp

## Không bao gồm

❌ API integration
❌ React Query
❌ Axios
❌ Form handling (react-hook-form)
❌ Status management
❌ CRUD operations
❌ Authentication
❌ Backend integration

## Dependencies

Chỉ cần React. Không cần thêm package nào khác!

## Customization

Bạn có thể tùy chỉnh màu sắc bằng cách thay đổi CSS variables:

```css
:root {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  --color-danger: #your-color;
  --color-muted: #your-color;
}
```

Hoặc chỉnh sửa trực tiếp file `simple-calendar.css` để thay đổi layout, spacing, borders, v.v.
