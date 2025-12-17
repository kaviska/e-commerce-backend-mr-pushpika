
# Region API Documentation

## Endpoints

### 1. **GET /regions**  
Fetches a list of all regions.

#### Success Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Region Name"
    }
  ],
  "message": "Successfully fetched regions"
}
```

#### Error Response:
```json
{
  "status": "error",
  "message": "Failed to fetch regions"
}
```

---

## Routes

- **GET /regions**: Fetch all regions.

---

## Response Format

All responses follow the structure:

```json
{
  "status": "success/error",
  "data": <data>,
  "message": <message>
}
```