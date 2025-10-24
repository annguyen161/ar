# Tính năng Model Follow Camera trong AR

## Mô tả
Tính năng này cho phép model em bé "theo" camera khi người dùng di chuyển điện thoại Android trong chế độ AR. Model sẽ luôn xuất hiện phía trước camera, tạo cảm giác như em bé đang bay theo người dùng.

## Cách hoạt động

### 1. Thay đổi AR Placement
- Đã thay đổi `ar-placement` từ `"floor"` sang `"wall"` trong model-viewer
- Điều này cho phép model xuất hiện ở vị trí tự do hơn, không bị gắn vào mặt sàn

### 2. Camera Tracking
Có 2 phương pháp tracking được implement:

#### A. WebXR API Direct Access (Ưu tiên)
- Truy cập trực tiếp vào WebXR session thông qua model-viewer
- Sử dụng `frame.getViewerPose()` để lấy vị trí và hướng camera thực tế
- Tính toán vị trí mới của model dựa trên camera transform
- Cập nhật position và rotation của model mỗi frame
- **Ưu điểm**: Tracking chính xác, smooth, realtime
- **Nhược điểm**: Phụ thuộc vào WebXR API có sẵn

#### B. Simple Camera Following (Fallback)
- Sử dụng `getCameraOrbit()` của model-viewer
- Tính toán vị trí dựa trên góc quay camera
- Cập nhật `cameraTarget` để tạo hiệu ứng following
- **Ưu điểm**: Đơn giản, không cần WebXR API
- **Nhược điểm**: Ít chính xác hơn

### 3. Cài đặt
```javascript
// Khoảng cách model từ camera
const distance = 1.5; // meters (có thể điều chỉnh)

// Độ cao so với eye level
const heightOffset = -0.4; // meters (âm = thấp hơn)

// Tốc độ cập nhật
const updateInterval = 50; // milliseconds
```

## Cách sử dụng

### Cho Android (WebXR)
1. Mở trang web trên Chrome Android
2. Nhấn nút "Xem AR"
3. Cho phép truy cập camera
4. Model sẽ xuất hiện và tự động follow khi bạn xoay điện thoại

### Cho iOS (Quick Look)
- Tính năng follow camera không áp dụng cho iOS
- iOS sử dụng AR Quick Look với behavior mặc định của Apple
- Model sẽ đứng cố định như trước

## Điều chỉnh

### Thay đổi khoảng cách
Trong `js/main.js`, tìm dòng:
```javascript
const distance = 1.5; // meters
```
- Tăng giá trị: Model xa hơn
- Giảm giá trị: Model gần hơn

### Thay đổi độ cao
```javascript
const heightOffset = -0.4; // meters
```
- Giá trị âm: Model thấp hơn eye level
- Giá trị dương: Model cao hơn eye level
- 0: Model ngang tầm mắt

### Thay đổi tốc độ update
```javascript
const updateInterval = 50; // milliseconds
```
- Giảm giá trị: Update nhanh hơn, smooth hơn, tốn pin hơn
- Tăng giá trị: Update chậm hơn, tiết kiệm pin hơn, có thể lag

## Performance

### Tối ưu hóa
- Sử dụng `requestAnimationFrame` cho smooth animation
- Throttling updates để tránh quá tải
- Automatic cleanup khi thoát AR mode

### Khuyến nghị
- Test trên nhiều thiết bị Android khác nhau
- Đảm bảo thiết bị hỗ trợ WebXR
- Có fallback method nếu WebXR không available

## Troubleshooting

### Model không di chuyển
1. Kiểm tra console log xem có lỗi không
2. Đảm bảo thiết bị hỗ trợ WebXR
3. Thử làm mới trang và vào lại AR

### Model di chuyển giật
1. Tăng `updateInterval` lên 100ms
2. Giảm số lượng particles trong background
3. Kiểm tra performance của thiết bị

### Model quá gần/xa
1. Điều chỉnh biến `distance` trong code
2. Test lại với giá trị mới

## Browser Support
- ✅ Chrome Android (ARCore supported devices)
- ✅ Samsung Internet (ARCore supported devices)
- ❌ iOS Safari (uses Quick Look instead)
- ❌ Desktop browsers (no AR support)

## Ghi chú kỹ thuật
- Code tự động detect iOS vs Android
- iOS sẽ skip camera following logic
- WebXR session được cleanup khi thoát AR
- Sử dụng Symbol để access model-viewer internals một cách an toàn
