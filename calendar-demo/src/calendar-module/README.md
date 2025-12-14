# Calendar Module - Chức năng Xem Lịch

Module xem lịch độc lập cho ứng dụng PawCal, được tách riêng để dễ dàng quản lý và tái sử dụng.

## 📁 Cấu trúc folder

```
calendar-module/
├── CalendarPage.tsx          # Component chính của trang Calendar
├── constants.ts              # Các hằng số (DAY_NAMES, default values, etc.)
├── types.ts                  # Type definitions (CalendarDay, CalendarFormValues, etc.)
├── components/               # Components con (nếu cần tách thêm)
├── hooks/
│   └── useCalendar.ts       # Custom hook quản lý state và logic của calendar
├── styles/
│   └── calendar.css         # CSS styles riêng cho calendar
└── utils/
    ├── dateUtils.ts         # Xử lý ngày tháng
    ├── timeUtils.ts         # Xử lý thời gian
    ├── reminderUtils.ts     # Xử lý reminder data
    └── errorUtils.ts        # Xử lý lỗi
```

## 🎯 Tính năng

### 1. **Xem lịch theo tháng**
- Hiển thị calendar grid với 42 ô (6 tuần)
- Highlight ngày hôm nay
- Highlight ngày đang chọn
- Phân biệt cuối tuần
- Hiển thị các sự kiện (reminder) trong mỗi ngày

### 2. **Quản lý Reminder**
- Tạo reminder mới từ calendar
- Sửa reminder khi click vào event
- Xóa reminder với confirm dialog
- Chọn nhiều thú cưng cho 1 reminder
- Validation:
  - Không tạo/sửa lịch hẹn trong quá khứ
  - Không tạo trùng lịch (cùng owner, cùng ngày giờ)

### 3. **Sidebar chi tiết**
- Hiển thị danh sách events trong ngày đang chọn
- Thông tin chi tiết: thời gian, khách hàng, số điện thoại, thú cưng
- Trạng thái reminder (Pending, Completed, Cancelled)
- Nút tạo mới nhanh cho ngày đang chọn

### 4. **Auto-refresh**
- Tự động làm mới dữ liệu mỗi 15 giây
- Manual refresh button
- Clear cache và refetch

## 🔧 Dependencies

### External libraries
- `react` và `react-dom`
- `@tanstack/react-query` - Data fetching và caching
- `react-hook-form` - Form management
- `axios` - HTTP client (qua apiClient)

### Internal dependencies
- `../../services/apiClient` - API client
- `../../services/entityApi` - CRUD operations
- `../../components/Modal` - Modal component
- `../../components/ConfirmDialog` - Confirm dialog
- `../../hooks/useOwnerSearch` - Search owner
- `../../hooks/useConfirmDialog` - Confirm dialog hook
- `../../hooks/useAutoRefresh` - Auto refresh hook
- `../../types/api` - API types
- `../../constants/reminderStatus` - Reminder status constants

## 📝 Sử dụng

### Import và sử dụng CalendarPage

```tsx
import CalendarPage from './calendar-module/CalendarPage';

function App() {
  return (
    <div>
      <CalendarPage />
    </div>
  );
}
```

### Sử dụng useCalendar hook riêng

```tsx
import { useCalendar } from './calendar-module/hooks/useCalendar';

function CustomCalendarView() {
  const reminders = []; // fetch your reminders
  
  const {
    calendarDays,
    selectedDateKey,
    setSelectedDateKey,
    monthLabel,
    changeMonth,
    goToToday
  } = useCalendar(reminders);
  
  // Render your custom UI
}
```

### Sử dụng utilities

```tsx
import { formatDateKey, coerceDateKey } from './calendar-module/utils/dateUtils';
import { toTimeString, coerceTimeInputValue } from './calendar-module/utils/timeUtils';
import { getReminderTitle, formatOwnerDisplay } from './calendar-module/utils/reminderUtils';

// Date utilities
const today = formatDateKey(new Date()); // "2024-12-09"
const dateKey = coerceDateKey("2024-12-09T10:30:00"); // "2024-12-09"

// Time utilities
const time = toTimeString(0.5); // "12:00"
const timeInput = coerceTimeInputValue("10:30"); // "10:30"

// Reminder utilities
const title = getReminderTitle(reminder);
const ownerDisplay = formatOwnerDisplay(reminder);
```

## 🎨 Styling

CSS styles được tách riêng vào `styles/calendar.css`. Các class chính:

- `.calendar-layout` - Container chính
- `.calendar-main` - Phần calendar grid
- `.calendar-sidebar` - Sidebar chi tiết
- `.calendar-grid` - Grid 7 cột
- `.calendar-cell` - Mỗi ô ngày
- `.calendar-event-chip` - Event chip trong cell
- `.calendar-toolbar` - Toolbar điều khiển

Responsive breakpoints:
- `max-width: 1100px` - Chuyển layout thành 1 cột
- `max-width: 720px` - Tối ưu cho mobile

## 🔄 Data Flow

```
CalendarPage
  ↓
useQuery (fetch reminders) → useCalendar hook → Calendar UI
  ↓                              ↓
useMutation (CRUD)          calendarDays, selectedDay, etc.
  ↓
queryClient.invalidateQueries
```

## 🚀 Tối ưu hóa

1. **Memoization**: Sử dụng `useMemo` cho các tính toán phức tạp
2. **Query caching**: `staleTime` 5 phút cho pets data
3. **Optimistic updates**: Update UI trước khi server response
4. **Auto-refresh**: 15s interval, có thể tắt nếu cần

## 📦 Export

File `CalendarPage.tsx` export default component. Có thể thêm index.ts để export tất cả:

```tsx
// calendar-module/index.ts
export { default as CalendarPage } from './CalendarPage';
export { useCalendar } from './hooks/useCalendar';
export * from './types';
export * from './constants';
export * as dateUtils from './utils/dateUtils';
export * as timeUtils from './utils/timeUtils';
export * as reminderUtils from './utils/reminderUtils';
```

## 🔐 Permissions

Module này cần API keys và permissions phù hợp để:
- Đọc danh sách reminders
- Tạo/sửa/xóa reminders
- Đọc danh sách owners và pets
- Clear cache

## 📄 License

Internal module cho PawCal project.

## 👥 Contributors

- Development Team

---

**Last updated**: December 2024
