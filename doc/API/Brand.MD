# Brand API Documentation

## Base URL

`/api/brands`

## Endpoints

### 1. List Brands

**Endpoint:** `GET /brands`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|--------|----------|-------------|
| `id` | string | No | Filter by brand ID |
| `name` | string | No | Filter by brand name |

**Response:**

```json
{
    "status": "success",
    "message": "Brands fetched successfully",
    "data": [
        {
            "id": "1",
            "name": "Brand Name"
        }
    ]
}
```

### 2. Create a Brand

**Endpoint:** `POST /brands`

**Headers:**
`Content-Type: application/x-www-form-urlencoded`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|--------|----------|-------------|
| `name` | string | Yes | Unique brand name |

**Response:**

```json
{
    "status": "success",
    "message": "Brand created successfully",
    "data": {
        "id": "1",
        "name": "Brand Name"
    }
}
```

### 3. Update a Brand

**Endpoint:** `PUT /brands`

**Headers:**
`Content-Type: application/x-www-form-urlencoded`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|--------|----------|-------------|
| `id` | string | Yes | Brand ID to update |
| `name` | string | Yes | New unique brand name |

**Response:**

```json
{
    "status": "success",
    "message": "Brand updated successfully",
    "data": {
        "id": "1",
        "name": "Updated Brand Name"
    }
}
```

### 4. Delete a Brand

**Endpoint:** `DELETE /brands`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|--------|----------|-------------|
| `id` | string | Yes | Brand ID to delete |

**Response:**

```json
{
    "status": "success",
    "message": "Brand deleted successfully",
    "data": {
        "id": "1",
        "name": "Deleted Brand Name"
    }
}
```

## Error Handling

**Standard Error Response:**

```json
{
    "status": "error",
    "message": "Error message",
    "errors": {
        "field": ["Validation message"]
    }
}
```
