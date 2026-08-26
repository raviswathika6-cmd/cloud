# Expense Management Application - Complete Setup & Usage Guide

## 🎯 Quick Reference

### Getting Started (5 minutes)
```bash
# 1. Clone and install
npm install

# 2. Set up database
createdb expense_db
psql -U postgres -d expense_db -f database/schema.sql

# 3. Configure environment
cp .env.example .env
# Edit .env with your Stripe keys

# 4. Build and run
npm run build
npm start
```

### Or with Docker (2 minutes)
```bash
docker-compose up -d
# Accessed at http://localhost:5000
```

---

## 📖 Complete Feature Documentation

### 1. User Authentication

**User Registration**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**User Login**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Get Profile**
```bash
GET /api/auth/profile
Authorization: Bearer {token}
```

---

### 2. Expense Management

**Create Expense (Text)**
```bash
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Office Supplies",
  "amount": 150.00,
  "category_id": "category-uuid",
  "expense_date": "2024-01-15",
  "payment_method": "card",
  "description": "Purchased from Staples"
}
```

**Create Expense (With Receipt Upload)**
```bash
POST /api/expenses
Authorization: Bearer {token}
Content-Type: multipart/form-data

Fields:
- title: "Grocery Shopping"
- amount: 85.50
- category_id: (uuid)
- expense_date: "2024-01-15"
- receipt: (file: image/pdf, max 5MB)
```

**Get All Expenses**
```bash
GET /api/expenses?status=pending&limit=20&offset=0
Authorization: Bearer {token}

Query Parameters:
- status: pending|approved|rejected|reimbursed
- category: category-uuid
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
- limit: number (default 50)
- offset: number (default 0)
```

**Get Single Expense**
```bash
GET /api/expenses/{expenseId}
Authorization: Bearer {token}
```

**Update Expense**
```bash
PUT /api/expenses/{expenseId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "amount": 100.00,
  ...
}
```

**Delete Expense**
```bash
DELETE /api/expenses/{expenseId}
Authorization: Bearer {token}
```

---

### 3. Payment Processing

**Create Payment Intent**
```bash
POST /api/payments/create-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "expense_id": "uuid",
  "amount": 100.00,
  "currency": "usd"
}

Response:
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx",
  "payment": {
    "id": "uuid",
    "status": "pending",
    "amount": 100.00
  }
}
```

**Frontend: Collect Payment (using Stripe.js)**
```javascript
// In React component
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function PaymentForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });
    return result;
  };

  return (
    <CardElement />
  );
}
```

**Confirm Payment**
```bash
POST /api/payments/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "payment_intent_id": "pi_xxx",
  "payment_method_id": "pm_xxx"
}
```

**Get Payment Status**
```bash
GET /api/payments/{paymentId}
Authorization: Bearer {token}
```

**List User Payments**
```bash
GET /api/payments?status=succeeded&limit=20
Authorization: Bearer {token}
```

**Refund Payment**
```bash
POST /api/payments/{paymentId}/refund
Authorization: Bearer {token}
```

---

### 4. AI-Powered Expense Summary

**Generate Summary**
```bash
POST /api/summary/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}

Response:
{
  "message": "Expense summary generated successfully",
  "summary": {
    "id": "uuid",
    "period_start": "2024-01-01",
    "period_end": "2024-01-31",
    "total_expenses": 2500.75,
    "category_breakdown": {
      "Food & Dining": {
        "category": "Food & Dining",
        "total": 875.50,
        "count": 12
      },
      "Transportation": {
        "category": "Transportation",
        "total": 425.25,
        "count": 8
      }
    },
    "ai_summary": "📊 Expense Summary...\n💰 Total Spent: $2500.75\n...",
    "insights": {
      "trend": "🍽️ High spending on food & dining",
      "recommendation": "Consider meal planning to reduce food expenses",
      "alert": "⚠️ Food spending exceeds 40% of total"
    }
  }
}
```

**Get All Summaries**
```bash
GET /api/summary?limit=12&offset=0
Authorization: Bearer {token}
```

**Get Monthly Summary**
```bash
GET /api/summary/monthly/2024/01
Authorization: Bearer {token}
```

---

### 5. Admin Features

**Get All Users**
```bash
GET /api/admin/users?role=user&status=active&limit=20
Authorization: Bearer {admin-token}
```

**Get User Details**
```bash
GET /api/admin/users/{userId}
Authorization: Bearer {admin-token}

Response includes:
- User info
- Total expenses
- Total payments
- Statistics
```

**Update User Role**
```bash
PUT /api/admin/users/{userId}/role
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "role": "admin"  // or "user"
}
```

**Deactivate User**
```bash
PUT /api/admin/users/{userId}/status
Authorization: Bearer {admin-token}

{
  "isActive": false
}
```

**Get All Expenses (Admin)**
```bash
GET /api/admin/expenses?userId=uuid&status=pending
Authorization: Bearer {admin-token}
```

**Approve/Reject Expense**
```bash
PUT /api/admin/expenses/{expenseId}/status
Authorization: Bearer {admin-token}

{
  "status": "approved"  // or "rejected"
}
```

