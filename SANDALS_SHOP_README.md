# 👡 Sandals Shop - Java Spring Boot E-Commerce Application

A full-stack e-commerce application built with **Java Spring Boot** for selling premium sandals with a modern, responsive frontend.

## Project Overview

Sandals Shop is a complete e-commerce platform featuring:
- **Product Catalog**: Browse, search, and filter sandals by type and color
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout System**: Secure order placement with customer information
- **Order Management**: Track and view order history
- **RESTful API**: Complete backend API for all operations
- **Responsive UI**: Modern, mobile-friendly interface

## Project Structure

```
sandals-shop/
├── pom.xml                                      # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/com/sandalsshop/
│   │   │   ├── SandalsShopApplication.java      # Main Spring Boot application
│   │   │   ├── model/
│   │   │   │   ├── Product.java                 # Product entity
│   │   │   │   ├── CartItem.java                # Shopping cart item
│   │   │   │   ├── Order.java                   # Order entity
│   │   │   │   └── OrderItem.java               # Order line item
│   │   │   ├── repository/
│   │   │   │   ├── ProductRepository.java       # Product database access
│   │   │   │   ├── CartItemRepository.java      # Cart database access
│   │   │   │   └── OrderRepository.java         # Order database access
│   │   │   ├── service/
│   │   │   │   ├── ProductService.java          # Product business logic
│   │   │   │   ├── CartService.java             # Cart operations
│   │   │   │   └── OrderService.java            # Order processing
│   │   │   ├── controller/
│   │   │   │   ├── ProductController.java       # Product REST endpoints
│   │   │   │   ├── CartController.java          # Cart REST endpoints
│   │   │   │   └── OrderController.java         # Order REST endpoints
│   │   │   ├── dto/
│   │   │   │   ├── ProductDTO.java              # Product data transfer object
│   │   │   │   ├── CartItemDTO.java             # Cart item DTO
│   │   │   │   └── CheckoutDTO.java             # Checkout form DTO
│   │   │   └── config/
│   │   │       └── DataInitializer.java         # Database initialization
│   │   └── resources/
│   │       ├── application.properties           # Spring Boot configuration
│   │       └── static/
│   │           └── index.html                   # Frontend application
│   └── test/                                    # Test files
└── README.md                                    # This file
```

## Key Features

### 1. Product Management
- Browse all sandals in the catalog
- Search products by name
- Filter by type (Flip Flop, Slide, Strappy, Sport, Slip-on)
- Filter by color (Black, Blue, Red, White, Brown)
- View product details (price, color, size, stock)

### 2. Shopping Cart
- Add items to cart with quantity selection
- View cart contents
- Update item quantities
- Remove items from cart
- Calculate cart total automatically
- Session-based cart persistence

### 3. Checkout & Orders
- Enter shipping information
- Place orders with customer details
- Automatic order confirmation
- Track order history
- View order details and status

### 4. RESTful API Endpoints

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search?query=...` - Search products
- `GET /api/products/filter/type?type=...` - Filter by type
- `GET /api/products/filter/color?color=...` - Filter by color
- `POST /api/products` - Create new product (admin)
- `PUT /api/products/{id}` - Update product (admin)
- `DELETE /api/products/{id}` - Delete product (admin)

#### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/{id}` - Remove item from cart
- `GET /api/cart/total` - Get cart total
- `DELETE /api/cart/clear` - Clear entire cart

#### Orders
- `POST /api/orders/checkout` - Place an order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/customer/{email}` - Get customer orders
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/{id}/status` - Update order status (admin)
- `GET /api/orders/status/{status}` - Filter orders by status

## Technology Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.1.5** - Framework
- **Spring Data JPA** - ORM
- **H2 Database** - In-memory database
- **Maven** - Build tool
- **Lombok** - Reduce boilerplate code

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with responsive design
- **Vanilla JavaScript** - No dependencies
- **Fetch API** - HTTP requests

## Setup & Installation

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- Modern web browser

### Build & Run

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sandals-shop
   ```

2. **Build the project**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:8080`
   - API documentation available at `http://localhost:8080/swagger-ui.html` (if Swagger added)
   - H2 Console at `http://localhost:8080/h2-console`

## Database Configuration

The application uses **H2 in-memory database** by default:
- No external database setup required
- Data is recreated on each application restart
- Perfect for development and testing

### To use a persistent database:

Edit `src/main/resources/application.properties`:

```properties
# MySQL Example
spring.datasource.url=jdbc:mysql://localhost:3306/sandals_shop
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

## Sample Data

The application automatically initializes with sample sandal products:
- Various types (Flip Flop, Slide, Strappy, Sport, Slip-on)
- Multiple colors and sizes
- Realistic pricing from $29.99 to $89.99

To add/modify sample data, edit `ProductService.initializeProducts()` method.

## API Usage Examples

### Get All Products
```bash
curl http://localhost:8080/api/products
```

### Search Products
```bash
curl http://localhost:8080/api/products/search?query=flip
```

### Add to Cart
```bash
curl -X POST http://localhost:8080/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

### Place Order
```bash
curl -X POST http://localhost:8080/api/orders/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "555-1234",
    "shippingAddress": "123 Main St, City, State 12345"
  }'
```

## Frontend Features

### Navigation
- **Shop**: Browse product catalog
- **Cart**: View and manage shopping cart
- **Orders**: Track order history

### Product Features
- Quantity selector with +/- buttons
- Color-coded product cards
- Real-time cart count
- Add to cart confirmation

### Checkout Process
- Simple form with validation
- Customer information capture
- Automatic order ID generation
- Order confirmation message

## Error Handling
- Graceful error messages
- Input validation on both frontend and backend
- Empty state handling (empty cart, no orders)
- Session management for cart persistence

## Security Considerations

Current implementation includes:
- CORS enabled for API access
- Session-based cart management
- Input validation

### For Production:
- Implement authentication/authorization
- Add HTTPS/TLS
- Validate user sessions
- Implement payment processing
- Add CSRF protection
- Rate limiting on API endpoints
- Input sanitization

## Future Enhancements

- User authentication and registration
- Multiple payment gateway integration
- Order tracking with real-time updates
- Product reviews and ratings
- Wishlist functionality
- Discount codes and promotions
- Inventory management dashboard
- Email notifications
- Admin panel for product management

## Development Notes

### Service Layer Architecture
- Services handle all business logic
- Controllers are thin and focused on HTTP handling
- DTOs separate API contracts from entities
- Repository pattern for data access

### Frontend Architecture
- Vanilla JavaScript (no framework dependencies)
- Responsive CSS Grid layout
- Session-based cart persistence
- Real-time cart count updates
- Clean separation of concerns

## Troubleshooting

### Build Issues
```bash
# Clear Maven cache
mvn clean

# Rebuild
mvn install
```

### Runtime Issues
- Ensure port 8080 is not in use
- Check Java version: `java -version` (requires Java 17+)
- Check logs for detailed error messages

### Cart Not Persisting
- Cart is session-based; refresh clears it
- Implement persistent storage for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Happy sandal shopping!** 👡
