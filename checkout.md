# Checkout System Documentation

## Overview
This document provides a comprehensive guide to the IY-Mart checkout system, which consists of a 3-step process: address/payment selection, payment processing, and order confirmation.

---

## 1. Frontend Structure

### Pages Structure
```
src/app/checkout/
├── step1/
│   └── page.tsx          # Address form and payment method selection
├── step2/
│   └── page.tsx          # Payment processing (Stripe integration)
└── step3/
    └── page.tsx          # Order confirmation
```

###you can use file structure used in this reatc project but rember to create web route

### Related Components
```
src/compoments/
├── CheckOutForm.tsx      # Main checkout form with address fields
├── StepperNav.tsx        # Progress stepper component
└── Toast.tsx             # Toast notification component
```

---

## 2. Checkout Flow

### Step 1: Address & Payment Method Selection
**File:** `src/app/checkout/step1/page.tsx`

#### Purpose
- Collect shipping address information
- Select payment method
- Validate form data
- Place initial order

#### Components Used
- `StepperNav` - Shows progress (step 1 of 3)
- `CheckOutForm` - Main form component

#### State Management
The form data is stored in localStorage after successful submission:
- `payment` - Payment details and order summary
- `payment_intent` - Stripe payment intent client secret
- `paymentMethod` - Selected payment method
- `user` - User information
- `user-token` - Authentication token
- `address` - Shipping address details
- `orderId` - Created order ID
- `guest_cart` - Cleared after order placement

---

### Step 2: Payment Processing
**File:** `src/app/checkout/step2/page.tsx`

#### Purpose
- Display order summary
- Process payment based on selected method
- Update order status after successful payment
- Handle different payment methods

#### Payment Methods Supported

##### 1. Card Payment (Stripe)
- **Stripe Public Key (Test):** `pk_test_51R5LWNQwRy5Q2zLn7NTHVCJMc9McLjzpuAIn5mfLuyueQHPNq62lszwRED0yXhEmUILcgxxg3voCO0fgSs8Zvrh600ylwumbte`
- **Stripe Public Key (Live):** `pk_live_51RJYLPGKBOYpXwGmHLYtKVgK5GKqVIcJj3jNszBVEJhpc6IRGDMUD38CFUKU0fDtxPq3b61Xy1Tu6OVhkT2BUJYx00NEIoBQA9`
- Uses Stripe Elements for payment form
- Requires payment intent from Step 1
- Payment confirmed via `stripe.confirmPayment()`

##### 2. Cash on Delivery
- No payment processing required
- Shows instructions to have exact amount ready
- Proceeds directly to Step 3

##### 3. Bank Transfer
- Displays bank account details:
  - **Account Number:** 10680-49703751
  - **Account Name:** バッデヴィターナ　イーシャン　ヤハジーワ
  - **Branch Code:** 068
- Instructions to email receipt to: info.iymart@gmail.com
- Customer must include order ID in transfer details

##### 4. Home Delivery
- Available only for specific prefectures:
  - CHIBA KEN
  - SAITAMA KEN
  - TOKYO TO
  - IBARAKI KEN
  - KANAGAWA KEN
- Shows delivery instructions
- Proceeds directly to Step 3

#### Order Summary Display
Shows the following information:
- Subtotal
- Shipping Fee
- Tax
- Discount
- **Total Amount**

#### State Management
```typescript
interface PaymentType {
  order_details: {
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total_discount: number;
    total: number;
    order_number?: string;
    payment_method?: string;
    user_address_line1?: string;
    user_address_line2?: string;
    user_city?: string;
    user_prefecture?: string;
    user_country?: string;
    user_postal_code?: string;
  };
}
```

---

### Step 3: Order Confirmation
**File:** `src/app/checkout/step3/page.tsx`

#### Purpose
- Display success message
- Confirm order placement
- Provide link to view orders in profile

#### Features
- Success icon and confirmation message
- Information about email confirmation
- "View My Order" button redirecting to `/profile`

---

## 3. API Endpoints

### 3.1 Place Order
**Endpoint:** `POST /api/place-order`

