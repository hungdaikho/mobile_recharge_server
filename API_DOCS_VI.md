# Tài liệu API (Tiếng Việt)

## 1. Xác thực
### Đăng nhập
- **Phương thức:** POST
- **Endpoint:** `/auth/login`
- **Body:**
  - `username` (string): Tên đăng nhập
  - `passwordHash` (string): Mật khẩu đã mã hóa
- **Mô tả:** Đăng nhập hệ thống, trả về token nếu thành công.

---

## 2. Quản trị
### Tạo tài khoản quản trị
- **Phương thức:** POST
- **Endpoint:** `/admin/create`
- **Body:**
  - `username` (string): Tên đăng nhập
  - `passwordHash` (string): Mật khẩu đã mã hóa
  - `role` (string): Vai trò (admin, ...)
- **Mô tả:** Tạo mới tài khoản quản trị.

---

## 3. Tin tức
### Lấy danh sách tin tức
- **Phương thức:** GET
- **Endpoint:** `/news`
- **Query:**
  - `isPublished` (boolean, tuỳ chọn): Lọc theo trạng thái đã xuất bản
- **Mô tả:** Lấy danh sách tin tức.

### Lấy chi tiết tin tức theo slug
- **Phương thức:** GET
- **Endpoint:** `/news/:slug`
- **Mô tả:** Lấy chi tiết tin tức theo slug.

### Tạo tin tức (Yêu cầu đăng nhập)
- **Phương thức:** POST
- **Endpoint:** `/news`
- **Body:**
  - `title` (string): Tiêu đề
  - `slug` (string): Đường dẫn
  - `content` (string): Nội dung
  - `thumbnailUrl` (string): Ảnh đại diện
  - `isPublished` (boolean): Xuất bản ngay hay không
- **Mô tả:** Tạo mới tin tức.

### Cập nhật tin tức (Yêu cầu đăng nhập)
- **Phương thức:** PUT
- **Endpoint:** `/news/:id`
- **Body:**
  - Các trường cần cập nhật (title, content, ...)
- **Mô tả:** Cập nhật tin tức.

### Xóa tin tức (Yêu cầu đăng nhập)
- **Phương thức:** DELETE
- **Endpoint:** `/news/:id`
- **Mô tả:** Xóa tin tức.

---

## 4. Giao dịch
### Tạo giao dịch nạp tiền đơn lẻ
- **Phương thức:** POST
- **Endpoint:** `/transactions`
- **Body:**
  ```json
  {
    "phoneNumber": "0986001234",
    "country": "VN",
    "operator": "VIETTEL",
    "amount": 50000,
    "currency": "VND",
    "type": "TOPUP",
    "paymentMethod": "DIRECT"
  }
  ```
- **Response:**
  ```json
  {
    "id": "uuid",
    "phoneNumber": "0986001234",
    "country": "VN",
    "operator": "VIETTEL",
    "amount": 50000,
    "currency": "VND",
    "status": "SUCCESS",
    "type": "TOPUP",
    "paymentMethod": "DIRECT",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:05Z"
  }
  ```
- **Mô tả:** Tạo giao dịch nạp tiền đơn lẻ và thực hiện nạp tiền ngay lập tức.

### Tạo giao dịch nạp tiền hàng loạt qua Stripe
- **Phương thức:** POST
- **Endpoint:** `/transactions/stripe/create-payment`
- **Body:**
  ```json
  {
    "topups": [
      {
        "phoneNumber": "0986001234",
        "amount": 50000
      },
      {
        "phoneNumber": "0986005678",
        "amount": 100000
      }
    ],
    "country": "VN",
    "operator": "VIETTEL",
    "currency": "VND"
  }
  ```
- **Giới hạn:**
  - Số lượng số điện thoại: 1-10 số/lần
  - Số tiền tối thiểu: 10,000 VND hoặc $0.1 USD
  - Số tiền tối đa mỗi số: 10M VND hoặc $100 USD
  - Tổng số tiền tối đa: 50M VND hoặc $500 USD
  - Tiền tệ hỗ trợ: VND, USD
- **Response:**
  ```json
  {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "transactions": [
      {
        "id": "uuid",
        "phoneNumber": "0986001234",
        "amount": 50000,
        "status": "PENDING",
        "createdAt": "2024-03-20T10:00:00Z",
        "updatedAt": "2024-03-20T10:00:00Z"
      }
    ]
  }
  ```
- **Mô tả:** Tạo giao dịch nạp tiền hàng loạt và khởi tạo thanh toán qua Stripe.

### Webhook Stripe
- **Phương thức:** POST
- **Endpoint:** `/transactions/stripe/webhook`
- **Headers:**
  - `stripe-signature`: Chữ ký xác thực từ Stripe
