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
### Lấy thống kê (Yêu cầu đăng nhập)
- **Phương thức:** GET
- **Endpoint:** `/statistics`
- **Query:**
  - `date`, `country`
- **Mô tả:** Lấy thống kê giao dịch.

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