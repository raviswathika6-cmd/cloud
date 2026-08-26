# Expense Management Application

A full-stack, production-ready expense management system with advanced features including user authentication, file upload for receipts, payment gateway integration, role-based access control, and AI-powered expense summaries.

## 🎯 Features

### Core Features
- ✅ **User Authentication**: Secure registration and login with JWT tokens
- ✅ **Expense Management**: Create, read, update, and delete expenses
- ✅ **Receipt Upload**: Support for image and PDF file uploads (max 5MB)
- ✅ **Category Management**: Pre-defined expense categories
- ✅ **Expense Tracking**: Track expenses with status (pending, approved, rejected, reimbursed)

### Advanced Features
- ✅ **Payment Gateway Integration**: Stripe integration for secure payments
- ✅ **Webhook Handling**: Real-time payment status updates via Stripe webhooks
- ✅ **Role-Based Access Control**: Admin and User roles with different permissions
- ✅ **AI-Powered Insights**: Automatic expense summaries and spending insights
- ✅ **Dashboard Statistics**: Admin dashboard with comprehensive analytics
- ✅ **Audit Logging**: Track all user actions and changes

### Security Features
- ✅ **HTTPS/TLS Ready**: Helmet.js for security headers
- ✅ **CORS Protection**: Configurable cross-origin requests
- ✅ **Rate Limiting**: DDoS protection with express-rate-limit
- ✅ **Password Hashing**: bcryptjs for secure password storage
- ✅ **Input Validation**: Joi validation for all inputs
- ✅ **SQL Injection Protection**: Parameterized queries with pg library

## 📋 Project Structure

```
expense-management-app/
├── src/
│   ├── server.ts                 # Main server file
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.ts              # Authentication middleware
│   │   └── errorHandler.ts      # Error handling
│   └── routes/
│       ├── auth.ts              # Auth routes (register, login)
│       ├── expenses.ts          # Expense CRUD operations
│       ├── payments.ts          # Payment processing
│       ├── webhooks.ts          # Stripe webhook handling
│       ├── summary.ts           # AI expense summaries
│       └── admin.ts             # Admin panel endpoints
├── database/
│   └── schema.sql               # PostgreSQL schema
├── uploads/
│   └── receipts/                # Receipt file storage
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn
- Stripe account (for payment processing)

### Installation

1. **Clone the repository**
```bash
cd expense-management-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL**
```bash
# Create database
createdb expense_db

# Load schema
psql -U postgres -d expense_db -f database/schema.sql
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Build TypeScript**
```bash
npm run build
```

6. **Start the server**
```bash
npm start

# Or for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:5000`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense (with receipt upload)
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/categories/list` - Get all categories

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments` - Get user's payments
- `GET /api/payments/:paymentId` - Get payment details
- `POST /api/payments/:paymentId/refund` - Refund payment

### Summaries & AI Insights
- `POST /api/summary/generate` - Generate expense summary for period
- `GET /api/summary` - Get all summaries
- `GET /api/summary/period` - Get summary for specific period
- `GET /api/summary/monthly/:year/:month` - Get monthly summary

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook endpoint
- `GET /api/webhooks/health` - Health check
- `GET /api/webhooks/logs` - Get webhook logs (admin)

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/users/:userId` - Get user details (admin)
- `PUT /api/admin/users/:userId/role` - Update user role (admin)
- `PUT /api/admin/users/:userId/status` - Activate/deactivate user (admin)
- `GET /api/admin/expenses` - Get all expenses (admin)
- `PUT /api/admin/expenses/:expenseId/status` - Update expense status (admin)
- `GET /api/admin/statistics/dashboard` - Dashboard statistics (admin)
- `GET /api/admin/audit-logs` - Audit logs (admin)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### User Roles

| Role | Permissions |
|------|------------|
| **User** | Create/edit own expenses, view own data |
| **Admin** | Manage all users, approve/reject expenses, view analytics |

## 💳 Payment Integration

### Setup Stripe
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add keys to `.env` file:
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Webhook Configuration
1. Go to Stripe Dashboard → Developers → Webhooks
2. Create a new webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

### Payment Flow
1. User creates expense
2. User initiates payment with `POST /api/payments/create-intent`
3. Frontend handles payment with Stripe.js
4. Backend confirms payment with `POST /api/payments/confirm`
5. Webhook updates payment status automatically

## 🧠 AI-Powered Expense Summary

The system automatically generates:
- **Category Breakdown**: Spending by category with percentages
- **Spending Trends**: Identifies patterns and high-spending areas
- **Insights**: Actionable recommendations based on spending
- **Alerts**: Warns about unusual spending patterns

### Generate Summary
```bash
POST /api/summary/generate
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

