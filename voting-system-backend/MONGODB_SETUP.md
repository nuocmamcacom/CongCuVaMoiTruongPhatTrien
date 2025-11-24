# MongoDB Setup Guide

## Cài đặt MongoDB

### Option 1: MongoDB Local (Windows)

1. **Download MongoDB Community Server:**
   - Truy cập: https://www.mongodb.com/try/download/community
   - Chọn phiên bản Windows
   - Download và cài đặt

2. **Cài đặt MongoDB:**
   - Chạy file installer
   - Chọn "Complete" installation
   - Chọn "Install MongoDB as a Service"
   - Để mặc định port 27017

3. **Kiểm tra MongoDB đã chạy:**
   ```powershell
   # Kiểm tra service
   Get-Service MongoDB
   
   # Hoặc kết nối bằng mongo shell
   mongosh
   ```

4. **Cập nhật .env file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/voting-system
   ```

### Option 2: MongoDB Atlas (Cloud - Miễn phí)

1. **Tạo tài khoản MongoDB Atlas:**
   - Truy cập: https://www.mongodb.com/cloud/atlas/register
   - Đăng ký tài khoản miễn phí

2. **Tạo Cluster:**
   - Chọn "Build a Database"
   - Chọn FREE tier (M0)
   - Chọn region gần nhất (Singapore hoặc Mumbai)
   - Đặt tên cluster

3. **Thiết lập Database Access:**
   - Vào "Database Access"
   - Click "Add New Database User"
   - Tạo username và password
   - Chọn "Read and write to any database"

4. **Thiết lập Network Access:**
   - Vào "Network Access"
   - Click "Add IP Address"
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0)
   - Hoặc thêm IP cụ thể của bạn

5. **Lấy Connection String:**
   - Vào "Database"
   - Click "Connect"
   - Chọn "Connect your application"
   - Copy connection string
   - Thay thế `<password>` bằng mật khẩu của bạn

6. **Cập nhật .env file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/voting-system?retryWrites=true&w=majority
   ```

## Khởi động Backend

```bash
# Cài đặt dependencies
cd voting-system-backend
npm install

# Khởi động development server
npm run dev

# Hoặc production
npm start
```

## Kiểm tra kết nối

Khi backend khởi động thành công, bạn sẽ thấy:
```
Server running on port 5000
MongoDB Connected: localhost (hoặc Atlas cluster URL)
```

## Các Collection trong Database

Backend sẽ tự động tạo các collection sau:

1. **users** - Lưu thông tin người dùng
2. **polls** - Lưu thông tin các cuộc bình chọn
3. **votes** - Lưu các lượt vote

## Xem dữ liệu MongoDB

### Sử dụng MongoDB Compass (GUI Tool)

1. Download: https://www.mongodb.com/try/download/compass
2. Cài đặt và mở MongoDB Compass
3. Kết nối với connection string:
   - Local: `mongodb://localhost:27017`
   - Atlas: Connection string từ Atlas

### Sử dụng mongosh (Command Line)

```bash
# Kết nối local
mongosh

# Hoặc kết nối Atlas
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/voting-system" --username your_username

# Xem databases
show dbs

# Sử dụng database
use voting-system

# Xem collections
show collections

# Xem documents
db.users.find()
db.polls.find()
db.votes.find()
```

## Troubleshooting

### Lỗi: "MongoServerError: Authentication failed"
- Kiểm tra lại username/password trong connection string
- Đảm bảo đã tạo database user trong Atlas

### Lỗi: "MongooseServerSelectionError: connect ECONNREFUSED"
- Kiểm tra MongoDB service đang chạy (local)
- Kiểm tra Network Access trong Atlas (cloud)
- Kiểm tra firewall/antivirus không block port 27017

### Lỗi: "IP not whitelisted"
- Vào Network Access trong Atlas
- Thêm IP address của bạn hoặc cho phép tất cả (0.0.0.0/0)

## So sánh với MSSQL

| Tính năng | MSSQL | MongoDB |
|-----------|-------|---------|
| Kiểu database | SQL (Relational) | NoSQL (Document) |
| Schema | Fixed schema | Flexible schema |
| Queries | SQL queries | MongoDB queries |
| Transactions | Full ACID | ACID (with sessions) |
| Setup | Phức tạp | Đơn giản |
| Cloud option | Azure SQL | MongoDB Atlas |
| Free tier | Limited | Generous (512MB) |

## Ưu điểm MongoDB cho project này:

✅ **Setup đơn giản** - Không cần cài SQL Server
✅ **Free tier tốt** - MongoDB Atlas free 512MB
✅ **Flexible schema** - Dễ thay đổi cấu trúc dữ liệu
✅ **JSON native** - Phù hợp với Node.js/Express
✅ **Mongoose ODM** - ORM đơn giản, dễ sử dụng
✅ **Cloud ready** - Dễ deploy lên production

## Lưu ý

- Nếu sử dụng MongoDB local, nhớ backup dữ liệu thường xuyên
- Với MongoDB Atlas, data được backup tự động
- Connection string chứa password, không commit lên git
- Sử dụng `.env` file để quản lý sensitive data
