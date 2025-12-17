# API Authentication Documentation

## Base URL
```
https://your-api-url.com/api
```

## Header
- `Accept: application/json`
- `Content-Type: application/json`
- `Authorization: Bearer {{token}}`

## Authentication
All API requests require JSON-formatted data and return JSON responses. Some routes require authentication using a Bearer Token.

---

## **1. Register a New User**
### **Endpoint:**
```
POST /register
```
### **Request Body:**
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "mobile": "1234567890",
  "password": "password123",
  "password_confirmation": "password123",
  "device_name": "iPhone"
}
```
### **Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "mobile": "1234567890"
  },
  "token": "your-api-token"
}
```
### **Error Response (If Email Already Exists):**
```json
{
  "error": "Email is already registered"
}
```

---

## **2. Login**
### **Endpoint:**
```
POST /login
```
### **Request Body:**
```json
{
  "email": "johndoe@example.com",
  "password": "password123",
  "device_name": "iPhone"
}
```
### **Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com"
  },
  "token": "your-api-token"
}
```
### **Error Response (Invalid Credentials):**
```json
{
  "error": "Invalid credentials"
}
```

---

## **3. Logout**
### **Endpoint:**
```
POST /logout
```
### **Headers:**
```
Authorization: Bearer {token}
```
### **Response:**
```json
{
  "message": "User logged out successfully"
}
```

---

## **4. Verify OTP**
### **Endpoint:**
```
POST /verify-otp
```
### **Request Body:**
```json
{
  "otp": 123456
}
```
### **Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com"
  },
  "message": "OTP verified successfully"
}
```
### **Error Response:**
```json
{
  "error": "Invalid OTP"
}
```

---

## **5. Resend OTP**
### **Endpoint:**
```
POST /resend-otp
```
### **Headers:**
```
Authorization: Bearer {token}
```
### **Response:**
```json
{
  "message": "OTP sent successfully"
}
```
### **Error Response:**
```json
{
  "error": "Invalid token"
}
```

---

## **6. Check if User is Logged In**
### **Endpoint:**
```
GET /is-login
```
### **Headers:**
```
Authorization: Bearer {token}
```
### **Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com"
  },
  "message": "User is logged in"
}
```
### **Error Response:**
```json
{
  "error": "User not found"
}
```

---

## **7. Create Guest User**
### **Endpoint:**
```
POST /guest-user
```
### **Request Body:**
```json
{
  "name": "Guest User",
  "email": "guest@example.com",
  "mobile": "9876543210"
}
```
### **Response:**
```json
{
  "user": {
    "id": 2,
    "name": "Guest User",
    "email": "guest@example.com"
  },
  "message": "Guest user created successfully"
}
```
### **Error Response:**
```json
{
  "error": "Email already exists"
}
```

---

## **8. Forgot Password**
### **Endpoint:**
```
POST /forgot-password
```
### **Request Body:**
```json
{
  "email": "johndoe@example.com",
  "device_name": "iPhone"
}
```
### **Response:**
```json
{
  "message": "Password reset link sent to email"
}
```
### **Error Response:**
```json
{
  "error": "User not found"
}
```

---

## Notes
- **All responses include HTTP status codes** for success or error handling.
- **All endpoints requiring authentication must include a Bearer token** in the request headers.
- **Passwords should be encrypted** before storing in the database.
- **OTP verification is required for new users before completing registration.**

---