Response includes:
- Total expenses for the period
- Category breakdown with percentages
- AI-generated summary with insights
- Spending recommendations

## 📊 Database Schema

### Main Tables

**users**
- id (UUID, PK)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- first_name, last_name (VARCHAR)
- role (VARCHAR: user/admin)
- is_active, is_email_verified (BOOLEAN)
- created_at, updated_at, last_login (TIMESTAMP)

**expenses**
- id (UUID, PK)
- user_id (UUID, FK → users)
- category_id (UUID, FK → expense_categories)
- title, description (VARCHAR/TEXT)
- amount (DECIMAL)
- expense_date (DATE)
- status (VARCHAR: pending/approved/rejected/reimbursed)
- receipt_url, receipt_file_name (VARCHAR)
- created_at, updated_at (TIMESTAMP)

**payments**
- id (UUID, PK)
- user_id (UUID, FK → users)
- expense_id (UUID, FK → expenses)
- stripe_payment_id, stripe_charge_id (VARCHAR)
- amount (DECIMAL)
- status (VARCHAR: pending/processing/succeeded/failed/refunded)
- metadata (JSONB)
- created_at, updated_at (TIMESTAMP)

**expense_summaries**
- id (UUID, PK)
- user_id (UUID, FK → users)
- period_start, period_end (DATE)
- total_expenses (DECIMAL)
- category_breakdown (JSONB)
- ai_summary (TEXT)
- insights (JSONB)
- created_at (TIMESTAMP)

**webhooks**
- id (UUID, PK)
- event_type (VARCHAR)
- external_id (VARCHAR)
- payload (JSONB)
- status (VARCHAR: received/processed/failed)
- error_message (TEXT)
- retry_count (INTEGER)
- created_at, processed_at (TIMESTAMP)

## 🧪 Testing

### Create Test Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lunch",
    "description": "Lunch at restaurant",
    "amount": 45.50,
    "category_id": "category-uuid",
    "expense_date": "2024-01-15",
    "payment_method": "card"
  }'
```

### Get All Expenses
```bash
curl http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Expense Summary
```bash
curl -X POST http://localhost:5000/api/summary/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

## 📁 File Upload

### Upload Receipt with Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Grocery Shopping" \
  -F "amount=120.50" \
  -F "expense_date=2024-01-15" \
  -F "receipt=@/path/to/receipt.pdf"
```

**Supported formats**: JPEG, PNG, GIF, PDF
**Max file size**: 5MB
**Storage location**: `./uploads/receipts/`

## 🔄 Error Handling

All errors follow a consistent format:
```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## 🚀 Deployment

### Production Checklist
- [ ] Update `JWT_SECRET` in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Configure real Stripe keys
- [ ] Set up PostgreSQL backup strategy
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for your domain
- [ ] Set up rate limiting appropriately
- [ ] Enable audit logging
- [ ] Configure email notifications
- [ ] Set up monitoring and alerting

### Deploy with Docker
```bash
# Build image
docker build -t expense-app .

# Run container
docker run -p 5000:5000 \
  -e DB_HOST=postgres \
  -e STRIPE_SECRET_KEY=sk_... \
  expense-app
```

### Deploy with PM2
```bash
npm install -g pm2
npm run build
pm2 start dist/server.js --name "expense-app"
pm2 save
```

## 📚 API Documentation

For detailed API documentation, import the OpenAPI specification into Postman or Swagger UI.

## 🛠️ Development

### Available Scripts
```bash
npm run dev       # Start with auto-reload
npm run build     # Build TypeScript
npm start         # Start production server
npm test          # Run tests
npm run seed      # Seed database with sample data
```

### Code Style
- TypeScript for type safety
- Joi for input validation
- Consistent error handling
- Parameterized queries to prevent SQL injection

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **Password Hashing**: Uses bcryptjs with salt rounds
3. **JWT Expiry**: Set appropriate token expiration
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: All inputs validated with Joi
6. **SQL Injection**: Using parameterized queries
7. **Rate Limiting**: Enabled for all API endpoints
8. **CORS**: Configured for specific origins
9. **Helmet**: Security headers configured

## 📞 Support

For issues, questions, or feature requests, please create an issue in the repository.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe API Documentation](https://stripe.com/docs)
- [JWT Authentication](https://jwt.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Created with ❤️ for expense management**
