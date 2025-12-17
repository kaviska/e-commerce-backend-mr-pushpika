# Postal Code API Documentation

## Endpoints

### **1. GET /postal-data**
Fetches postal codes with optional filtering and pagination.

#### **Query Parameters:**
| Parameter         | Type    | Required | Description                                   |
|------------------|--------|----------|-----------------------------------------------|
| `postal_code`    | String | No       | Filters by postal code (partial match).      |
| `prefecture_name`| String | No       | Filters by prefecture name (case-insensitive). |
| `city`          | String | No       | Filters by city name (case-insensitive).     |
| `page`          | Integer | No       | Specifies the page number (default: 1).      |
| `limit`         | Integer | No       | Number of records per page (1-100, default: 50). |

#### **Success Response (Paginated Data)**
```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "postal_code": "100-0001",
        "prefecture_name_en": "Tokyo",
        "city_name_en": "Chiyoda"
      },
      {
        "id": 2,
        "postal_code": "100-0002",
        "prefecture_name_en": "Tokyo",
        "city_name_en": "Chiyoda"
      }
    ],
    "total": 2,
    "per_page": 50
  },
  "message": "Postal data retrieved successfully"
}
```

#### **Error Response (Validation Error)**
```json
{
  "status": "error",
  "message": {
    "limit": ["The limit must be between 1 and 100."]
  }
}
```

#### **Error Response (Server Error)**
```json
{
  "status": "error",
  "message": "An unexpected error occurred. Please try again."
}
```

---

## **Seeding Postal Code Data**
Before using the API, you must seed the postal data into the database:

```bash
php artisan db:seed --class=PostalCodeSeeder
```

---

## **Routes**
- **GET /postal-data** - Retrieve postal codes with optional filters and pagination.

---

## **Performance Optimization**
- **Caching:** Query results are cached for **1 hour (3600 seconds)** to enhance performance.
- **Case-insensitive search:** Prefecture and city names are searched case-insensitively for better accuracy.
- **Pagination:** Limits the number of records per page to prevent overloading the system.

