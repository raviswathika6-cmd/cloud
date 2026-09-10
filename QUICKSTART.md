# 🚀 Sandals Shop - Quick Start Guide

## Prerequisites
- Java 17 or higher
- Maven 3.6+

## Building the Application

```bash
# Navigate to the project directory
cd /path/to/cloud

# Clean and build the project
mvn clean install

# Or skip tests during development
mvn clean install -DskipTests
```

## Running the Application

```bash
# Using Maven
mvn spring-boot:run

# Or run the JAR directly after building
java -jar target/sandals-shop-1.0.0.jar
```

The application will start on `http://localhost:8080`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search?name=<search>` - Search products
- `GET /api/products/filter/type?type=<type>` - Filter by type
- `GET /api/products/filter/color?color=<color>` - Filter by color
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Shopping Cart
- `GET /api/cart?sessionId=<id>` - Get cart items
- `POST /api/cart/add?sessionId=<id>` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item quantity
- `DELETE /api/cart/{id}` - Remove item from cart
- `DELETE /api/cart/clear?sessionId=<id>` - Clear cart
- `GET /api/cart/total?sessionId=<id>` - Get cart total

### Orders
- `POST /api/orders/checkout?sessionId=<id>` - Place order
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders` - Get all orders
- `GET /api/orders/customer/{email}` - Get orders by email
- `GET /api/orders/status/{status}` - Get orders by status
- `PUT /api/orders/{id}/status` - Update order status
- `DELETE /api/orders/{id}` - Delete order

## Frontend Features

### Shop Page
- Browse all available sandals
- Search products by name or description
- Filter by type (Flip Flop, Slide, Strappy, Sport, Slip-on)
- Filter by color (Black, Blue, Red, White, Brown)
- Add items to cart with custom quantities

### Cart Page
- View all items in cart
- Update item quantities
- Remove items
- View total price
- Proceed to checkout

### Checkout Page
- Enter customer information
- Review order summary
- Place order securely
- Order confirmation

### Orders Page
- View order history by email
- Track order status (PENDING, SHIPPED, DELIVERED)
- View order details and items
- Order dates and customer information

## Database

The application uses **H2 in-memory database** for development.

- Database URL: `http://localhost:8080/h2-console`
- Database Name: `sandalsshopdb`
- Username: `sa`
- Password: (leave blank)

### Default Products Loaded
The application automatically loads 6 sample products on startup:
1. Classic Flip Flops - $19.99
2. Summer Slide Sandals - $24.99
3. Strappy Sandals - $34.99
4. Beach Flip Flops - $22.99
5. Sport Sandals - $44.99
6. Casual Slip-ons - $29.99

## Project Architecture

### Layered Architecture
```
Controller Layer (REST APIs)
   ↓
Service Layer (Business Logic)
   ↓
Repository Layer (Data Access)
   ↓
Entity/Model Layer (Database)
```

### Key Technologies
- **Framework**: Spring Boot 3.1.5
- **Build Tool**: Maven
- **Database**: H2 (embedded)
- **ORM**: JPA/Hibernate
- **API Style**: RESTful
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## Development Tips

### Adding New Products
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Leather Sandals",
    "description": "Handcrafted leather sandals",
    "type": "Strappy",
    "color": "Brown",
    "size": "L",
    "price": 59.99,
    "stock": 20
  }'
```

### Creating an Order via API
```bash
curl -X POST "http://localhost:8080/api/orders/checkout?sessionId=test-session" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "123-456-7890",
    "shippingAddress": "123 Main St, City, State 12345"
  }'
```

## Troubleshooting

### Port Already in Use
If port 8080 is already in use, change it in `application.properties`:
```properties
server.port=8081
```

### Database Issues
To reset the database, simply restart the application (since it uses in-memory H2).

### CORS Issues
The application allows CORS for all origins. To restrict in production, modify the `@CrossOrigin` annotations in the controllers.

## Future Enhancements
- User authentication and authorization
- Payment gateway integration
- Product reviews and ratings
- Wishlist functionality
- Advanced analytics
- Admin panel
- Email notifications
- Inventory management

## Support
For issues or questions, refer to the full documentation in `SANDALS_SHOP_README.md`
