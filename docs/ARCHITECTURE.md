# AgriFarm Enterprise System Architecture

```mermaid
graph TD
    User[Mobile / Web Users]
    
    subgraph Clients
        Android[Android Native App - Kotlin / Jetpack Compose]
        AdminWeb[Admin Portal - React / Vite]
    end

    subgraph Backend Services
        API[Node.js Express API Server]
        Auth[JWT & RBAC Middleware]
        RateLimit[Rate Limiter Middleware]
    end

    subgraph Database Layer
        MariaDB[(MariaDB / MySQL Database)]
    end

    subgraph Automation & QA
        Appium[Appium Mobile Tests]
        Selenium[Selenium Web Tests]
        Jest[Jest & Supertest API Tests]
    end

    User --> Android
    User --> AdminWeb

    Android -->|HTTPS / REST API| RateLimit
    AdminWeb -->|HTTPS / REST API| RateLimit

    RateLimit --> Auth
    Auth --> API
    API --> MariaDB

    Appium --> Android
    Selenium --> AdminWeb
    Jest --> API
```

## System Components

1. **Android Native App (`/app`)**:
   - Built with **Kotlin** and **Jetpack Compose**
   - Implements farmer search, crop scanner, MANDI price index, shopping cart, and order tracking
   - Communicates with Node.js Express backend API

2. **Admin Portal (`/admin-portal`)**:
   - Built with **React** + **Vite** + **Tailwind CSS**
   - Provides administrative controls: user management, shop approval, product moderation, order auditing, and system logs

3. **Backend API (`/backend-server`)**:
   - **Node.js** + **Express** server
   - Authentication via **JWT tokens** with refresh token blacklisting & RBAC
   - Input validation, security headers (Helmet), CORS controls, rate limiting, and central error handling

4. **Database (`/database`)**:
   - **MariaDB / MySQL** relational schema
   - Normalized tables with foreign key constraints, indexing on lookup fields, and soft deletes (`deleted_at`)

5. **QA & Automated Testing (`/appium-test`, `/admin-portal/selenium-tests`, `/backend-server/backend-tests`)**:
   - **Appium**: Mobile UI automation testing across device flows
   - **Selenium**: Web UI testing for admin portal dashboard workflows
   - **Jest + Supertest**: End-to-end API integration & unit test suite
