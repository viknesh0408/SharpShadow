# SharpShadow — Digital PSD Marketplace

**SharpShadow** is a production-grade digital marketplace engineered for browsing, buying, and securely downloading high-resolution Adobe Photoshop (`.PSD`) templates, mockups, social graphics, and digital design assets.

---

## Table of Contents

1. [Architecture & System Design](#1-architecture--system-design)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Local Development Setup](#4-local-development-setup)
5. [Step-by-Step Production Launch & Transition Guide](#5-step-by-step-production-launch--transition-guide)
6. [Digital Asset Storage & Download Security](#6-digital-asset-storage--download-security)
7. [Admin Panel Guide](#7-admin-panel-guide)
8. [Verification, Testing & Build](#8-verification-testing--build)
9. [Troubleshooting & Common Issues](#9-troubleshooting--common-issues)
10. [Security & Compliance](#10-security--compliance)
11. [License & Rights](#11-license--rights)

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

## 5. Step-by-Step Production Launch & Transition Guide

Follow these 7 sequential steps to take Project SharpShadow from local development/testing to a fully secured, live production environment.

---

### Step 1: Switch Razorpay from Test to Live Mode

In your [Razorpay Dashboard](https://dashboard.razorpay.com/):
1. **Toggle Live Mode:** In the top bar of the dashboard, switch from **Test Mode** to **Live Mode** (ensure your business KYC is verified).
2. **Generate Live API Keys:**
   - Navigate to **Account & Settings ➔ API Keys**.
   - Click **Generate Live Key**.
   - Securely store your **Key ID** (`rzp_live_...`) and **Key Secret**.
3. **Configure Live Webhook Endpoint:**
   - Navigate to **Account & Settings ➔ Webhooks**.
   - Click **Add New Webhook**.
   - **Webhook URL:** `https://<YOUR-BACKEND-DOMAIN>/api/payments/webhook`  
     *(Example: `https://backend-production-3d6a.up.railway.app/api/payments/webhook` or your custom domain)*
   - **Secret:** Enter a strong, random string (e.g. 32-character secret). You will set this as `RAZORPAY_WEBHOOK_SECRET` on your backend.
   - **Active Events:** Check the following events:
     - `order.paid` (verifies payment and unlocks customer downloads)
     - `payment.captured`
     - `payment.failed`
   - Click **Create Webhook**.

---

### Step 2: Configure Production Environment Variables in Railway

#### A. Backend Service Variables
Go to **Railway Dashboard ➔ Backend service ➔ Variables** tab, and configure:

```env
# 1. Environment & Server Profile
SPRING_PROFILES_ACTIVE=mysql
PORT=8085

# 2. Production Database (Railway MySQL automatically provisions these)
DB_URL=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}

# 3. Security Secrets (Generate two separate unique 64-character random hex strings)
JWT_SECRET=b7e1f4a9c8d3e2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7
DOWNLOAD_SIGNING_SECRET=c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b7e1f4a9c8d3e2a1b0c9d8e7f6a5b4

# 4. Administrator Account (Initialized automatically on empty database)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=CreateAStrongComplexPassword2026!
ADMIN_NAME=SharpShadow Administrator

# 5. Live Razorpay Credentials
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YourLiveRazorpaySecret
RAZORPAY_WEBHOOK_SECRET=YourLiveWebhookSecret

# 6. Transactional Email Service (Brevo HTTPS API - Works on Railway Free/Hobby tiers)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx
MAIL_USERNAME=your-brevo-email@gmail.com
FRONTEND_URL=https://sharpshadow.up.railway.app

# 7. Allowed CORS Origins (Whitelists your frontend domains)
CORS_ALLOWED_ORIGINS=https://sharpshadow.up.railway.app,https://yourdomain.com,https://www.yourdomain.com
```

#### B. Frontend Service Variables
Go to **Railway Dashboard ➔ Frontend service ➔ Variables** tab, and configure:

```env
# URL to your production backend API
VITE_API_URL=https://backend-production-3d6a.up.railway.app/api

# Public Razorpay Live Key ID
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
```

---

### Step 3: Attach Persistent Storage Volume in Railway (Crucial)

> [!IMPORTANT]
> Docker container filesystems in cloud environments like Railway reset on each redeployment. Without a volume, uploaded PSD files and thumbnails will be lost when new code is pushed.

To permanently retain all uploaded files:
1. In your **Railway Dashboard**, click on the **Backend** service.
2. Go to **Settings** (or **Data**) ➔ Scroll down to the **Volumes** section.
3. Click **+ Add Volume**.
4. Set the **Mount Path** to:
   ```text
   /app/storage
   ```
5. Click **Add Volume**.
6. Railway will attach a persistent disk at `/app/storage`. Thumbnails (`/app/storage/uploads`) and private PSDs (`/app/storage/private`) will now persist indefinitely across all future redeploys.

---

### Step 4: Configure Production Transactional Email Service (Brevo API)

> [!IMPORTANT]
> **Railway officially blocks outbound SMTP ports (25, 465, and 587)** on Free, Trial, and Hobby plans to prevent spam abuse. Attempting to use raw SMTP (e.g. `smtp.gmail.com:587`) will result in a connection timeout (`Operation timed out`). SharpShadow solves this by integrating with **Brevo's transactional HTTPS API (Port 443)**, which is completely unblocked and provides **300 free emails per day** with zero custom domain DNS verification needed.

Follow these 3 quick steps to set up transactional email delivery:

1. **Sign Up on Brevo (Free):**
   - Visit **[brevo.com](https://brevo.com)** and create a free account with your email (e.g. `your-email@gmail.com`).
   - Confirm your email address.

2. **Generate an API Key:**
   - In your Brevo dashboard, click your profile name (top-right corner) ➔ **SMTP & API** (or navigate to `https://app.brevo.com/settings/keys/api`).
   - Click **Generate a new API key**.
   - Enter a name (e.g., `sharpshadow-production`) and click **Generate**.
   - Copy the generated API key (it begins with `xkeysib-...`).

3. **Add Variables in Railway:**
   - Go to **Railway Dashboard ➔ Backend service ➔ Variables** tab.
   - Add the following environment variables:
     - `BREVO_API_KEY`: `<paste your xkeysib-... API key>`
     - `MAIL_USERNAME`: `your-brevo-email@gmail.com` *(must match the email you registered on Brevo)*
     - `FRONTEND_URL`: `https://sharpshadow.up.railway.app` *(or your custom frontend domain)*
   - Railway will automatically redeploy the backend in ~30 seconds.

*Note: Whenever a customer or admin requests a password reset, the backend also logs the full single-use reset URL directly into the Railway backend logs as an immediate fail-safe.*

#### Email Verification & OTP Security Architecture
- **Registration Protection:** When any new user signs up, the backend generates a cryptographically secure 6-digit OTP code and dispatches it via Brevo to the owner's inbox.
- **Account Lockout Prevention:** An account is only activated once the 6-digit OTP is verified. If an attacker attempts to register someone else's email address, the account cannot be logged into or activated.
- **Re-attempt Tolerance:** If an unverified signup exists and the real owner attempts to sign up, the backend automatically refreshes credentials and sends a new OTP code to the actual inbox rather than permanently blocking the email.
- **15-Minute Expiry & 60-Second Cooldown:** Each verification code expires in 15 minutes, with a 60-second cooldown between resend requests to prevent spam.
- **Fail-Safe Server Logs:** Both registration OTP codes and password reset links are printed directly to the backend stdout logs (`🔐 [EMAIL VERIFICATION OTP GENERATED]`) for zero-friction local development and server troubleshooting.

---

### Step 5: Connect Custom Domain & Configure DNS / SSL (Optional)

To link your branded domain (e.g. `sharpshadow.com`):
1. **Frontend Domain:**
   - In Railway, click **Frontend ➔ Settings ➔ Networking ➔ Custom Domain**.
   - Enter your domain (e.g. `yourdomain.com` or `www.yourdomain.com`).
   - Copy the provided DNS CNAME target (e.g. `yourdomain.com.cname.railway.app`).
   - In your domain DNS manager (GoDaddy, Namecheap, Cloudflare), add a CNAME record pointing to that target.
   - Railway will automatically provision and renew a free Let's Encrypt SSL certificate.
2. **Backend Domain (Optional):**
   - Click **Backend ➔ Settings ➔ Networking ➔ Custom Domain** (e.g. `api.yourdomain.com`).
   - Add the CNAME record in your DNS manager.
   - Update `VITE_API_URL` on the frontend and `CORS_ALLOWED_ORIGINS` on the backend accordingly.

---

### Step 6: Admin Panel Initial Setup & Catalog Preparation

1. **Log In to Admin:**
   - Navigate to `https://<YOUR-FRONTEND-DOMAIN>/login`.
   - Log in using your production `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
2. **Clean Up Test Items:**
   - Go to **Admin ➔ Products** (`/admin/products`).
   - Delete any test products created during development (e.g. `ftghfghfghfghfgh`).
3. **Upload Real Digital Assets:**
   - Click **Add Product**.
   - Fill in asset details: Title, Category, Description, Dimensions, DPI, Color Mode.
   - Set standard Price and optional Discount Price.
   - Upload the private digital asset (Layered PSD or ZIP file, up to 500MB).
   - Upload primary thumbnail and preview gallery images.
   - Set status to **PUBLISHED**.
4. **Create Promotional Coupons (Optional):**
   - Go to **Admin ➔ Coupons** (`/admin/coupons`).
   - Create launch promo codes (e.g. `LAUNCH20` for 20% off with usage limits).

---

### Step 7: End-to-End Live Transaction & Password Reset Smoke Test

Before announcing your store to public customers, conduct two quick smoke tests:

#### A. Password Reset Smoke Test
1. Go to `https://<YOUR-FRONTEND-DOMAIN>/forgot-password`.
2. Enter your email and click **Send Reset Link**.
3. Verify that the email is delivered to your inbox (or check Railway backend logs for the `🔑 [PASSWORD RESET LINK GENERATED]` entry).
4. Click the link, enter a new password, and verify you can log in with the new credentials.

#### B. ₹1 Live Transaction Smoke Test
1. **Create a ₹1 Test Product:**
   - In the admin panel, create a temporary product priced at **₹1.00** and set it to **PUBLISHED**.
2. **Perform Checkout as a Customer:**
   - Open a fresh browser session (or Incognito window).
   - Register a real customer account at `/register`.
   - Add the ₹1 product to the cart and proceed to checkout.
   - Select **Razorpay Secure Checkout** and pay ₹1 via real UPI (Google Pay / PhonePe) or card.
3. **Verify the Purchase Flow:**
   - [x] Confetti animation fires and redirects to **My Downloads** (`/account?tab=downloads`).
   - [x] The order appears in the user's order history with status `PAID`.
   - [x] Clicking **Download File** immediately streams the complete PSD/ZIP file with zero 401/403 errors.
   - [x] The admin dashboard (`/admin`) updates total revenue, paid order count, and download audit logs.
4. **Delete the Test Product:**
   - Archive or delete the ₹1 product in the admin catalog.

---

## 6. Digital Asset Storage & Download Security

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

## 7. Admin Panel Guide

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

## 8. Verification, Testing & Build

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

## 9. Troubleshooting & Common Issues

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

### 5. Password Reset Email Hangs or Times Out on Railway
- **Cause:** Railway blocks outbound SMTP ports 25, 465, and 587 on Free and Hobby plans to prevent spam, causing standard SMTP/Gmail connections to time out (`Operation timed out`).
- **Resolution:** SharpShadow includes built-in support for Brevo's transactional HTTPS API (Port 443, which is never blocked). Follow **Step 4** in the Production Launch Guide above to configure `BREVO_API_KEY` and `MAIL_USERNAME` in your Railway Backend variables. In the meantime, the single-use password reset URL is always printed directly into your Railway backend logs for immediate testing.

---

## 10. Security & Compliance

- **Password Hashing:** Passwords encrypted using industry-standard BCrypt (work factor 10).
- **RBAC:** Endpoints strictly segregated with `@PreAuthorize("hasRole('ADMIN')")` and Spring Security filters.
- **No Leaked Secrets:** Application validates secrets on startup and halts execution if placeholder or default leaked keys are detected.
- **IDOR Protection:** Payment verification and order detail endpoints enforce that the caller owns the targeted order.
- **Frame Protection:** Configured with `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`.
- **SQL Injection Prevention:** 100% parameterized queries via Spring Data JPA and Hibernate.

---

## 11. License & Rights

Commercial rights allow buyers to use downloaded PSD templates for personal and commercial client deliverables. Direct redistribution, resale, or sublicensing of original layered source PSD files is strictly prohibited.