**Dashboard Statistics**
```bash
GET /api/admin/statistics/dashboard
Authorization: Bearer {admin-token}

Response:
{
  "statistics": {
    "users": { "total": 125 },
    "expenses": {
      "total": 2500,
      "totalAmount": 85000.50,
      "pending": 150,
      "pendingAmount": 12000.00
    },
    "payments": {
      "successful": 1800,
      "successfulAmount": 65000.00
    }
  }
}
```

**View Audit Logs**
```bash
GET /api/admin/audit-logs?userId=uuid&action=CREATE&limit=100
Authorization: Bearer {admin-token}
```

---

### 6. Webhook Handling

**Stripe Webhook Events Handled**
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `charge.dispute.created` - Payment disputed

**Response**
```json
{
  "received": true
}
```

**Get Webhook Logs**
```bash
GET /api/webhooks/logs?status=processed&limit=100
Authorization: Bearer {admin-token}
```

---

## 🔐 Role-Based Access Examples

### User Permissions
```javascript
// Can only access own expenses
GET /api/expenses  // Only shows their expenses

// Can create expenses
POST /api/expenses  // Creates for themselves

// Cannot access admin endpoints
GET /api/admin/users  // 403 Forbidden

// Cannot access other users' data
GET /api/expenses/{otherUserExpenseId}  // 403 Forbidden
```

### Admin Permissions
```javascript
// Can access all expenses
GET /api/expenses  // Admin can add ?userId=

// Can approve/reject
PUT /api/admin/expenses/{id}/status

// Can view all users
GET /api/admin/users

// Can change user roles
PUT /api/admin/users/{id}/role

// Can view analytics
GET /api/admin/statistics/dashboard
```

---

## 💾 Database Operations

### View Expenses
```sql
-- User's expenses
SELECT * FROM expenses 
WHERE user_id = 'user-uuid' 
ORDER BY expense_date DESC;

-- By category
SELECT category_name, COUNT(*), SUM(amount)
FROM expenses e
JOIN expense_categories c ON e.category_id = c.id
GROUP BY category_name;

-- Pending approval
SELECT * FROM expenses 
WHERE status = 'pending' 
ORDER BY created_at;
```

### View Payments
```sql
-- Successful payments
SELECT * FROM payments 
WHERE status = 'succeeded' 
AND user_id = 'user-uuid';

-- Failed payments for retry
SELECT * FROM payments 
WHERE status = 'failed';
```

### View Webhooks
```sql
-- Recent webhook activity
SELECT event_type, status, COUNT(*) 
FROM webhooks 
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY event_type, status;
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Expense & Payment Flow
1. Register user
2. Create expense ($50)
3. Create payment intent
4. Confirm payment (simulated)
5. Webhook updates status
6. Verify payment succeeded

### Scenario 2: Admin Approval Workflow
1. User creates expense
2. Admin views all expenses
3. Admin changes status to "approved"
4. User sees updated expense

### Scenario 3: Monthly Budget Review
1. Get expenses for month
2. Generate AI summary
3. Review insights and trends
4. Compare to previous month

### Scenario 4: Receipt Management
1. Create expense with receipt
2. Verify file upload
3. Retrieve receipt URL
4. Download receipt

---

## 📱 Frontend Integration

### React Hook Example
```typescript
const useExpenses = (token: string) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      const res = await axios.get('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data.expenses);
      setLoading(false);
    };
    fetchExpenses();
  }, [token]);

  return { expenses, loading };
};
```

### Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🐛 Troubleshooting

### "Invalid JWT Token"
- Token expired: Generate new token by logging in again
- Wrong secret: Verify JWT_SECRET matches
- Malformed header: Check format: `Bearer {token}`

### "Unauthorized: User not found"
- User account deleted
- Database connection issue
- Check user UUID is correct

### "Payment failed"
- Insufficient funds
- Card declined
- Webhook not configured
- Check Stripe logs

### "File upload failed"
- File too large (max 5MB)
- Wrong file type (must be image or PDF)
- Disk space issue
- Check uploads directory permissions

### "Database connection refused"
- PostgreSQL not running: `sudo service postgresql start`
- Wrong credentials: Check .env
- Host mismatch: Default is localhost

---

## 📊 Performance Tips

1. **Database**: Index commonly filtered columns
2. **API**: Use pagination for large datasets
3. **Uploads**: Compress images before upload
4. **Caching**: Cache category lists
5. **Queries**: Avoid N+1 queries with JOINs

---

## 🔒 Security Reminders

1. ✅ Never commit `.env` file
2. ✅ Use strong JWT_SECRET (32+ characters)
3. ✅ Enable HTTPS in production
4. ✅ Validate all user inputs
5. ✅ Keep dependencies updated
6. ✅ Monitor webhook logs
7. ✅ Regularly backup database
8. ✅ Review audit logs

---

**For detailed documentation, see:**
- README.md - Project overview
- DEPLOYMENT.md - Deployment guide
- IMPLEMENTATION.md - Technical details
- API.yaml - OpenAPI specification

---

Happy expense tracking! 💰