- **Mô tả:** Webhook nhận kết quả thanh toán từ Stripe. Xử lý:
  - Khi thanh toán thành công:
    + Cập nhật trạng thái transaction thành SUCCESS
    + Thực hiện nạp tiền
    + Nếu nạp tiền thất bại, tự động hoàn tiền (refund)
  - Khi thanh toán thất bại:
    + Cập nhật trạng thái transaction thành FAILED
    + Ghi log thất bại

### Lấy danh sách giao dịch (Yêu cầu đăng nhập)
- **Phương thức:** GET
- **Endpoint:** `/transactions`
- **Query Parameters:**
  - `date` (string, optional): Lọc theo ngày (format: YYYY-MM-DD)
  - `country` (string, optional): Lọc theo mã quốc gia
  - `status` (string, optional): Lọc theo trạng thái (PENDING, SUCCESS, FAILED, REFUNDED)
  - `operator` (string, optional): Lọc theo nhà mạng
  - `page` (number, default: 1): Trang hiện tại
  - `limit` (number, default: 20): Số lượng kết quả mỗi trang
  - `sort` (string, default: 'createdAt'): Trường sắp xếp
  - `order` (string, default: 'desc'): Thứ tự sắp xếp (asc/desc)
- **Response:**
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "phoneNumber": "0986001234",
        "country": "VN",
        "operator": "VIETTEL",
        "amount": 50000,
        "currency": "VND",
        "status": "SUCCESS",
        "type": "TOPUP",
        "paymentMethod": "STRIPE",
        "createdAt": "2024-03-20T10:00:00Z",
        "updatedAt": "2024-03-20T10:00:05Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
  ```
- **Mô tả:** Lấy danh sách giao dịch, hỗ trợ lọc và phân trang.

### Trạng thái giao dịch
- **PENDING**: Đang chờ thanh toán hoặc đang xử lý
- **SUCCESS**: Thanh toán và nạp tiền thành công
- **FAILED**: Thanh toán thất bại
- **REFUNDED**: Đã hoàn tiền do nạp tiền thất bại

### Phương thức thanh toán
- **DIRECT**: Thanh toán trực tiếp
- **STRIPE**: Thanh toán qua Stripe

---

## 5. Thống kê
### Lấy thống kê tổng quan (Yêu cầu đăng nhập)
- **Phương thức:** GET
- **Endpoint:** `/statistics/summary`
- **Query:**
  - `startDate` (string): Ngày bắt đầu (format: YYYY-MM-DD)
  - `endDate` (string): Ngày kết thúc (format: YYYY-MM-DD)
  - `country` (string, tuỳ chọn): Mã quốc gia
  - `operator` (string, tuỳ chọn): Mã nhà mạng
- **Mô tả:** Lấy thống kê tổng quan về số lượng giao dịch, tổng tiền, số tiền hoàn trả và số tiền thực tế.

### Lấy thống kê theo nhà mạng (Yêu cầu đăng nhập)
- **Phương thức:** GET
- **Endpoint:** `/statistics/operators`
- **Query:**
  - `startDate` (string): Ngày bắt đầu (format: YYYY-MM-DD)
  - `endDate` (string): Ngày kết thúc (format: YYYY-MM-DD)
  - `country` (string, tuỳ chọn): Mã quốc gia
- **Mô tả:** Lấy thống kê chi tiết theo từng nhà mạng, bao gồm số lượng giao dịch và tổng tiền.

### Lấy thống kê chi tiết (Yêu cầu đăng nhập)
- **Phương thức:** GET
- **Endpoint:** `/statistics/detailed`
- **Query:**
  - `startDate` (string): Ngày bắt đầu (format: YYYY-MM-DD)
  - `endDate` (string): Ngày kết thúc (format: YYYY-MM-DD)
  - `country` (string, tuỳ chọn): Mã quốc gia
  - `operator` (string, tuỳ chọn): Mã nhà mạng
  - `groupBy` (string, tuỳ chọn): Nhóm theo ngày/tháng/năm (day/month/year, mặc định là day)
- **Mô tả:** Lấy thống kê chi tiết theo thời gian, bao gồm số lượng giao dịch, tổng tiền, số lượng hoàn trả và số tiền hoàn trả.

### Sinh thống kê hàng ngày (Yêu cầu đăng nhập)
- **Phương thức:** POST
- **Endpoint:** `/statistics/generate`
- **Mô tả:** Sinh thống kê giao dịch hàng ngày.

---

## 6. Nhật ký hoạt động
### Lấy nhật ký hoạt động (Yêu cầu đăng nhập)
- **Phương thức:** GET
- **Endpoint:** `/activity-logs`
- **Query:**
  - `