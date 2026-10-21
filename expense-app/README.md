# Expense Management Application

A full-stack web application for managing personal and business expenses with AI-powered insights, payment processing, and role-based access control.

## Features

### 🔐 Authentication & Security
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Role-based access control (Admin/User)
- Session management
- Secure API endpoints

### 💰 Expense Management
- Create, read, update, and delete expenses
- Categorize expenses (Food, Transportation, Entertainment, etc.)
- Filter expenses by date range, category, and approval status
- Add notes and tags to expenses
- Bulk operations support

### 📄 Receipt Management
- Upload receipt images (PDF, JPG, PNG)
- AWS S3 integration for secure file storage
- Receipt verification system
- Automatic file validation and compression

### 💳 Payment Gateway Integration
- Stripe payment processing
- Create payment intents
- Multiple currency support (USD, EUR, GBP, INR)
- Payment refund handling
- Secure webhook processing

### 🤖 AI-Powered Insights
- OpenAI GPT-3.5 integration
- Automatic expense analysis
- Category spending breakdown
- Personalized recommendations
- Spending pattern detection

### 📊 Admin Dashboard
- User management
- Expense approval workflows
- System audit logs
- Analytics and reports

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with connection pooling
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **File Upload:** Multer
- **Cloud Storage:** AWS S3
- **Payment:** Stripe API
- **AI:** OpenAI GPT-3.5 API
- **Validation:** express-validator
- **Security:** Helmet, CORS

### Frontend
- **Library:** React 18
- **Routing:** React Router v6
- **State Management:** Context API
- **HTTP Client:** Fetch API
- **Styling:** CSS3
- **Build Tool:** Create React App

### Database
- PostgreSQL 12+
- UUID for primary keys
- JSONB for flexible data storage
- Full-text search support

## Project Structure

```
expense-app/
├── server/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── uploadController.js
│   │   ├── paymentController.js
│   │   ├── summaryController.js
│   │   └── webhookController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── upload.js
│   │   ├── payments.js
│   │   ├── summaries.js
│   │   └── webhooks.js
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── index.js
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ExpenseList.js
│   │   │   ├── ExpenseForm.js
│   │   │   ├── Summary.js
│   │   │   ├── Payments.js
│   │   │   └── AdminPanel.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── Layout.css
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   ├── ExpenseList.css
│   │   │   ├── ExpenseForm.css
│   │   │   ├── Summary.css
│   │   │   ├── Payments.css
│   │   │   └── AdminPanel.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── package.json
├── .env.example
├── API_DOCUMENTATION.md
└── README.md
```

## Installation

### Prerequisites
- Node.js 14+ and npm
- PostgreSQL 12+
- AWS Account (for S3)
- Stripe Account (for payments)
- OpenAI API Key (for AI features)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp ../.env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/expense_db
   JWT_SECRET=your_secure_secret_key
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=your-bucket-name
   OPENAI_API_KEY=sk_your_key
   PORT=5000
   ```

3. **Create database and run migrations:**
   ```bash
   psql -U postgres -c "CREATE DATABASE expense_db;"
   npm run db:migrate
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   
   Server runs at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Configure API URL (optional):**
   Create `.env` file in client directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   
   App runs at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Receipts
- `POST /api/uploads/receipt` - Upload receipt file
- `GET /api/uploads` - Get all receipts
- `DELETE /api/uploads/:id` - Delete receipt

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/methods` - Get payment methods
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/:id/refund` - Refund payment

### Summaries
- `POST /api/summaries/generate` - Generate AI expense summary
- `GET /api/summaries` - Get all summaries
- `GET /api/summaries/:id` - Get single summary
- `GET /api/summaries/quick/insights` - Get quick insights

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## Database Schema

The application uses PostgreSQL with the following main tables:

### Users
- `id` - UUID primary key
- `email` - Unique email address
- `password` - Hashed password
- `first_name`, `last_name` - User name
- `role` - 'admin' or 'user'
- `is_active` - Account status
- `last_login` - Last login timestamp

### Expenses
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `category` - Expense category
- `amount` - Expense amount
- `currency` - Currency code
- `description` - Expense description
- `expense_date` - Date of expense
- `payment_method` - How it was paid
- `is_approved` - Admin approval status
- `tags` - Array of tags
- `receipt_id` - Foreign key to receipts

### Receipts
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `file_name` - Original filename
- `file_url` - S3 URL
- `file_size` - File size in bytes
- `file_type` - File extension
- `s3_key` - S3 object key
- `is_verified` - Verification status

### Payments
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `stripe_payment_id` - Stripe payment intent ID
- `stripe_customer_id` - Stripe customer ID
- `amount` - Payment amount
- `currency` - Currency code
- `status` - Payment status
- `webhook_received` - Webhook confirmation

### Expense Summaries
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `summary_type` - 'daily', 'weekly', 'monthly', 'yearly'
- `period_start`, `period_end` - Date range
- `total_expenses` - Total amount
- `category_breakdown` - JSONB category data
- `insights` - AI insights text
- `recommendations` - AI recommendations

### Audit Logs
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `action` - Action performed
- `resource_type` - Type of resource
- `resource_id` - ID of resource
- `changes` - JSONB of changes
- `created_at` - Timestamp

## Usage Examples

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Create an Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "food",
    "amount": 25.50,
    "description": "Lunch",
    "expenseDate": "2024-01-15",
    "paymentMethod": "card"
  }'
```

### Generate AI Summary
```bash
curl -X POST http://localhost:5000/api/summaries/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summaryType": "monthly",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

## Webhook Integration

The application integrates with Stripe webhooks to automatically update payment statuses. Configure your Stripe webhook endpoint to:

```
https://your-domain.com/api/webhooks/stripe
```

**Supported events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `customer.subscription.updated`

## Security Considerations

- ✅ JWT tokens for stateless authentication
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention with parameterized queries
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation with express-validator
- ✅ AWS S3 encryption for file uploads
- ✅ Stripe webhook signature verification
- ✅ Role-based access control
- ✅ Audit logging for all actions

## Performance Optimization

- Database connection pooling (20 max connections)
- Indexed queries on frequently searched columns
- Pagination support for large datasets
- S3 edge caching for receipt files
- JWT token caching on frontend
- Lazy loading of components

## Error Handling

All API errors return consistent JSON format:

```json
{
  "message": "Error description"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Development

### Running Tests
```bash
npm test
```

### Building for Production

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
```

### Linting
```bash
npm run lint
```

## Deployment

### Heroku Deployment

1. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set DATABASE_URL=your_db_url
   heroku config:set JWT_SECRET=your_secret
   # ... set all other env vars
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

### Docker Deployment

Build and run with Docker:

```bash
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- 📧 Email: support@expenseapp.com
- 🐛 Bug Reports: [GitHub Issues](https://github.com/yourusername/expense-app/issues)
- 📚 Documentation: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Expense forecasting with ML
- [ ] Multi-currency conversion
- [ ] Team expense sharing
- [ ] Integration with accounting software
- [ ] Advanced reporting dashboard
- [ ] Expense templates
- [ ] Receipt OCR with AI

## Acknowledgments

- OpenAI for GPT-3.5 API
- Stripe for payment processing
- AWS for S3 storage
- PostgreSQL for reliability

---

**Made with ❤️ for better expense management**
