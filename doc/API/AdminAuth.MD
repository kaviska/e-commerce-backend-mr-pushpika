# Admin API Documentation

## Endpoints

### 1. **POST /admin/login**
Handles admin login.

#### Request Body:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Success Response:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "message": "Login successful"
}
```

#### Error Response:
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

---

### 2. **GET /admin/is-logged**
Checks if an admin user is logged in.

#### Success Response:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "message": "User is logged in"
}
```

#### Error Response:
```json
{
  "status": "error",
  "message": "User is not logged in"
}
```

---

### 3. **GET /admin/logout**
Logs out the admin user.

#### Success Response:
```json
{
  "status": "success",
  "data": null,
  "message": "Logout successful"
}
```

---

### 4. **POST /admin/register**
Registers a new admin user.

#### Request Body:
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "password123",
  "mobile": "1234567890"
}
```

#### Validation Rules:
- `name`: Required, string.
- `email`: Required, valid email, unique.
- `password`: Required, string, min: 6 characters.
- `mobile`: Required, string.

#### Success Response:
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "name": "New Admin",
    "email": "newadmin@example.com",
    "mobile": "1234567890"
  },
  "message": "Admin user created successfully"
}
```

#### Error Response:
```json
{
  "status": "error",
  "message": "Validation error"
}
```

---

## Routes

- **POST /admin/login**: Handles admin login.
- **GET /admin/is-logged**: Checks if an admin user is logged in.
- **GET /admin/logout**: Logs out the admin user.
- **POST /admin/register**: Registers a new admin user.

---

## Authentication

- These routes are protected under the `auth` middleware.
- Authentication is managed via Laravel's session-based authentication.
- Only authenticated users can access `/admin/is-logged` and `/admin/logout`.

---

## Response Format

All responses follow the format:

```json
{
  "status": "success/error",
  "data": <data>,
  "message": "message text"
}
```

