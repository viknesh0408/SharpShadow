# SharpShadow — Digital PSD Marketplace

**SharpShadow** is a production-grade digital marketplace engineered for browsing, buying, and securely downloading high-resolution Adobe Photoshop (.PSD) templates, mockups, social graphics, and digital design assets.

---

## 1. Project Overview & Architecture

### High-Level Architecture

SharpShadow follows a decoupled, secure client-server architecture:

```
[ Web Client: React + Vite + Tailwind CSS ]
                     │  (HTTPS / REST APIs)
                     ▼
[ Spring Boot 3 Backend Server ]
 ├── Spring Security + Stateless JWT Filter
 ├── Bean Validation & Exception Layer
 ├── Layered Architecture (Controller ➔ Service ➔ Repository)
 ├── Cryptographic HMAC Signed URL Generator
 ├── Razorpay Payment & Webhook Verification Engine
 └── Private Asset Storage Abstraction (Local / AWS S3)
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
 [ MySQL 8.0 Database ]    [ Private Asset Vault (Isolated) ]
```

### Key Technical Characteristics
- **No Direct PSD Exposure:** PSD files are never directly public or hotlinkable. Customers receive temporary, HMAC-SHA256 signed download tokens expiring in 60 minutes after payment verification.
- **Untrusted Frontend:** All prices and discounts are retrieved exclusively from the database during order creation.
- **Razorpay Dual Integration:** Supports standard checkout (UPI, Cards, NetBanking) and authentic "Scan & Pay" dynamic QR flows. Webhook callbacks are idempotent with HMAC-SHA256 signature verification.
- **Responsive Dark Theme:** Tailored for creative professionals with charcoal backgrounds, sleek crimson accents, and glassmorphic cards.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript 5
- **Styling:** Vanilla Tailwind CSS with custom dark palette
- **Icons:** Lucide React
- **Form & Validation:** React Hook Form + Zod
- **HTTP Client:** Axios with auto-bearer interceptors
- **Routing:** React Router v6

### Backend
- **Framework:** Spring Boot 3.3.4 (Java 21 LTS)
- **Security:** Spring Security 6 with JWT (JJWT 0.12.6)
- **Data & ORM:** Spring Data JPA + Hibernate 6
- **Database:** MySQL 8.0 (Production) / H2 (Development fallback)
- **Payment Gateway:** Razorpay Java SDK 1.4.6
- **Build System:** Apache Maven 3.9+

---

## 3. Directory Structure

```
├── backend/
│   ├── src/main/java/com/sharpshadow/marketplace/
│   │   ├── config/          # Security, Web, CORS, DataSeeder
│   │   ├── controller/      # Auth, Category, Product, Order, Payment, Download, Admin
│   │   ├── dto/             # Request/Response payloads, Api/Page wrappers
│   │   ├── entity/          # User, Category, Product, ProductImage, Order, Payment, etc.
│   │   ├── exception/       # Custom exceptions & GlobalExceptionHandler
│   │   ├── mapper/          # EntityDtoMapper
│   │   ├── payment/         # RazorpayService & Webhook handling
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT Utils, Filter, UserPrincipal, UserDetailsService
│   │   ├── service/         # Business logic layer
│   │   └── storage/         # LocalStorageService & S3 storage abstraction
│   ├── src/main/resources/
│   │   └── application.yml  # Dev (H2) and MySQL production profiles
│   ├── src/test/java/       # Comprehensive test suite (BackendTests.java)
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProductCard, SkeletonCard, QRPaymentModal, AdminLayout
│   │   ├── context/         # AuthContext, CartContext, ToastContext
│   │   ├── pages/           # Home, Browse, Categories, ProductDetail, Cart, Checkout, Account, etc.
│   │   │   └── admin/       # Dashboard, Products, Categories, Orders, Users, Coupons, Downloads
│   │   ├── services/        # API clients for Auth, Products, Orders, Payments, Admin
│   │   ├── types/           # Domain TypeScript definitions
│   │   ├── App.tsx          # Router configuration
│   │   └── main.tsx         # Root mount
│   ├── public/              # robots.txt, sitemap.xml, favicon.svg
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml       # MySQL, Backend, Frontend orchestration
├── .env.example             # Template environment variables
└── README.md
```

---

## 4. Getting Started Locally

