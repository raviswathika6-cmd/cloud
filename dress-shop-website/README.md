# Dress Shop Website

A comprehensive full-stack e-commerce website for selling dresses online, built with React, Node.js/Express, and MongoDB.

## 🎯 Project Overview

This project is a complete e-commerce solution featuring:
- **Modern Frontend**: React with responsive design
- **Backend API**: Node.js/Express with MongoDB
- **User Authentication**: Login and registration system
- **Product Management**: Browse, search, and filter dresses
- **Shopping Cart**: Add items and manage cart
- **Secure Checkout**: Complete order processing
- **Payment Integration**: Stripe payment gateway
- **Order Confirmation**: Email and order tracking

## ✨ Features

### 1. Home Page
- Hero section with call-to-action
- Featured products showcase
- Category browsing
- Newsletter subscription
- Comprehensive footer

### 2. Product Listing Page
- Browse all available dresses
- Search functionality
- Filter by category (Casual, Formal, Summer)
- Sort by name or price
- Responsive grid layout

### 3. Product Details Page
- Detailed product information
- Size and color selection
- Quantity selector
- Customer reviews
- Add to cart / Buy now options
- Product specifications

### 4. User Authentication
- User registration with validation
- Secure login system
- User profile management
- Session persistence

### 5. Shopping Cart
- Add/remove items
- Adjust quantities
- View order summary
- Calculate totals with tax
- Free shipping threshold
- Continue shopping option

### 6. Checkout Page
- Shipping address form
- Payment information entry
- Order review
- Order summary with itemized list
- Tax and shipping calculations

### 7. Payment Integration
- Stripe payment gateway integration
- Secure payment processing
- Payment confirmation
- Order ID generation

### 8. Order Confirmation Page
- Order confirmation message
- Order ID display
- Order total display
- Item summary
- Shipping information
- Return policy information

## 🛠 Technology Stack

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Stripe** - Payment processing
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
dress-shop-website/
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Context providers
│   │   ├── App.js          # Main app component
│   │   └── App.css         # Global styles
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
├── backend/                # Node/Express server
│   ├── models/            # MongoDB models
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/            # API endpoints
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── payments.js
│   ├── server.js          # Main server file
│   ├── .env              # Environment variables
│   └── package.json      # Backend dependencies
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd dress-shop-website
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
```

#### 3. Setup Backend
```bash
cd ../backend
npm install
```

#### 4. Configure Environment Variables
Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dress-shop
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Running the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

The application will be available at `http://localhost:3000`

## 📱 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Home page with features and featured products |
| `/products` | ProductListingPage | Browse all products with filters |
| `/products/:id` | ProductDetailsPage | View detailed product information |
| `/login` | LoginRegisterPage | User login and registration |
| `/cart` | ShoppingCartPage | View and manage shopping cart |
| `/checkout` | CheckoutPage | Complete order checkout |
| `/order-confirmation` | OrderConfirmationPage | Order confirmation |

## 🔐 Authentication

- User registration with email validation
- Secure login with password verification
- Session management using Context API
- Protected routes for logged-in users

## 💳 Payment Processing

- Stripe payment gateway integration
- Test mode for development
- Secure payment intent creation
- Order confirmation after successful payment

## 🎨 UI/UX Features

- Modern gradient design
- Responsive layouts (mobile, tablet, desktop)
- Smooth animations and transitions
- Intuitive navigation
- Clean and organized code
- Accessible form elements

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)

### Cart
- `POST /api/cart/validate` - Validate cart items

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:orderId` - Get order details
- `PATCH /api/orders/:orderId` - Update order status

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm-payment` - Confirm payment

## 🧪 Testing

Frontend components can be tested using:
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or check your Atlas connection string
- Verify the `MONGODB_URI` in `.env`

### Port Already in Use
- Change the PORT in `.env` if 5000 is already in use
- Or kill the process using the port

### CORS Errors
- Ensure backend is running before starting frontend
- Check CORS configuration in server.js

## 📦 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

### Backend (Heroku/Railway)
```bash
git push heroku main
```

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Commit and push
4. Create a pull request

## 📞 Support

For issues or questions, please contact: info@dressshop.com

---

**Dress Shop Website** - Making fashion accessible to everyone! 👗✨
