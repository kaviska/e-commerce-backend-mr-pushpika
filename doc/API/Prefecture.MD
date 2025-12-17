# Prefecture API Documentation

## Endpoints

### 1. **GET /prefectures**  
Fetches a list of all prefectures or filters them by `region_id`.

#### Query Parameters:
| Parameter    | Type     | Required | Description                        |
|-------------|---------|----------|------------------------------------|
| `region_id` | Integer | No       | Filters prefectures by region ID  |

#### Success Response (Fetching All Prefectures):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "prefecture_name": "Tokyo",
      "shipping_fee": 500
    },
    {
      "id": 2,
      "prefecture_name": "Osaka",
      "shipping_fee": 450
    }
  ],
  "message": "Prefectures retrieved successfully"
}
```

#### Success Response (Filtering by `region_id`):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "prefecture_name": "Kyoto",
      "shipping_fee": 400
    }
  ],
  "message": "Prefectures retrieved successfully"
}
```

#### Error Response (Validation Error):
```json
{
  "status": "error",
  "message": {
    "region_id": ["The region_id field is required."]
  }
}
```

#### Error Response (Server Error):
```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

---

## Routes

- **GET /prefectures** - Retrieve all prefectures or filter by `region_id`.

---

## Notes

- If `region_id` is provided, the API returns only the prefectures belonging to that region.
- The API validates `region_id` to ensure it is an integer.
- Errors are logged for debugging.
