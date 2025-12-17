# Product API Documentation

## Endpoints

### 1. **GET /products**
Fetches a list of products with optional filters.

#### Query Parameters:
- `id` (integer) - Fetch product by ID.
- `search` (string) - Search products by name or description.
- `name` (string) - Fetch products by name.
- `slug` (string) - Fetch products by slug.
- `category_id` (integer) - Fetch products by category ID.
- `brand_id` (integer) - Fetch products by brand ID.
- `taxonomy` (string) - Fetch products by taxonomy name.

#### Success Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "slug": "product-name",
      "description": "Product description",
      "primary_image": "storage/images/products/product-name.jpg",
      "category": { "id": 1, "name": "Category" },
      "brand": { "id": 1, "name": "Brand" },
      "taxonomies": [ { "id": 1, "name": "Taxonomy" } ]
    }
  ],
  "message": "Successfully fetched products"
}
```

#### Error Response:
```json
{
  "status": "error",
  "message": "Invalid search query or no products found"
}
```

### 2. **POST /products**
Creates a new product.

#### Request Body:
```json
{
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "category_id": 1,
  "brand_id": 1,
  "primary_image": "image_file"
}
```

#### Validation:
- `name`: Required, unique, max: 255 characters.
- `slug`: Optional, unique, max: 255 characters.
- `description`: Required, max: 512 characters.
- `category_id`: Required, integer, exists in `categories` table.
- `brand_id`: Required, integer, exists in `brands` table.
- `primary_image`: Required, image (jpeg, png, jpg, gif, svg), max size: 2MB.

#### Success Response:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Product Name",
    "slug": "product-name",
    "description": "Product description",
    "primary_image": "storage/images/products/product-name.jpg",
    "category_id": 1,
    "brand_id": 1
  },
  "message": "Product created successfully"
}
```

#### Error Response:
```json
{
  "status": "error",
  "message": "Validation error or image upload failed"
}
```

### 3. **POST /products/update**
Updates an existing product.

#### Request Body:
```json
{
  "id": 1,
  "name": "Updated Product Name",
  "slug": "updated-product-name",
  "description": "Updated description",
  "category_id": 1,
  "brand_id": 1,
  "primary_image": "new_image_file"
}
```

#### Validation:
- `id`: Required, integer, exists in `products` table.
- `name`: Optional, unique, max: 255 characters.
- `slug`: Optional, unique, max: 255 characters.
- `description`: Optional, max: 512 characters.
- `category_id`: Optional, exists in `categories` table.
- `brand_id`: Optional, exists in `brands` table.
- `primary_image`: Optional, image (jpeg, png, jpg, gif, svg), max size: 2MB.

#### Success Response:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Updated Product Name",
    "slug": "updated-product-name",
    "description": "Updated description",
    "primary_image": "storage/images/products/updated-product-name.jpg",
    "category_id": 1,
    "brand_id": 1
  },
  "message": "Product updated successfully"
}
```

#### Error Response:
```json
{
  "status": "error",
  "message": "Product not found or validation error"
}
```

### 4. **DELETE /products**
Deletes a product by its ID.

#### Request Body:
```json
{
  "id": 1
}
```

#### Success Response:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Product Name",
    "slug": "product-name",
    "description": "Product description",
    "primary_image": "storage/images/products/product-name.jpg",
    "category_id": 1,
    "brand_id": 1
  },
  "message": "Product deleted successfully"
}
```

#### Error Response:
```json
{
  "status": "error",
  "message": "Product not found"
}
```

---

## Routes

- **GET /products**: Fetch products with optional filters.
- **POST /products**: Create a new product.
- **POST /products/update**: Update an existing product.
- **DELETE /products**: Delete a product by its ID.

---

## Validation Rules

- **Create Product**:
  - `name`: Required, unique, max: 255 characters.
  - `slug`: Optional, unique, max: 255 characters.
  - `description`: Required, max: 512 characters.
  - `category_id`: Required, integer, exists in `categories` table.
  - `brand_id`: Required, integer, exists in `brands` table.
  - `primary_image`: Required, image (jpeg, png, jpg, gif, svg), max size: 2MB.

- **Update Product**:
  - `id`: Required, integer, exists in `products` table.
  - `name`: Optional, unique, max: 255 characters.
  - `slug`: Optional, unique, max: 255 characters.
  - `description`: Optional, max: 512 characters.
  - `category_id`: Optional, exists in `categories` table.
  - `brand_id`: Optional, exists in `brands` table.
  - `primary_image`: Optional, image (jpeg, png, jpg, gif, svg), max size: 2MB.

---

## File Upload Details

- **Primary Image**: 
  - Allowed formats: `.jpeg`, `.png`, `.jpg`, `.gif`, `.svg`.
  - Maximum file size: `2MB`.

---

## Response Format

All responses will follow the structure:

```json
{
  "status": "success/error",
  "data": <data>,
  "message": <message>
}
```

---

## Example Request

### 1. **Create a Product**:

```bash
POST /products
Content-Type: application/json

{
  "name": "New Product",
  "slug": "new-product",
  "description": "This is a new product.",
  "category_id": 1,
  "brand_id": 1,
  "primary_image": "image_file"
}
```

### 2. **Update a Product**:

```bash
POST /products/update
Content-Type: application/json

{
  "id": 1,
  "name": "Updated Product",
  "slug": "updated-product",
  "description": "Updated description",
  "category_id": 2,
  "brand_id": 2,
  "primary_image": "new_image_file"
}
```