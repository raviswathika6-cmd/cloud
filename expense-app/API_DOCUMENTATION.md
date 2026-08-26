# Expense Management Application - API Documentation

## Overview

This is a full-stack expense management application built with Node.js/Express backend and React frontend. It includes user authentication, expense tracking, receipt uploads, payment processing via Stripe, and AI-powered expense summaries.

## Table of Contents

1. [Authentication API](#authentication-api)
2. [Expense API](#expense-api)
3. [Receipt Upload API](#receipt-upload-api)
4. [Payment API](#payment-api)
5. [Summary API](#summary-api)
6. [Webhook Handling](#webhook-handling)
7. [Database Schema](#database-schema)

---

## Authentication API

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** (201)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

---

### Login

**POST** `/api/auth/login`

Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** (200)
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

---

### Refresh Token

**POST** `/api/auth/refresh-token`

Get a new JWT token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** (200)
```json
{
  "token": "new_jwt_token_here"
}
```

---

### Logout

**POST** `/api/auth/logout`

Logout user and invalidate session.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** (200)
```json
{
  "message": "Logout successful"
}
```

---

## Expense API

All expense endpoints require authentication with JWT token in the Authorization header.

### Get All Expenses

**GET** `/api/expenses`

Retrieve all expenses for the authenticated user.

**Query Parameters:**
- `startDate` (optional): ISO 8601 date format
- `endDate` (optional): ISO 8601 date format
- `category` (optional): Category name
- `status` (optional): 'approved' or 'pending'

**Example:**
```
GET /api/expenses?category=food&status=approved&startDate=2024-01-01&endDate=2024-01-31
```

**Response:** (200)
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "category": "food",
    "amount": "25.50",
    "currency": "USD",
    "description": "Lunch",
    "expense_date": "2024-01-15",
    "payment_method": "card",
    "is_approved": true,
    "tags": ["restaurant", "lunch"],
    "receipt_url": "https://s3.amazonaws.com/...",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Get Single Expense

**GET** `/api/expenses/{expenseId}`

Retrieve a specific expense.

**Response:** (200)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "category": "food",
  "amount": "25.50",
  "currency": "USD",
  "description": "Lunch",
  "expense_date": "2024-01-15",
  "payment_method": "card",
  "is_approved": true,
  "receipt_url": "https://s3.amazonaws.com/...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Create Expense

**POST** `/api/expenses`

Create a new expense.

**Request Body:**
```json
{
  "category": "food",
  "amount": 25.50,
  "currency": "USD",
  "description": "Lunch at restaurant",
  "expenseDate": "2024-01-15",
  "paymentMethod": "card",
  "tags": ["restaurant", "lunch"],
  "receiptId": "receipt-uuid (optional)"
}
```

**Response:** (201)
```json
{
  "message": "Expense created successfully",
  "expense": {
    "id": "uuid",
    "user_id": "uuid",
    "category": "food",
    "amount": "25.50",
    "currency": "USD",
    "description": "Lunch at restaurant",
    "expense_date": "2024-01-15",
    "payment_method": "card",
    "tags": ["restaurant", "lunch"],
    "is_approved": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Update Expense

**PUT** `/api/expenses/{expenseId}`

Update an existing expense.

**Request Body:** (all fields optional)
```json
{
  "category": "food",
  "amount": 30.00,
  "description": "Updated description",
  "expenseDate": "2024-01-15",
  "paymentMethod": "card",
  "tags": ["restaurant", "dinner"]
}
```

**Response:** (200)
```json
{
  "message": "Expense updated successfully",
  "expense": { ... }
}
```

---

### Delete Expense

**DELETE** `/api/expenses/{expenseId}`

Delete an expense.

**Response:** (200)
```json
{
  "message": "Expense deleted successfully"
}
```

---

## Receipt Upload API

### Upload Receipt

**POST** `/api/uploads/receipt`

Upload a receipt file (PDF, JPG, PNG).

**Form Data:**
- `file`: Binary file (max 5MB)

**Response:** (201)
```json
{
  "message": "Receipt uploaded successfully",
  "receipt": {
    "id": "uuid",
    "user_id": "uuid",
    "file_name": "receipt.pdf",
    "file_url": "https://s3.amazonaws.com/...",
    "file_size": 102400,
    "file_type": "pdf",
    "s3_key": "user-uuid/receipt-uuid.pdf",
    "uploaded_at": "2024-01-15T10:30:00Z",
    "is_verified": false
  }
}
```

---

### Get Receipts

**GET** `/api/uploads`

Retrieve all receipts for the user.

**Response:** (200)
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "file_name": "receipt.pdf",
    "file_url": "https://s3.amazonaws.com/...",
    "file_size": 102400,
    "file_type": "pdf",
    "uploaded_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Delete Receipt

**DELETE** `/api/uploads/{receiptId}`

Delete a receipt.

**Response:** (200)
```json
{
  "message": "Receipt deleted successfully"
}
```

---

## Payment API

### Create Payment Intent

**POST** `/api/payments/create-intent`

Create a Stripe payment intent for processing payments.

**Request Body:**
```json
{
  "amount": 100.00,
  "currency": "usd",
  "description": "Payment for expenses",
  "expenseId": "expense-uuid (optional)"
}
```

**Response:** (200)
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

---

### Confirm Payment

**POST** `/api/payments/confirm`

Confirm a payment after it's been processed.

**Request Body:**
```json
{
  "paymentIntentId": "pi_..."
}
```

**Response:** (200)
```json
{
  "message": "Payment confirmed successfully"
}
```

---

### Get Payment Methods

**GET** `/api/payments/methods`

Retrieve saved payment methods.

**Response:** (200)
```json
[
  {
    "id": "pm_...",
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    }
  }
]
```

---

### Get Payment History

**GET** `/api/payments/history`

Retrieve payment transaction history.

**Response:** (200)
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "stripe_payment_id": "pi_...",
    "amount": "100.00",
    "currency": "USD",
    "status": "succeeded",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Refund Payment

**POST** `/api/payments/{paymentId}/refund`

Refund a payment.

**Response:** (200)
```json
{
  "message": "Payment refunded successfully",
  "refundId": "re_..."
}
```

---

## Summary API

### Generate Expense Summary

**POST** `/api/summaries/generate`

Generate AI-powered expense summary with insights and recommendations.

**Request Body:**
```json
{
  "summaryType": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:** (200)
```json
{
  "message": "Expense summary generated successfully",
  "summary": {
    "id": "uuid",
    "totalExpenses": 1500.00,
    "categoryBreakdown": {
      "food": { "total": 450, "count": 15 },
      "transportation": { "total": 300, "count": 10 },
      "utilities": { "total": 400, "count": 4 }
    },
    "insights": "Your spending has increased by 20% compared to last month. The majority of your expenses are food-related.",
    "recommendations": "Consider reducing dining out. Your transportation costs can be optimized by using public transit more frequently."
  }
}
```

---

### Get Expense Summaries

**GET** `/api/summaries`

Retrieve all generated summaries.

**Query Parameters:**
- `summaryType` (optional): 'daily', 'weekly', 'monthly', 'yearly'

**Response:** (200)
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "summary_type": "monthly",
    "period_start": "2024-01-01",
    "period_end": "2024-01-31",
    "total_expenses": "1500.00",
    "category_breakdown": { ... },
    "insights": "...",
    "recommendations": "...",
    "generated_at": "2024-02-01T10:30:00Z"
  }
]
```

---

### Get Single Summary

**GET** `/api/summaries/{summaryId}`

Retrieve a specific summary.

**Response:** (200)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "summary_type": "monthly",
  "total_expenses": "1500.00",
  "category_breakdown": { ... },
  "insights": "...",
  "recommendations": "..."
}
```

---

### Get Quick Insights

**GET** `/api/summaries/quick/insights`

Get quick insights for the last 30 days.

**Response:** (200)
```json
{
  "period": "Last 30 days",
  "totalSpent": 3000.50,
  "dailyAverage": 100.02,
  "topCategory": "food",
  "categoryBreakdown": [
    {
      "category": "food",
      "amount": 1200.00,
      "count": 40,
      "average": 30.00
    },
    {
      "category": "transportation",
      "amount": 800.00,
      "count": 25,
      "average": 32.00
    }
  ]
}
```

---

## Webhook Handling

### Stripe Webhook

**POST** `/api/webhooks/stripe`

Handle Stripe webhook events. This endpoint receives and processes payment events from Stripe.

**Supported Events:**
- `payment_intent.succeeded` - Payment successfully processed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Charge was refunded
- `customer.subscription.updated` - Subscription updated

**Example Webhook Payload:**
```json
{
  "id": "evt_...",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_...",
      "object": "payment_intent",
      "status": "succeeded",
      "amount": 10000,
      "currency": "usd",
      "metadata": {
        "userId": "user-uuid",
        "expenseId": "expense-uuid"
      }
    }
  }
}
```

**Response:**
```json
{
  "received": true
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  expense_date DATE NOT NULL,
  receipt_id UUID REFERENCES receipts(id),
  payment_method VARCHAR(50) NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Receipts Table
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  s3_key VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT false
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  expense_id UUID REFERENCES expenses(id),
  stripe_payment_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expense Summaries Table
```sql
CREATE TABLE expense_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  summary_type VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_expenses DECIMAL(10, 2),
  category_breakdown JSONB,
  insights TEXT,
  recommendations TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Error Handling

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

All endpoints except authentication routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

The JWT token contains:
- `id` - User ID
- `email` - User email
- `role` - User role ('admin' or 'user')
- `iat` - Issued at timestamp
- `exp` - Expiration timestamp

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP

---

## Environment Variables

Required environment variables:

```
DATABASE_URL=postgresql://user:pass@localhost/expense_db
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket-name
OPENAI_API_KEY=sk_...
```

---

## Setup Instructions

1. **Backend Setup:**
   ```bash
   cd server
   npm install
   npm run db:migrate
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm start
   ```

3. **Database:**
   - Create PostgreSQL database
   - Run migrations: `npm run db:migrate`

4. **Configuration:**
   - Copy `.env.example` to `.env`
   - Fill in all required variables

---

This documentation covers all the major endpoints and features of the Expense Management Application. For more information or support, please contact the development team.
