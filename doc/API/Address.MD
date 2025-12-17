# Address API Documentation

## Base URL
```
https://yourdomain.com/api/v1
```

## Authentication
- Authenticated users must use `Bearer Token` authentication.
- Guest users can create addresses without authentication.

## Endpoints

### 1. Get User Addresses
**URL:** `/address`

**Request Header:** Accept : application/json , Content-Type : application/json

**Method:** `GET`

**Auth Required:** Yes (Bearer Token)

**Response:**
```json
{
  "status": "success",
  "message": "Addresses retrieved successfully",
  "data": {
    "addresses": [
      {
        "id": 1,
        "region_id": 10,
        "prefecture_id": 20,
        "city": "Tokyo",
        "postal_code": "123-4567",
        "address_line_1": "Street 123",
        "address_line_2": "Apt 456",
        "country": "Japan",
        "region": { "id": 10, "name": "Kanto" },
        "prefecture": { "id": 20, "name": "Tokyo" }
      }
    ],
    "user": {
      "id": 5,
      "name": "John Doe",
      "email": "johndoe@example.com",
      "mobile": "1234567890",
      "user_type": "registered"
    }
  }
}
```

---

### 2. Store or Update Address
**URL:** `/address`

**Method:** `POST`

**Auth Required:** No (for guest users) / Yes (for authenticated users)

**Request Body:**
```json
{
  "region_id": 10,
  "prefecture_id": 20,
  "city": "Tokyo",
  "postal_code": "123-4567",
  "address_line_1": "Street 123",
  "address_line_2": "Apt 456",
  "address_id": 1, // Optional (for updating existing address)
  "name": "John Doe", // Required for guest users
  "email": "johndoe@example.com", // Required for guest users
  "mobile": "1234567890" // Required for guest users
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Address saved successfully",
  "data": {
    "address": {
      "id": 1,
      "region_id": 10,
      "prefecture_id": 20,
      "city": "Tokyo",
      "postal_code": "123-4567",
      "address_line_1": "Street 123",
      "address_line_2": "Apt 456",
      "country": "Japan"
    },
    "user": {
      "id": 5,
      "name": "John Doe",
      "email": "johndoe@example.com",
      "mobile": "1234567890",
      "user_type": "registered"
    },
    "token": "generated_guest_token_if_applicable"
  }
}
```

---

### 3. Delete Address
**URL:** `/address/{addressId}`

**Method:** `DELETE`

**Auth Required:** Yes (Bearer Token)

**Response:**
```json
{
  "status": "success",
  "message": "Address deleted successfully"
}
```

---

### 4. Set Default Address
**URL:** `/address/{addressId}/default`

**Method:** `PUT`

**Auth Required:** Yes (Bearer Token)

**Response:**
```json
{
  "status": "success",
  "message": "Default address set successfully"
}
```

