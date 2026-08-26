# Expense Management Application - Implementation Details

## 📐 Architecture Overview

### Technology Stack

**Backend**
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.3+
- **Database**: PostgreSQL 12+
- **Authentication**: JWT + bcryptjs
- **Payment**: Stripe API
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, Express Rate Limit, CORS

**Frontend**
- **Framework**: React 18+
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS
- **State Management**: React Hooks

**Infrastructure**
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Deployment**: Docker, Heroku, AWS, DigitalOcean

## 🏗️ System Design

### Request Flow

```
Client Request
    ↓
CORS/Security Headers (Helmet)
    ↓
Rate Limiting
    ↓
Request Parsing (JSON/Form Data)
    ↓
Route Matching
    ↓
Authentication Middleware (JWT)
    ↓
Authorization Check (Admin/Owner)
    ↓
Validation (Joi)
    ↓
Business Logic
    ↓
Database Query (PostgreSQL)
    ↓
Response Formatting
    ↓
Client Response
```

### Database Design

**Primary Keys**: UUID for distributed systems support
**Indexes**: On frequently queried columns (user_id, status, dates)
**Foreign Keys**: Cascading deletes for data integrity
**JSONB**: Flexible fields for metadata and webhooks

### Authentication Flow

```
Registration
    ↓
Password Hashing (bcryptjs)
    ↓
User Creation in DB
    ↓
JWT Token Generation
    ↓
Return Token to Client
    
Login
    ↓
Verify Email Exists
    ↓
Compare Password Hash
    ↓
Update last_login
    ↓
Generate JWT Token
    ↓
Return Token
    
Protected Routes
    ↓
Extract JWT from Header
    ↓
Verify JWT Signature
    ↓
Decode User Info
    ↓
Attach to Request Object
    ↓
Proceed to Route Handler
```

### Payment Processing Flow

```
User Initiates Payment
    ↓
POST /api/payments/create-intent
    ↓
Verify Expense Ownership
    ↓
Create Stripe PaymentIntent
    ↓
Save Payment Record (pending)
    ↓
Return clientSecret to Frontend
    
Frontend Handles Payment
    ↓
Stripe.js Collects Card Details
    ↓
POST /api/payments/confirm
    ↓
Stripe Confirms Payment
    
Payment Processing
    ↓
Stripe Sends Webhook
    ↓
POST /api/webhooks/stripe
    ↓
Verify Webhook Signature
    ↓
Update Payment Status
    ↓
Update Expense Status (reimbursed)
    ↓
Create Audit Log
```

### Webhook Lifecycle

```
Stripe Event Triggered
    ↓
Send POST to /api/webhooks/stripe
    ↓
Verify Signature (HMAC-SHA256)
    ↓
Create Webhook Record (received)
    ↓
Route to Handler (payment_intent.succeeded, etc.)
    ↓
Update Related Records
    ↓
Mark as Processed
    ↓
Return 200 OK to Stripe
    
Failures
    ↓
Mark as Failed
    ↓
Log Error
    ↓
Increment Retry Count
    ↓
Alert Admin
```

## 💾 Database Schema Details

### Users Table Indexes
```sql
-- Speed up email lookups
CREATE INDEX idx_users_email ON users(email);

-- Admin queries
CREATE INDEX idx_users_role ON users(role);

-- User activity tracking
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Expenses Query Optimization
```sql
-- User expense queries
CREATE INDEX idx_expenses_user_id ON expenses(user_id);

-- Status-based filtering
CREATE INDEX idx_expenses_status ON expenses(status);

-- Date range queries
CREATE INDEX idx_expenses_date_range ON expenses(user_id, expense_date);

-- Category analysis
CREATE INDEX idx_expenses_category_user ON expenses(user_id, category_id);
```

### Payments Tracking
```sql
-- Stripe sync
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);

-- User payments
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
```

## 🔐 Security Implementation

### Password Security
```typescript
// bcryptjs with salt rounds
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
```

### JWT Token Structure
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1704067200,
  "exp": 1704153600
}
```

### Input Validation
```typescript
// All inputs validated with Joi
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  amount: Joi.number().positive().required()
});
```

### SQL Injection Prevention
```typescript
// Parameterized queries
query('SELECT * FROM users WHERE email = $1', [email]);
```

### CORS Configuration
```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Rate Limiting
```typescript
// 100 requests per 15 minutes
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
```

## 📝 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": {
    // Resource data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Descriptive error message",
  "statusCode": 400
}
```

### Pagination
```json
{
  "data": [],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

## 🧠 AI Expense Summary Algorithm

### Data Collection
1. Query expenses for date range
2. Group by category
3. Calculate totals and averages

### Analysis
```typescript
// Percentage of total
percentage = (categoryTotal / totalExpenses) * 100

// Daily average
dailyAverage = totalExpenses / numberOfDays