### Prerequisites
- Java 21 LTS (`java -version`)
- Node.js 18+ and npm (`node -v`, `npm -v`)
- Apache Maven 3.9+ (`mvn -version`)
- MySQL 8.0 (Optional if using Docker or dev H2 profile)

### Step 1: Clone and Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 2: Running Backend
Open a terminal in `./backend`:
```bash
# On Windows PowerShell (always prefix with .\ in PowerShell):
.\mvn spring-boot:run

# Or using the Maven wrapper:
.\mvnw spring-boot:run

# Or run with MySQL profile
.\mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```
The backend launches on `http://localhost:8085`.
Default Seed Accounts initialized automatically:
- **Admin:** `admin@sharpshadow.com` / `Admin@123456`
- **Customer:** `customer@sharpshadow.com` / `Customer@123456`

### Step 3: Running Frontend
Open a terminal in `./frontend`:
```bash
npm install
npm run dev
```
The frontend will start at `http://localhost:3000`.

---

## 5. Docker Deployment

To launch the entire full-stack cluster (MySQL 8.0, Spring Boot Backend, Nginx Frontend) in one command:

```bash
docker compose up --build
```

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **MySQL Database:** localhost:3306

---

## 6. Payment Setup (Razorpay)

### Test Mode (Default)
In your `.env` or `application.yml`:
```env
RAZORPAY_KEY_ID=rzp_test_sharpshadow_key
RAZORPAY_KEY_SECRET=rzp_test_sharpshadow_secret
RAZORPAY_WEBHOOK_SECRET=whsec_sharpshadow_secret
```

### Switching to Live Mode
1. Login to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings ➔ API Keys**.
3. Generate **Live API Keys**.
4. Set environment variables on your production server:
   ```env
   RAZORPAY_KEY_ID=rzp_live_your_actual_key
   RAZORPAY_KEY_SECRET=your_live_actual_secret
   ```
5. Navigate to **Settings ➔ Webhooks** and add an endpoint:
   - **URL:** `https://yourdomain.com/api/payments/webhook`
   - **Secret:** Generate a secret string and set as `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events:**
     - `order.paid`
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`

---

## 7. Secure File Storage & Downloads

1. **Storage Isolation:** Raw PSD files uploaded by admins are placed in private directories (`/storage/private/{uuid}/random-file.psd`).
2. **Download Authorization Workflow:**
   - Client calls `GET /api/downloads/{productId}` with customer JWT.
   - Backend verifies that an order exists with status `PAID` for that user & product.
   - If not purchased, backend returns `HTTP 403 Forbidden`.
   - If authorized, backend generates a temporary HMAC SHA-256 token expiring in 60 minutes.
   - Download event is recorded in the `downloads` table with user, product, order, IP address, and timestamp.
   - Product `downloadCount` is incremented.

---

## 8. Verification & Testing

### Running Backend Unit & Integration Tests:

Inside `backend`:
```bash
# On Windows (PowerShell or CMD) using the included wrapper:
.\mvnw test
# Or using the convenience wrapper:
.\mvn test

# If using global mvn in an existing PowerShell terminal session, refresh your PATH first:
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
mvn test
```
The test suite validates:
- JWT Authentication & Registration
- Product Creation, Slug Generation, and Public URL Masking
- Coupon Minimum Order & Discount Math
- Database-backed Order Pricing
- Download Authorization (HTTP 403 enforcement)
- HMAC-SHA256 URL Signature generation & verification

### Running Frontend Production Build:
```bash
cd frontend
npm run build
```

---

## 9. Security Checklist

- [x] Passwords hashed using BCrypt.
- [x] Stateless JWT authentication with Bearer verification.
- [x] Method-level and path-level RBAC (`hasRole('ADMIN')`).
- [x] Sensitive gateway secrets (`RAZORPAY_KEY_SECRET`, `JWT_SECRET`) kept strictly on backend.
- [x] Prices calculated on backend from database records; frontend prices ignored.
- [x] HMAC-SHA256 signature verification on Razorpay callbacks.
- [x] Idempotent webhook handling to prevent duplicate order confirmations.
- [x] File path traversal protection on storage endpoints.
- [x] Database SQL injection prevention via JPA parameterized queries.
- [x] CORS whitelisting restricted to configured origins.

---

## 10. License & Copyright

All PSD layouts, branding, and assets within SharpShadow are engineered as original assets. Commercial rights allow buyer usage in personal and commercial client deliverables without redistribution of original layered source PSD files.
