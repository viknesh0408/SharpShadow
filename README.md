# SharpShadow — Digital PSD Marketplace

**SharpShadow** is a production-grade digital marketplace engineered for browsing, buying, and securely downloading high-resolution Adobe Photoshop (`.PSD`) templates, mockups, social graphics, and digital design assets.

---

## Table of Contents

1. [Architecture & System Design](#1-architecture--system-design)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Local Development Setup](#4-local-development-setup)
5. [Production Deployment Guide (Railway / Cloud)](#5-production-deployment-guide-railway--cloud)
6. [Razorpay Payment Gateway Setup](#6-razorpay-payment-gateway-setup)
7. [Digital Asset Storage & Download Security](#7-digital-asset-storage--download-security)
8. [Admin Panel Guide](#8-admin-panel-guide)
9. [Verification, Testing & Build](#9-verification-testing--build)
10. [Troubleshooting & Common Issues](#10-troubleshooting--common-issues)
11. [Security & Compliance](#11-security--compliance)

---

## 1. Architecture & System Design

### High-Level Architecture

```
[ Web Client: React 18 + Vite + Tailwind CSS ]
                      │  (HTTPS / REST APIs)
                      ▼
[ Spring Boot 3.3 Backend (Java 21 LTS) ]
 ├── Spring Security 6 + Stateless JWT Filter
 ├── Strict Bean Validation & Sanitized Exception Handling
 ├── Layered Architecture (Controller ➔ Service ➔ Repository)
 ├── HMAC-SHA256 Cryptographic Download Token Engine
 ├── Razorpay Payment & Webhook Verification (Server-to-Server)
 └── Private Asset Storage Vault (Local Persistent Volume / S3)
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
  [ MySQL 8.0 Database ]    [ Private Asset Vault (Isolated) ]
```

### Key Security & Design Principles

- **No Direct File Exposure:** PSD/ZIP/PDF asset files are stored outside the public document root in an isolated directory (`/storage/private/{uuid}/`). Direct hotlinking is impossible.
- **HMAC-SHA256 Signed Download Links:** Customers receive temporary, user-bound signed download tokens (valid for 60 minutes) only after an order is verified as `PAID`.
- **Database-Driven Pricing:** All product prices, discounts, and order subtotals are calculated on the server from database records. Frontend prices are never trusted.
- **Atomic Payment Reconciliation:** Webhook callbacks and client verification calls verify payment signatures, gateway payment status (`captured`), and compare paid amounts with order totals before unlocking downloads.
- **Stateless Authentication:** Secure JWT authentication using HMAC-SHA256 with 256-bit keys. Leaked or fallback default secrets are blocked on startup.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript 5
- **Styling:** Vanilla Tailwind CSS with custom dark palette
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form + Zod
- **HTTP Client:** Axios with auto-token injection and multipart handling
- **Routing:** React Router v6

### Backend
- **Framework:** Spring Boot 3.3.4 (Java 21 LTS)
- **Security:** Spring Security 6 with JJWT 0.12.6
- **Persistence:** Spring Data JPA + Hibernate 6
- **Database:** MySQL 8.0 (Production) / H2 (Development fallback)
- **Payment Gateway:** Razorpay Java SDK 1.4.6
- **Web Server:** Embedded Apache Tomcat with 500MB multipart streaming
- **Build System:** Apache Maven 3.9+

---

## 3. Project Structure

```
├── backend/
│   ├── src/main/java/com/sharpshadow/marketplace/
│   │   ├── config/          # SecurityConfig, WebConfig, DataSeeder
│   │   ├── controller/      # Auth, Product, Order, Payment, Download, Admin
│   │   ├── dto/             # Request & Response DTOs
│   │   ├── entity/          # JPA Entities (User, Product, Order, Payment, etc.)
│   │   ├── exception/       # GlobalExceptionHandler & custom exceptions
│   │   ├── mapper/          # EntityDtoMapper
│   │   ├── payment/         # RazorpayService & Webhook handling
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── security/        # JwtUtils, JwtAuthenticationFilter, UserPrincipal
│   │   ├── service/         # Business logic layer
│   │   └── storage/         # LocalStorageService & StorageService interface
│   ├── src/main/resources/
│   │   └── application.yml  # Multi-profile Spring configuration (dev & mysql)
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components, ProductCard, Navbar, Footer
│   │   ├── context/         # AuthContext, CartContext, ToastContext
│   │   ├── pages/           # Customer pages (Home, Browse, Detail, Cart, Checkout)
│   │   │   └── admin/       # Admin Dashboard, Products, Orders, Coupons, Users
│   │   ├── services/        # Axios API clients
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Client router
│   ├── nginx.conf           # Reverse proxy, caching, and 500M file upload config
│   ├── Dockerfile
│   └── package.json
│
├── .env.example             # Template environment variables
├── docker-compose.yml       # Full-stack local container orchestration
└── README.md
```

---

## 4. Local Development Setup

### Prerequisites
- **Java 21 LTS** (`java -version`)
- **Node.js 18+ & npm** (`node -v`, `npm -v`)
- **Maven 3.9+** (or use included `mvnw.cmd` / `./mvnw`)

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/viknesh0408/SharpShadow.git
cd SharpShadow
cp .env.example .env
```

### Step 2: Start the Backend (Zero-Config H2 Mode)
By default, the `dev` profile uses an embedded H2 database located at `./backend/storage/data/sharpshadowdb`.

```bash
cd backend

# On Windows PowerShell:
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev

# On Linux/macOS:
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
The backend starts at `http://localhost:8085`.
- **H2 Console:** `http://localhost:8085/h2-console` (JDBC URL: `jdbc:h2:file:./storage/data/sharpshadowdb`)

### Step 3: Start the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:3000`.

---

## 5. Production Deployment Guide (Railway / Cloud)

### Deployment Architecture
- **Backend Service:** Spring Boot application running on Railway / Docker.
- **Frontend Service:** Nginx reverse proxy serving the built Vite React SPA.
- **Database:** Railway MySQL 8.0 instance.

### Step 1: Configure Backend Environment Variables
In your Railway Backend service, set the following environment variables:

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `mysql` |
| `PORT` | Container internal port | `8085` |
| `DB_URL` | MySQL JDBC connection string | `jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DB_USERNAME` | MySQL username | `${MYSQLUSER}` |
| `DB_PASSWORD` | MySQL password | `${MYSQLPASSWORD}` |
| `JWT_SECRET` | 256-bit secure secret key | `64-character-random-hex-string` |
| `DOWNLOAD_SIGNING_SECRET` | Secret for signed asset download links | `64-character-random-hex-string` |
| `ADMIN_EMAIL` | Admin login account email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Admin initial secure password | `YourSecurePassword#2026` |
| `ADMIN_NAME` | Display name for administrator | `SharpShadow Administrator` |
| `RAZORPAY_KEY_ID` | Razorpay Live API Key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Live API Secret Key | *(From Razorpay Dashboard)* |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Secret | *(From Razorpay Dashboard)* |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://sharpshadow.up.railway.app,https://yourdomain.com` |

### Step 2: Attach Persistent Storage Volume (Crucial)
Containers on Railway reset their local filesystem on each new deployment. To ensure your uploaded PSD assets and thumbnails are **permanently saved**:
1. In your **Railway Dashboard**, click your **Backend** service.
2. Go to **Settings** -> Scroll to **Volumes** -> Click **+ Add Volume**.
3. Set the **Mount Path** to:
   ```text
   /app/storage
   ```
4. Click **Save**.

### Step 3: Configure Frontend Environment Variables
In your Railway Frontend service, set:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | URL to backend API | `https://backend-production-3d6a.up.railway.app/api` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay Key ID | `rzp_live_...` |

---

## 6. Razorpay Payment Gateway Setup

### Test Mode vs. Live Mode
SharpShadow uses the official Razorpay Checkout SDK. It natively supports **UPI (Google Pay, PhonePe, Paytm, QR Scan)**, **Credit/Debit Cards**, and **NetBanking**.

### Setting Up Live Payments
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Toggle the switch at the top from **Test Mode** to **Live Mode**.
3. Navigate to **Account & Settings ➔ API Keys** -> Click **Generate Key**.
   - Copy the **Key ID** (`rzp_live_...`) to `RAZORPAY_KEY_ID`.
   - Copy the **Key Secret** to `RAZORPAY_KEY_SECRET`.
4. Navigate to **Account & Settings ➔ Webhooks** -> Click **Add New Webhook**:
   - **Webhook URL:** `https://your-backend-domain.com/api/payments/webhook`
   - **Secret:** Enter a strong random secret and save it as `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events:**
     - `order.paid`
     - `payment.captured`
     - `payment.failed`
   - Click **Create Webhook**.

---

## 7. Digital Asset Storage & Download Security

### How File Storage Works
- **Public Previews (`/storage/uploads/`):** Thumbnails and gallery images uploaded in the admin panel are saved with UUID filenames and served through the `/uploads/` route.
- **Private Digital Assets (`/storage/private/`):** Full PSD, ZIP, and PDF templates are saved inside isolated, non-public directories.

### Secure Download Token Lifecycle
1. The customer pays for an order through Razorpay.
2. The payment signature and amount are verified server-to-server. The order status updates to `PAID`.
3. When the customer visits **My Downloads** (`/account?tab=downloads`) and clicks **Download File**:
   - The frontend calls `GET /api/downloads/{productId}` with the user's Bearer token.
   - The backend confirms the user owns a `PAID` order for this product.
   - The backend constructs an HMAC-SHA256 signature containing:
     ```text
     payload = relativePath + ":" + userId + ":" + expiresAtEpoch
     ```
   - Returns a secure temporary URL: `/api/downloads/file?file=...&uid=...&expires=...&filename=...&sig=...`.
4. The browser triggers the download directly via standard navigation. The download endpoint validates:
   - Expiration timestamp has not elapsed.
   - Signature matches the secret and user ID.
   - Path traversal (`..`) attempts are blocked.
5. The backend streams the file to the browser with `Content-Disposition: attachment`.

---

## 8. Admin Panel Guide

Access the admin dashboard at `/admin` (or `/login` with an administrator account).

### Admin Features
- **Dashboard (`/admin`):** Real-time metrics including total revenue, paid order count, registered customers, total downloads, 7-day sales breakdown, and popular products.
- **Product Management (`/admin/products`):**
  - Create, update, or archive products.
  - Upload private PSD/ZIP templates (up to 500MB).
  - Upload primary thumbnail images and preview gallery images.
  - Set regular price, discount price, dimensions, resolution (DPI), color mode (CMYK/RGB), and Photoshop version.
  - Publish or draft status toggle.
- **Categories (`/admin/categories`):** Create and organize template categories (e.g. Flyers, Mockups, Social Media, Posters).
- **Orders (`/admin/orders`):** Inspect all customer transactions, order numbers, payment IDs, and fulfillment statuses.
- **Discount Coupons (`/admin/coupons`):**
  - Create percentage-off or flat-discount promo codes.
  - Set minimum order values and maximum total usage limits.
  - Track active usage counts.
- **Downloads Audit Vault (`/admin/downloads`):** Full audit trail of which customer downloaded which product, including IP address and timestamp.

---

## 9. Verification, Testing & Build

### Running Backend Tests
```bash
cd backend
.\mvnw.cmd test
```
The test suite validates:
- Stateless JWT authentication and authorization.
- Product creation, slugification, and status filtering.
- Coupon usage validation and discount mathematical correctness.
- Order calculation from server-side database prices.
- Payment verification logic and webhook signature checking.
- Unauthorized download denial (HTTP 403 Forbidden).

### Running Frontend Build
```bash
cd frontend
npm run build
```
Generates production-optimized static assets in `frontend/dist/`.

---

## 10. Troubleshooting & Common Issues

### 1. Upload Fails with "File too large" or Error 413
- **Cause:** Nginx or Tomcat rejected a file exceeding the upload limit.
- **Resolution:** SharpShadow is configured for uploads up to **500MB**. Ensure `client_max_body_size 500M;` is active in `frontend/nginx.conf` and `spring.servlet.multipart.max-file-size: 500MB` in `application.yml`.

### 2. Uploaded Thumbnail Appears Broken (404)
- **Cause:** Nginx static regex rule intercepted `/uploads/` requests before proxying to the backend.
- **Resolution:** Ensure `frontend/nginx.conf` contains the `^~` modifier on `location ^~ /uploads/` so prefix proxying takes precedence over static regex matching.

### 3. Browser Download Returns 401 Unauthorized
- **Cause:** Browser `window.location.href` navigation does not send an `Authorization: Bearer` header.
- **Resolution:** `/api/downloads/file` is configured as `permitAll()` in `SecurityConfig.java` because its security is cryptographically enforced by the time-limited HMAC-SHA256 signature and user ID binding.

### 4. Uploaded Files Disappear After Redeployment
- **Cause:** Railway container redeployments recreate the container filesystem.
- **Resolution:** Attach a persistent volume mounted to `/app/storage` in your Railway Backend service settings.

---

## 11. Security & Compliance

- **Password Hashing:** Passwords encrypted using industry-standard BCrypt (work factor 10).
- **RBAC:** Endpoints strictly segregated with `@PreAuthorize("hasRole('ADMIN')")` and Spring Security filters.
- **No Leaked Secrets:** Application validates secrets on startup and halts execution if placeholder or default leaked keys are detected.
- **IDOR Protection:** Payment verification and order detail endpoints enforce that the caller owns the targeted order.
- **Frame Protection:** Configured with `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`.
- **SQL Injection Prevention:** 100% parameterized queries via Spring Data JPA and Hibernate.

---

## 12. License & Rights

Commercial rights allow buyers to use downloaded PSD templates for personal and commercial client deliverables. Direct redistribution, resale, or sublicensing of original layered source PSD files is strictly prohibited.
