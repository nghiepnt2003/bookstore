# Hệ thống Kinh doanh Sách Trực tuyến với Gợi ý Cá nhân hóa

## Khóa luận tốt nghiệp - Đại học ...

### Tổng quan về đề tài

Đề tài tập trung vào việc xây dựng một hệ thống kinh doanh sách trực tuyến tích hợp công nghệ gợi ý thông minh dựa trên phương pháp Collaborative Filtering. Hệ thống không chỉ đáp ứng các chức năng cơ bản của một nền tảng thương mại điện tử mà còn cung cấp trải nghiệm cá nhân hóa cho người dùng thông qua hệ thống gợi ý sách thông minh.

### Các công nghệ sử dụng

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Recommendation System:** Python, FastAPI
- **Database:** MongoDB
- **Container:** Docker
- **Authentication:** JWT
- **API Documentation:** Swagger
- **Version Control:** Git

### Kiến trúc hệ thống

```
[Client Layer]
    React.js Application
    └── State Management
    └── UI Components
    └── API Integration
           ↓
[API Gateway]
    Load Balancer
    └── Request Routing
    └── Authentication
           ↓
[Service Layer]
    ├── Main Service (Node.js)
    │   └── User Management
    │   └── Book Management
    │   └── Order Processing
    │   └── Payment Integration
    │
    └── Recommendation Service (Python)
        └── Collaborative Filtering
        └── Real-time Processing
        └── Cache Management
           ↓
[Data Layer]
    ├── Main Database
    └── Cache Layer
```

### Cấu trúc thư mục dự án

```
bookstore/
├── client/                         # Frontend application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── common/           # Shared components
│   │   │   ├── layout/           # Layout components
│   │   │   └── features/         # Feature-specific components
│   │   ├── pages/                # Page components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API services
│   │   ├── utils/                # Utility functions
│   │   ├── contexts/             # React contexts
│   │   └── assets/               # Static assets
│   ├── public/                    # Public assets
│   └── config/                    # Frontend configuration
│
├── server/                        # Backend server
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   ├── models/               # Database models
│   │   ├── routes/               # API routes
│   │   ├── middlewares/          # Custom middlewares
│   │   ├── services/             # Business logic
│   │   ├── utils/                # Utility functions
│   │   └── config/               # Server configuration
│   ├── Dockerfile                # Server container config
│   └── nodemon.json              # Development config
│
├── collaborative_filtering/        # Recommendation service
│   ├── src/
│   │   ├── collab_filtering/     # CF algorithm implementation
│   │   │   ├── cf.py            # Core CF class
│   │   │   └── utils.py         # Algorithm utilities
│   │   ├── schedules/           # Background tasks
│   │   │   ├── background.py    # Task scheduler
│   │   │   └── helper/          # Helper functions
│   │   └── config/              # Service configuration
│   ├── requirements.txt          # Python dependencies
│   └── main.py                   # Service entry point
│
└── key/                          # SSL/TLS certificates
    ├── private.pem
    └── publickey.crt
```

### Tính năng chính của hệ thống

#### 1. Quản lý người dùng

- Đăng ký, đăng nhập, quản lý thông tin cá nhân
- Phân quyền người dùng (Admin, User)
- Quản lý giỏ hàng và đơn hàng

#### 2. Quản lý sách

- CRUD operations cho sách
- Phân loại và tìm kiếm sách
- Quản lý kho hàng
- Đánh giá và bình luận

#### 3. Hệ thống gợi ý (Recommendation System)

- Item-based Collaborative Filtering
- Real-time recommendation updates
- Xử lý background tự động
- Cache kết quả để tối ưu hiệu suất

### 2. Backend (server/)

- Node.js REST API
- User authentication & authorization
- Book management
- Order processing
- Integration with recommendation service

#### Setup

```bash
cd server
npm install
npm run dev
```

### 3. Collaborative Filtering Service (collaborative_filtering/)

A Python-based recommendation service using collaborative filtering algorithm.

#### Features

- Item-based collaborative filtering
- Real-time recommendation updates
- RESTful API integration
- Background processing
- Efficient caching system

#### Requirements

- Python 3.8+
- FastAPI
- NumPy
- scikit-learn
- SciPy

#### Setup

```bash
cd collaborative_filtering
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
python main.py
```

## Technical Architecture

### Frontend Architecture

- React components
- State management
- REST API integration
- Responsive UI
- User session management

### Backend Architecture

- MVC pattern
- RESTful API endpoints
- Authentication middleware
- Database integration
- Service integration

### Collaborative Filtering Architecture

1. **Algorithm Layer** (Model)

   - Collaborative filtering implementation
   - Rating normalization
   - Similarity calculations
   - Recommendation generation

2. **Service Layer**

   - Business logic
   - Data processing
   - Background tasks
   - Caching

3. **API Layer** (Controller)
   - RESTful endpoints
   - Request handling
   - Response formatting

## API Documentation

### Main Server Endpoints

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book details
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user/profile` - Get user profile
- `POST /api/orders` - Create new order

### Recommendation Service Endpoints

- `GET /{user_id}` - Get recommendations for user
- `GET /` - Swagger documentation

## Data Flow

1. **User Authentication**

```
Client -> Server -> Database
   ↑       ↓
   └─── JWT Token
```

2. **Recommendation Flow**

```
CF Service -> Server API (get products & ratings)
     ↓
[Process recommendations]
     ↓
Client <- Server API <- CF Service (get recommendations)
```

## Development

### Prerequisites

- Node.js 14+
- Python 3.8+
- npm or yarn
- Docker (optional)

### Environment Setup

1. Clone the repository

```bash
git clone <repository-url>
cd bookstore
```

2. Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install

# Recommendation Service
cd ../collaborative_filtering
pip install -r requirements.txt
```

3. Start development servers

```bash
# Frontend
cd client
npm start

# Backend
cd server
npm run dev

# Recommendation Service
cd collaborative_filtering
python main.py
```

## Deployment

### Using Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

## Security

- JWT authentication
- HTTPS/SSL
- Input validation
- CORS configuration
- Rate limiting

## Performance Optimization

- Efficient CF algorithm implementation
- Response caching
- Background processing
- Optimized database queries
- CDN for static assets

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
