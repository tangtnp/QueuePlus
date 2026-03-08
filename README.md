# QueuePlus

QueuePlus is a **queue management system** designed for clinics, service centers, and retail businesses.  
It allows customers to book queues through a mobile application while staff manage queues through a web dashboard.

The system aims to **improve transparency, reduce waiting time uncertainty, and streamline service operations**.

---

## Features

### Customer Mobile App
- Book queues remotely
- View real-time queue status
- Track position in the waiting line
- Receive updates when queue status changes

### Staff/Admin Dashboard
- Manage services and branches
- Control queue flow
- Update queue status (waiting → serving → done)
- Monitor queue statistics

### Backend System
- REST API built with **Go (Gin framework)**
- **JWT authentication**
- **Role-Based Access Control (RBAC)**
- Real-time queue updates
- MongoDB aggregation for analytics

---

## System Architecture

```
Flutter Mobile App
        |
        | REST API
        v
Go Backend (Gin)
        |
        v
MongoDB Atlas
```

Customers interact with the system through a **Flutter mobile application**, while staff manage queues through a **Flutter web dashboard**.  
The Go backend handles authentication, queue operations, and database communication.

---

## Tech Stack

### Frontend
- Flutter Mobile (Android / iOS)
- Flutter Web Dashboard
- go_router for navigation
- Riverpod / Bloc for state management
- Dio for API requests

### Backend
- Go
- Gin Web Framework
- JWT Authentication
- Middleware for logging and authorization

### Database
- MongoDB Atlas
- Aggregation pipelines for analytics

### Deployment
- Backend: Render
- Database: MongoDB Atlas
- Web dashboard: Firebase Hosting / Vercel
- Mobile app: Android APK / iOS IPA

---

## Queue Workflow

```
Customer books queue
        ↓
Queue status = waiting
        ↓
Staff calls queue
        ↓
Queue status = serving
        ↓
Service completed
        ↓
Queue status = done
```

---

## Project Structure

```
QueuePlus
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── main.go
│
├── mobile_app
│   └── Flutter customer application
│
├── admin_dashboard
│   └── Flutter web dashboard
│
└── README.md
```

---

## Installation

### Clone repository

```bash
git clone https://github.com/tangtnp/QueuePlus.git
cd QueuePlus
```

---

## Backend Setup (Go)

Install dependencies

```bash
go mod tidy
```

Run the server

```bash
go run main.go
```

Server will run at

```
http://localhost:8080
```

---

## Flutter Mobile Setup

```bash
cd mobile_app
flutter pub get
flutter run
```

---

## Environment Variables

Create a `.env` file:

```
PORT=8080
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## Example API Endpoints

Create queue

```
POST /api/queues
```

Get queue list

```
GET /api/queues
```

Update queue status

```
PUT /api/queues/{id}
```

---

## Future Improvements

- LINE notification integration
- Appointment scheduling with time slots
- Multi-branch analytics dashboard
- Cloud auto-scaling deployment
- AI-based queue prediction

---

## License

MIT License