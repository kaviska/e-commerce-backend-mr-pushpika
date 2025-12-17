# Category API Documentation

This document provides a detailed overview of the Category API endpoints, including request parameters, responses, and expected behaviors.

## Base URL
```
http://yourdomain.com/api
```

## Response Structure
All responses follow this structure:
```json
{
  "status": "success | error",
  "message": "Response message",
  "data": { /* Returned data */ },
  "errors": { /* Error details if any */ }
}
```

## Endpoints

### 1. Get Categories
**Endpoint:**
```
GET /categories
```
**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | No | Fetch category by ID |
| slug | string | No | Fetch category by slug |
| name | string | No | Fetch category by name |
| query | string | No | Search categories by name |
| limit | integer | No | Number of results per page (default: 10) |
| page | integer | No | Pagination page number (default: 1) |

**Response:**
- **200 OK**: Returns category data or list.
```json
{
  "status": "success",
  "message": "Category fetched successfully",
  "data": [{ "id": 1, "name": "Example" }]
}
```

__data could be an object or an array based on request__

### 2. Create a Category
**Endpoint:**
```
POST /categories
```
**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Category name |
| slug | string | No | Category slug (auto-generated if not provided) |
| image | file (jpeg, png, jpg) | Yes | Category image (max: 2MB) |

**Response:**
- **201 Created**: Category successfully created.
```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": { "id": 1, "name": "Example" }
}
```

### 3. Update a Category
**Endpoint:**
```
POST /categories/update
```
**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Category ID |
| name | string | No | New category name |
| slug | string | No | New category slug |
| image | file (jpeg, png, jpg) | No | New category image |

**Response:**
- **200 OK**: Category successfully updated.
```json
{
  "status": "success",
  "message": "Category updated successfully",
  "data": { "id": 1, "name": "Updated Name" }
}
```

### 4. Delete a Category
**Endpoint:**
```
DELETE /categories
```
**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Category ID |

**Response:**
- **200 OK**: Category successfully deleted.
```json
{
  "status": "success",
  "message": "Category deleted successfully",
  "data": { "id": 1 }
}
```

## Error Handling
- **400 Bad Request:** Validation or missing parameters.
- **404 Not Found:** Requested category not found.
- **500 Internal Server Error:** Unexpected issues during processing.

**Example Error Response:**
```json
{
  "status": "error",
  "message": "Failed to create category",
  "errors": { "name": "The name field is required." }
}
```