// Trend detection
isHighSpending = percentage > thresholdPercentage
```

### Insights Generation
- Identify top spending categories
- Compare to previous periods
- Generate recommendations
- Create spending alerts

### Example Output
```
Period: Jan 1 - Jan 31, 2024
Total: $1,250.50
Daily Average: $40.34

Top Categories:
1. Food & Dining (35%) - $437.68
2. Transportation (25%) - $312.63
3. Entertainment (20%) - $250.10

Insights:
- High food spending detected
- Recommendation: Try meal planning
- Alert: Above normal entertainment spend
```

## 🔄 Admin Role Implementation

### Permission Matrix

| Action | User | Admin |
|--------|------|-------|
| View own expenses | ✓ | ✓ |
| Create expense | ✓ | ✓ |
| Edit own expense | ✓ | ✓ |
| Delete own expense | ✓ | ✓ |
| View all expenses | ✗ | ✓ |
| Approve/Reject expense | ✗ | ✓ |
| View all users | ✗ | ✓ |
| Change user role | ✗ | ✓ |
| View analytics | ✗ | ✓ |
| View audit logs | ✗ | ✓ |

### Authorization Middleware
```typescript
const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

## 📊 Analytics & Reporting

### Dashboard Metrics
- Total users
- Total expenses (amount and count)
- Pending expenses
- Successful payments
- Recent activity

### Query Examples

**Monthly spending by category**
```sql
SELECT 
  c.name,
  SUM(e.amount) as total,
  COUNT(e.id) as count
FROM expenses e
JOIN expense_categories c ON e.category_id = c.id
WHERE e.user_id = $1
  AND EXTRACT(YEAR FROM e.expense_date) = $2
  AND EXTRACT(MONTH FROM e.expense_date) = $3
GROUP BY c.id, c.name
ORDER BY total DESC;
```

**Top spenders**
```sql
SELECT 
  u.email,
  SUM(e.amount) as total,
  COUNT(e.id) as count
FROM expenses e
JOIN users u ON e.user_id = u.id
GROUP BY u.id
ORDER BY total DESC
LIMIT 10;
```

## 🚀 Performance Optimization

### Database Query Optimization
- Use indexes on frequently queried columns
- Limit returned columns with SELECT
- Implement pagination to avoid large result sets
- Use JOINs efficiently

### Caching Strategy
- Redis for session storage
- In-memory caching for categories
- ETags for API responses

### Code Optimization
- Lazy load modules
- Minimize middleware stack
- Use async/await properly
- Avoid N+1 queries

### Connection Pooling
```typescript
const pool = new Pool({
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000
});
```

## 🧪 Testing Checklist

### Unit Tests
- Authentication (registration, login, JWT)
- Validation (Joi schemas)
- Password hashing
- Error handling

### Integration Tests
- User creation and retrieval
- Expense CRUD operations
- Payment processing
- Webhook handling

### End-to-End Tests
- Complete user journey
- Payment flow
- Role-based access
- Admin operations

### Load Testing
- Concurrent user connections
- Database connection limits
- API rate limiting
- Payment processing

## 📋 Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] HTTPS/SSL enabled
- [ ] CORS configured for production domain
- [ ] Rate limiting tuned
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Load testing done
- [ ] Documentation updated

## 🔍 Debugging Guide

### Enable Debug Logging
```bash
DEBUG=* npm start
```

### Database Debugging
```sql
-- Active queries
SELECT * FROM pg_stat_activity;

-- Query performance
SELECT query, mean_time FROM pg_stat_statements;

-- Connection issues
SELECT * FROM pg_stat_connections;
```

### Stripe Debugging
```bash
# Verify webhook delivery
curl https://dashboard.stripe.com/webhooks

# Check payment intent
stripe payment_intents retrieve pi_xxx

# View events
stripe events list
```

### Common Issues

**"Invalid JWT"**
- Check JWT_SECRET matches between sessions
- Verify token hasn't expired
- Check Authorization header format

**"Connection refused" to database**
- Verify PostgreSQL is running
- Check DB_HOST and DB_PORT
- Verify credentials

**"Webhook signature verification failed"**
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check webhook event format
- Ensure request body isn't parsed before verification

## 📚 Code Examples

### Creating an Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lunch",
    "amount": 25.50,
    "category_id": "uuid",
    "expense_date": "2024-01-15"
  }'
```

### Processing a Payment
```bash
# 1. Create intent
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "expense_id": "uuid",
    "amount": 25.50
  }'

# 2. Confirm from frontend with Stripe
# 3. Webhook updates status automatically
```

### Generating Expense Summary
```bash
curl -X POST http://localhost:5000/api/summary/generate \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

---

**This implementation provides a production-ready, enterprise-grade expense management system with comprehensive features, security, and scalability.**
