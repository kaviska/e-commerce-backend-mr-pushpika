# Product Review API Documentation

This document outlines the API endpoints for product reviews and provides a guide on how to integrate them into your frontend application.

## Base URL
Assuming your backend is running locally:
`http://127.0.0.1:8000/api`

---

## 1. Fetch Product Reviews

**Endpoint:**
`GET /products/{id}/reviews`

**Description:**
Retrieves a list of reviews for a specific product.

**Parameters:**
- `id` (path parameter): The ID of the product.

**Response Structure:**
```json
{
    "status": "success",
    "message": "Reviews fetched successfully",
    "data": [
        {
            "id": 1,
            "user_id": 101,
            "product_id": 55,
            "rating": 5,
            "comment": "Excellent quality!",
            "created_at": "2023-10-27T10:00:00.000000Z",
            "updated_at": "2023-10-27T10:00:00.000000Z",
            "user": {
                "id": 101,
                "name": "Jane Doe",
                "email": "jane@example.com",
                "avatar": "..."
            }
        },
        ...
    ]
}
```

---

## 2. Submit a Review

**Endpoint:**
`POST /reviews`

**Description:**
Submits a new review for a product. Requires the user to be logged in.

**Headers:**
- `Content-Type`: `application/json`
- `Authorization`: `Bearer <YOUR_ACCESS_TOKEN>`

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product_id` | Integer | Yes | ID of the product being reviewed |
| `rating` | Integer | Yes | Rating from 1 to 5 |
| `comment` | String | No | Text content of the review |

**Success Response:**
```json
{
    "status": "success",
    "message": "Review submitted successfully",
    "data": {
        "id": 2,
        "user_id": 101,
        "product_id": 55,
        "rating": 4,
        "comment": "Good value for money.",
        "created_at": "...",
        "updated_at": "..."
    }
}
```

**Error Response (Already Reviewed):**
```json
{
    "status": "error",
    "message": "You have already reviewed this product"
}
```

---

## Frontend Integration Guide (Vanilla JS)

Below is an example of how to fetch and display reviews using standard JavaScript.

### HTML Structure
```html
<!-- Container for Reviews -->
<div id="reviews-container">
    <h3>Customer Reviews</h3>
    <ul id="reviews-list">
        <!-- Reviews will be injected here -->
    </ul>
</div>

<!-- Add Review Form -->
<form id="add-review-form">
    <input type="hidden" id="product-id" value="1"> <!-- ID of current product -->
    
    <label>Rating:</label>
    <select id="review-rating" required>
        <option value="5">5 - Excellent</option>
        <option value="4">4 - Good</option>
        <option value="3">3 - Average</option>
        <option value="2">2 - Poor</option>
        <option value="1">1 - Terrible</option>
    </select>

    <label>Comment:</label>
    <textarea id="review-comment" placeholder="Write your review here..."></textarea>
    
    <button type="submit">Submit Review</button>
</form>
```

### JavaScript Logic

```javascript
const API_BASE_URL = "http://127.0.0.1:8000/api";
const productId = document.getElementById('product-id').value;
const userToken = localStorage.getItem('token'); // Assuming you store auth token here

// 1. Function to Load Reviews
async function loadReviews(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}/reviews`);
        const result = await response.json();

        if (result.status === 'success') {
            const list = document.getElementById('reviews-list');
            list.innerHTML = ''; // Clear current list

            result.data.forEach(review => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${review.user.name}</strong> - ${review.rating}/5 Stars
                    <p>${review.comment || ''}</p>
                    <small>${new Date(review.created_at).toLocaleDateString()}</small>
                `;
                list.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}

// 2. Handle Form Submission
document.getElementById('add-review-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!userToken) {
        alert("Please login to submit a review.");
        return;
    }

    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;

    try {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                product_id: productId,
                rating: rating,
                comment: comment
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert('Review submitted!');
            loadReviews(productId); // Reload reviews
            document.getElementById('review-comment').value = ''; // Clear form
        } else {
            alert(result.message || 'Failed to submit review');
        }

    } catch (error) {
        console.error("Error submitting review:", error);
    }
});

// Initial Load
loadReviews(productId);
```