#### Request Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  # Optional - include if user is logged in
```

#### Request Format
```json
{
  "userData": {
    "city": "string",
    "prefecture_id": "string",
    "region_id": "string",
    "postal_code": "string",
    "address_line_1": "string",
    "address_line_2": "string",
    "name": "string",
    "email": "string",
    "mobile": "string",
    "device_name": "web",
    "user_id": "string | null"
  },
  "paymentData": {
    "payment_gateway": "stripe",
    "due_date": null,
    "method": "card | cash_on_delivery | bank_transfer | home_delivery_2"
  },
  "cart_items": [
    {
      "stock_id": "string",
      "quantity": number
    }
  ]
}
```

#### Response Format (Success)
```json
{
  "status": "success",
  "data": {
    "payment": {
      "paymentIntent": "string",  // Stripe client secret
      "order_details": {
        "id": "string",
        "subtotal": number,
        "shipping_cost": number,
        "tax": number,
        "total_discount": number,
        "total": number
      }
    },
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "mobile": "string",
      "token": "string"
    },
    "address": {
      "city": "string",
      "prefecture": {
        "id": "string",
        "prefecture_name": "string"
      },
      "region": {
        "id": "string",
        "name": "string"
      },
      "postal_code": "string",
      "address_line_1": "string",
      "address_line_2": "string"
    },
    "order": {
      "id": "string",
      "subtotal": number,
      "shipping_cost": number,
      "tax": number,
      "total_discount": number,
      "total": number
    }
  }
}
```

#### Response Format (Error)
```json
{
  "status": "error",
  "errors": {
    "field_name": [
      "Error message"
    ]
  }
}
```

---

### 3.2 Update Order Status
**Endpoint:** `PUT /api/update/order-status`

#### Request Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
```

#### Request Format
```json
{
  "order_id": "string",
  "status": "completed",
  "isCreateInvoice": true,
  "isSendInvoice": true
}
```

#### When Called
- After successful card payment via Stripe
- When user proceeds from non-card payment methods (COD, Bank Transfer, Home Delivery)

---

### 3.3 Get Regions
**Endpoint:** `GET /api/regions`

#### Request Headers
```http
Content-Type: application/json
```

#### Response Format
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "name": "string"
    }
  ]
}
```

---

### 3.4 Get Prefectures by Region
**Endpoint:** `GET /api/prefectures?region_id={regionId}`

#### Request Headers
```http
Content-Type: application/json
```

#### Response Format
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "prefecture_name": "string"
    }
  ]
}
```

---

### 3.5 Get Postal Codes by Prefecture
**Endpoint:** `GET /api/postal-data-by?prefecture_name={prefectureName}`

#### Request Headers
```http
Content-Type: application/json
```

#### Response Format
```json
{
  "status": "success",
  "data": [
    {
      "postal_code": "string",
      "city_name_en": "string"
    }
  ]
}
```

---

## 4. Form Validation

### CheckOutForm Component
The form validates the following fields using the `validator` utility:

#### Required Fields
- `name` - User's full name
- `email` - Valid email address
- `mobile` - Phone number
- `region_id` - Selected region
- `prefecture_id` - Selected prefecture
- `postal_code` - Valid postal code
- `city` - City name
- `address_line_1` - Primary address
- `address_line_2` - Secondary address

#### Validation Rules
- All fields are required
- Email must be in valid format
- Mobile number must be valid
- Postal code must match selected prefecture
- City auto-fills based on postal code selection

---

## 5. LocalStorage Data Structure

### Data Stored During Checkout

#### guest_cart
```json
{
  "guest_cart": [
    {
      "stock_id": "string",
      "quantity": number,
      "product_name": "string",
      "price": number
    }
  ]
}
```

#### payment
```json
{
  "paymentIntent": "string",
  "order_details": {
    "id": "string",
    "subtotal": number,
    "shipping_cost": number,
    "tax": number,
    "total_discount": number,
    "total": number
  }
}
```

#### user
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "mobile": "string",
  "token": "string"
}
```

#### address
```json
{
  "city": "string",
  "prefecture": {
    "id": "string",
    "prefecture_name": "string"
  },
  "region": {
    "id": "string",
    "name": "string"
  },
  "postal_code": "string",
  "address_line_1": "string",
  "address_line_2": "string"
}
```

---

## 6. Payment Method Implementation

### Card Payment (Stripe)

#### Setup
```javascript
const stripePromise = loadStripe("YOUR_PUBLISHABLE_KEY");
```

#### Initialize Payment Elements
```javascript
const stripeInstance = await stripePromise;
const clientSecret = localStorage.getItem("payment_intent");

