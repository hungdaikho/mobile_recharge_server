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
### Tạo giao dịch nạp tiền
- **Phương thức:** POST
- **Endpoint:** `/transactions`
- **Body:**
  - Theo định nghĩa CreateTransactionDto (số điện thoại, nhà mạng, mệnh giá, ...)
- **Mô tả:** Tạo giao dịch nạp tiền.

### Lấy danh sách giao dịch (Yêu cầu đăng nhập)
- **Phương thức:** GET
- **Endpoint:** `/transactions`
- **Query:**
  - `date`, `country`, `status`, `operator`, `page`, `limit`, `sort`, `order`
- **Mô tả:** Lấy danh sách giao dịch, hỗ trợ lọc và phân trang.

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
  - `phoneNumber`, `date`, `page`, `limit`
- **Mô tả:** Lấy danh sách nhật ký hoạt động, hỗ trợ lọc và phân trang.

---

## 7. Nhà mạng (Operator)
### Lấy danh sách nhà mạng
- **Phương thức:** GET
- **Endpoint:** `/operators`
- **Mô tả:** Lấy danh sách tất cả nhà mạng, bao gồm thông tin quốc gia và các loại sim.

### Tạo nhà mạng (Yêu cầu đăng nhập)
- **Phương thức:** POST
- **Endpoint:** `/operators`
- **Body:**
  - `name` (string): Tên nhà mạng
  - `logoUrl` (string): Link logo
  - `apiCode` (string): Mã code tích hợp API
  - `countryCode` (string): Mã quốc gia
  - `description` (string, optional): Mô tả nhà mạng (có thể là text hoặc HTML)
- **Mô tả:** Tạo mới một nhà mạng.

### Cập nhật nhà mạng (Yêu cầu đăng nhập)
- **Phương thức:** PUT
- **Endpoint:** `/operators/:id`
- **Body:**
  - Các trường cần cập nhật (name, logoUrl, apiCode, countryCode, description, ...)
- **Mô tả:** Cập nhật thông tin nhà mạng.

### Xóa nhà mạng (Yêu cầu đăng nhập)
- **Phương thức:** DELETE
- **Endpoint:** `/operators/:id`
- **Mô tả:** Xóa một nhà mạng.

---

## 8. Quốc gia (Country)
### Lấy danh sách quốc gia
- **Phương thức:** GET
- **Endpoint:** `/countries`
- **Mô tả:** Lấy danh sách tất cả quốc gia, bao gồm thông tin nhà mạng.

### Tạo quốc gia (Yêu cầu đăng nhập)
- **Phương thức:** POST
- **Endpoint:** `/countries`
- **Body:**
  - `code` (string): Mã quốc gia
  - `name` (string): Tên quốc gia
  - `currency` (string): Đơn vị tiền tệ
  - `flagUrl` (string): Link cờ quốc gia
- **Mô tả:** Tạo mới một quốc gia.

### Cập nhật quốc gia (Yêu cầu đăng nhập)
- **Phương thức:** PUT
- **Endpoint:** `/countries/:code`
- **Body:**
  - Các trường cần cập nhật (name, currency, flagUrl, ...)
- **Mô tả:** Cập nhật thông tin quốc gia.

### Xóa quốc gia (Yêu cầu đăng nhập)
- **Phương thức:** DELETE
- **Endpoint:** `/countries/:code`
- **Mô tả:** Xóa một quốc gia.

## 9. API Credentials
### Tạo API Credential (Yêu cầu đăng nhập và quyền admin)
- **Phương thức:** POST
- **Endpoint:** `/api-credentials`
- **Body:**
  - `name` (string): Tên của credential (ví dụ: "Reloadly", "Stripe")
  - `type` (string): Loại credential (ví dụ: "PAYMENT", "TOPUP")
  - `apiKey` (string): API key
  - `apiSecret` (string): API secret
  - `baseUrl` (string, optional): Base URL của API
  - `metadata` (object, optional): Thông tin bổ sung
- **Mô tả:** Tạo mới một API credential.

### Lấy danh sách API Credentials (Yêu cầu đăng nhập và quyền admin)
- **Phương thức:** GET
- **Endpoint:** `/api-credentials`
- **Mô tả:** Lấy danh sách tất cả API credentials.

### Lấy chi tiết API Credential (Yêu cầu đăng nhập và quyền admin)
- **Phương thức:** GET
- **Endpoint:** `/api-credentials/:id`
- **Mô tả:** Lấy thông tin chi tiết của một API credential.

### Cập nhật API Credential (Yêu cầu đăng nhập và quyền admin)
- **Phương thức:** PATCH
- **Endpoint:** `/api-credentials/:id`
- **Body:**
  - `name` (string, optional): Tên của credential
  - `type` (string, optional): Loại credential
  - `apiKey` (string, optional): API key
  - `apiSecret` (string, optional): API secret
  - `baseUrl` (string, optional): Base URL của API
  - `isActive` (boolean, optional): Trạng thái hoạt động
  - `metadata` (object, optional): Thông tin bổ sung
- **Mô tả:** Cập nhật thông tin của một API credential.

### Xóa API Credential (Yêu cầu đăng nhập và quyền admin)
- **Phương thức:** DELETE
- **Endpoint:** `/api-credentials/:id`
- **Mô tả:** Xóa một API credential. 