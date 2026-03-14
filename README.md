# 🚗 ParkSmart – Smart Campus Parking System

ParkSmart is a **full-stack smart parking management system** designed for university campuses.
It helps manage parking spaces efficiently, reduce congestion, and provide **real-time parking availability** to users.

The system allows students, faculty, and staff to register vehicles, view available parking zones, and track parking activity, while administrators can monitor and control parking operations.

---

## 🌐 Live Demo

Link: https://park-smart-gilt.vercel.app

---

## 📌 Features

### 👤 User Features

* User registration and login (JWT authentication)
* Register personal vehicles
* View real-time parking availability
* Dashboard for parking activity
* Parking history tracking

### 🛠 Admin / Guard Features

* Admin dashboard for parking management
* Vehicle search system
* QR / scanner-based gate entry system
* Zone management for parking areas
* View parking history
* Real-time occupancy monitoring

### ⚡ Real-Time Updates

* Live parking occupancy updates using **Socket.io**
* Activity feed for parking events

---

## 🧠 System Architecture

Frontend → React.js
Backend → Node.js + Express.js
Database → MongoDB
Real-time communication → Socket.io

```
User Browser
     ↓
React Frontend (Vercel)
     ↓
Express API Server (Render)
     ↓
MongoDB Database
```

---

## 🛠 Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Tailwind CSS
* React Hot Toast
* Socket.io Client

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* bcryptjs (password hashing)
* Socket.io

### Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

## 📂 Project Structure

```
ParkSmart
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── utils
│   │   └── App.js
│
├── server
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   └── authController.js
│   ├── models
│   │   └── User.js
│   ├── routes
│   │   └── authRoutes.js
│   ├── middleware
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/adityavani07/ParkSmart.git
cd ParkSmart
```

---

### 2️⃣ Install Dependencies

Backend

```bash
cd server
npm install
```

Frontend

```bash
cd client
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file inside **server/**

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Run the Application

Start backend:

```bash
cd server
npm run server
```

Start frontend:

```bash
cd client
npm start
```

---

## 🔐 Authentication

ParkSmart uses **JWT-based authentication**.

Process:

1. User logs in
2. Server generates JWT token
3. Token stored in browser localStorage
4. Token used for protected API routes

---

## 📊 Real-Time Features

Using **Socket.io**, the system provides:

* Live parking occupancy updates
* Instant admin activity notifications
* Real-time zone updates

---

## 🧪 Demo Credentials

Admin

```
admin@campus.edu
admin123
```

Guard

```
guard@campus.edu
guard123
```

User

```
rahul@student.edu
password123
```

---

## 🚀 Future Improvements

* AI-based parking prediction
* Mobile app integration
* License plate recognition
* Smart IoT parking sensors
* Google Maps integration for parking zones

---

## 👨‍💻 Author

Aditya Vani

GitHub:
https://github.com/adityavani07

---

## 📜 License

This project is licensed under the MIT License.