const appearance = {
  theme: "stripe",
  colorBackground: "#ffffff",
  colorText: "#30313d",
  colorDanger: "#df1b41",
  fontFamily: "Ideal Sans, system-ui, sans-serif",
  spacingUnit: "2px",
  borderRadius: "4px",
  fontSizeBase: "16px",
};

const options = {
  clientSecret,
  appearance,
};

const elementsInstance = stripeInstance.elements(options);
const paymentElement = elementsInstance.create("payment", {
  layout: "accordion",
  business: {
    name: "IY Mart",
  },
});
paymentElement.mount("#payment-element");
```

#### Confirm Payment
```javascript
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: "http://localhost:3000/success",
  },
  redirect: "if_required",
});

if (paymentIntent && paymentIntent.status === "succeeded") {
  // Update order status
  // Redirect to step 3
}
```

---

## 7. Useful Developer Notes

### Prerequisites
1. User must have items in `guest_cart` localStorage
2. If cart is empty, user is redirected to `/shop` page

### Authentication Handling
- System supports both guest and authenticated users
- If `user-token` exists in localStorage, include in Authorization header
- Token is generated/returned after placing order

### Error Handling
The system uses a Toast component for user feedback:
```javascript
setToast({
  open: true,
  message: "Your message",
  type: "success" | "error" | "info" | "warning"
});
```

### Region-Specific Features
**Home Delivery** is only available for these prefectures:
- CHIBA KEN
- SAITAMA KEN
- TOKYO TO
- IBARAKI KEN
- KANAGAWA KEN

### Navigation Flow
```
Cart Page → Step 1 (Address & Payment) → Step 2 (Payment Processing) → Step 3 (Confirmation) → Profile/Orders
```

### Redirect URLs
- Success: `/checkout/step3`
- Empty Cart: `/shop`
- View Orders: `/profile`

---

## 8. Environment Configuration

### API Base URL
```
https://apivtwo.iymart.jp/api
```

### Stripe Configuration
- Test Mode: Use `pk_test_...` key for development
- Live Mode: Use `pk_live_...` key for production

---

## 9. Testing Checklist

### Step 1 Testing
- [ ] Form validation for all fields
- [ ] Region → Prefecture → Postal Code cascade
- [ ] City auto-fill based on postal code
- [ ] Payment method selection
- [ ] Empty cart redirect
- [ ] Guest vs authenticated user flow

### Step 2 Testing
- [ ] Order summary displays correctly
- [ ] Card payment with Stripe
- [ ] Cash on Delivery flow
- [ ] Bank Transfer flow
- [ ] Home Delivery (region-specific)
- [ ] Order status update after payment

### Step 3 Testing
- [ ] Success message displays
- [ ] Redirect to profile works
- [ ] Order visible in profile

---

## 10. Common Issues & Solutions

### Issue: Payment Intent Not Found
**Solution:** Ensure Step 1 completes successfully and stores `payment_intent` in localStorage

### Issue: Home Delivery Option Disabled
**Solution:** Verify selected prefecture is in the allowed list for home delivery

### Issue: Order Status Not Updating
**Solution:** Check Authorization token is present in headers and orderId is correct

### Issue: Cart Empty Error
**Solution:** Ensure `guest_cart` in localStorage has items before accessing checkout

---

## 11. Security Considerations

1. **Token Management**: User tokens are stored in localStorage and sent via Authorization header
2. **Stripe Keys**: Use test keys for development, live keys for production
3. **Sensitive Data**: Bank transfer details should be secured and transmitted over HTTPS
4. **Email Validation**: Ensure proper email validation to prevent spam

---

## 12. Future Enhancements

- Add order tracking functionality
- Implement payment retry mechanism
- Add saved addresses for logged-in users
- Support multiple payment methods in single transaction
- Add order editing capability before payment
- Implement promo code/coupon system
- Add invoice download feature

---

## Contact & Support
For API-related issues, contact: info.iymart@gmail.com
