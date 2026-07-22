# AgriFarm — Complete Deployment & Operations Guide

> **Version**: 2.0 · **Stack**: Android (Jetpack Compose) · Node.js/Express · React (Vite) · MySQL

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [How Configuration Works](#2-how-configuration-works)
3. [Quick Start (Developer — One Click)](#3-quick-start-developer--one-click)
4. [Manual Setup — Backend API](#4-manual-setup--backend-api)
5. [Manual Setup — Admin Dashboard](#5-manual-setup--admin-dashboard)
6. [Manual Setup — Android App](#6-manual-setup--android-app)
7. [Database Setup](#7-database-setup)
8. [Production Deployment (College Server)](#8-production-deployment-college-server)
9. [Default Credentials](#9-default-credentials)
10. [Troubleshooting](#10-troubleshooting)
11. [Security Checklist for Production](#11-security-checklist-for-production)

---

## 1. Architecture Overview

```
+---------------------------------------------------------------+
|                        AGRIFARM SYSTEM                        |
+---------------+-----------------+-----------------------------+
|  Android App  | Admin Dashboard |      Backend API            |
|  (Kotlin)     | (React + Vite)  |   (Node.js + Express)       |
|  Port: N/A    | Port: 5173      |   Port: 3000                |
|               |                 |                             |
|  Reads from:  |  Reads from:    |   Connects to:              |
|  local.props  |  admin-portal   |   MySQL (XAMPP port 3306)   |
|  -> BuildConf |  /.env          |   via backend-server/.env   |
+---------------+-----------------+-----------------------------+
```

**Key Principle**: All configuration (URLs, passwords, secrets) lives in `.env` files
and `local.properties` — NEVER hardcoded in source code.

---

## 2. How Configuration Works

### The Problem This Solves
Different environments (your laptop, college server) have different IPs and passwords.
Hardcoding them in code means the app breaks when deployed elsewhere.

### The Solution: Environment Files

| Component        | Config File               | What It Controls                    |
|:-----------------|:--------------------------|:------------------------------------|
| Backend          | backend-server/.env       | DB host/password, JWT secrets, port |
| Admin Dashboard  | admin-portal/.env         | Backend API URL                     |
| Android App      | local.properties          | Backend API URL (build-time)        |

### Template Files (Safe to Share/Commit to Git)
Each .env has a matching .env.example with NO real secrets — only structure and docs.
When a new team member joins:
  1. Copy .env.example -> .env
  2. Fill in their local values
  3. Never commit the .env file (it is in .gitignore)

---

## 3. Quick Start (Developer — One Click)

Prerequisites: XAMPP running (MySQL started), Node.js installed, Android Studio installed

### Step 1 — Run the launcher
```
Double-click:  RunProject.bat
```

This script automatically:
  - Detects your PC's Wi-Fi IP address
  - Updates local.properties with the correct IP
  - Creates .env files from templates if they don't exist
  - Installs npm dependencies
  - Starts the backend on port 3000
  - Starts the admin dashboard on port 5173
  - Opens the admin dashboard in your browser

### Step 2 — Rebuild Android app
- Open the project in Android Studio
- Click Build > Rebuild Project  (regenerates BuildConfig with the new IP)
- Click Run to install on your phone

Your phone and PC must be on the same Wi-Fi network.

---

## 4. Manual Setup — Backend API

### Prerequisites
- Node.js v18 or higher
- XAMPP with MySQL running
- MySQL database 'agrifarm' created (see Section 7)

### Step-by-Step

**1. Open a terminal in the backend folder**
```
cd backend-server
```

**2. Install dependencies**
```
npm install
```

**3. Create your environment file**
```
Windows:   copy .env.example .env
Mac/Linux: cp .env.example .env
```

**4. Edit .env with your settings**
```
PORT=3000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=          (leave blank for default XAMPP)
DB_NAME=agrifarm
JWT_ACCESS_SECRET=any_long_random_string_here
JWT_REFRESH_SECRET=another_long_random_string_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**5. Start the server**
```
node server.js
```

**6. Verify it's running**
Open browser: http://localhost:3000/health
You should see: {"status": "ok", "timestamp": "..."}

---

## 5. Manual Setup — Admin Dashboard

### Prerequisites
- Node.js v18 or higher
- Backend server must be running first

### Step-by-Step

**1. Open a terminal in the admin-portal folder**
```
cd admin-portal
```

**2. Install dependencies**
```
npm install
```

**3. Create your environment file**
```
Windows:   copy .env.example .env
Mac/Linux: cp .env.example .env
```

**4. Edit .env**
```
# For local development (backend on same machine):
VITE_API_BASE_URL=http://localhost:3000

# If backend is on a different machine:
# VITE_API_BASE_URL=http://192.168.1.16:3000
```

**5. Start the development server**
```
npm run dev
```

**6. Access the dashboard**
Open: http://localhost:5173

### Production Build
When deploying to a real web server:
```
npm run build
```
Output is in the dist/ folder. Copy that to your web server.

---

## 6. Manual Setup — Android App

The Android app reads the backend URL from local.properties, which is injected
as BuildConfig.BASE_URL at compile time.

Change ONE line in local.properties:
```
# For Android emulator on same PC:
BASE_URL=http://10.0.2.2:3000/api

# For physical device (phone on same Wi-Fi):
BASE_URL=http://YOUR_PC_IP:3000/api
```

### Find your PC's IP
Open Command Prompt and type: ipconfig
Look for IPv4 Address under Wi-Fi (e.g. 192.168.1.16).

### After changing local.properties
In Android Studio: Build > Rebuild Project

Note: local.properties is in .gitignore — it is machine-specific and must
never be committed to Git.

---

## 7. Database Setup

### Option A — Automated (Recommended)

Run from the backend-server folder:
```
node setup_db.js
```

This creates the database, all 15 tables, seed data, and hashed passwords.

### Option B — Manual via phpMyAdmin

1. Open http://localhost/phpmyadmin
2. Create a new database named 'agrifarm'
3. Import backend-server/schema.sql
4. Then run: node fix_passwords.js

### Default Seed Accounts

| Role       | Email                  | Password   |
|:-----------|:-----------------------|:-----------|
| Admin      | admin@agrifarm.com     | admin123   |
| Farmer     | farmer@agrifarm.com    | farmer123  |
| Shop Owner | seller@agrifarm.com    | seller123  |

Change all passwords immediately in any real deployment.

---

## 8. Production Deployment (College Server)

### Backend (Node.js API) on Linux Server

**Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash
sudo apt install -y nodejs
```

**Copy project and configure**
```bash
cd backend-server
cp .env.example .env
nano .env  # Fill in production values
```

Production .env values:
```
PORT=3000
NODE_ENV=production
DB_HOST=127.0.0.1
DB_USER=agrifarm_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=agrifarm
JWT_ACCESS_SECRET=64_CHAR_RANDOM_STRING
JWT_REFRESH_SECRET=64_CHAR_RANDOM_STRING
CORS_ORIGINS=https://admin.agrifarm.yourdomain.com
RATE_LIMIT_MAX=200
LOGIN_RATE_LIMIT_MAX=20
```

Generate random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Run with PM2 (keeps running after SSH disconnect)**
```bash
npm install -g pm2
npm install --production
pm2 start server.js --name "agrifarm-api"
pm2 save
pm2 startup
```

### Admin Dashboard on Production

**Build on your machine:**
```bash
cd admin-portal
echo VITE_API_BASE_URL=https://api.agrifarm.yourdomain.com > .env
npm run build
```

Copy the dist/ folder to your server's web directory (Apache htdocs or Nginx root).

### Android App for Production Release

Update local.properties:
```
BASE_URL=https://api.agrifarm.yourdomain.com/api
```

Build release APK:
```
.\gradlew assembleRelease
```

---

## 9. Default Credentials

| Service         | URL                              | Username            | Password |
|:----------------|:---------------------------------|:--------------------|:---------|
| Admin Dashboard | http://localhost:5173            | admin@agrifarm.com  | admin123 |
| phpMyAdmin      | http://localhost/phpmyadmin      | root                | (blank)  |
| Backend Health  | http://localhost:3000/health     | —                   | —        |

CHANGE ALL CREDENTIALS before sharing with anyone or deploying.

---

## 10. Troubleshooting

### Backend won't start
```
Error: Cannot connect to database
```
Check XAMPP MySQL is running. Verify DB_HOST, DB_USER, DB_PASSWORD in .env.

```
Error: JWT secret fallback not allowed in production
```
Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env file.

### Android app can't reach backend
- Verify phone and PC are on same Wi-Fi
- Check local.properties has the correct IP
- Test from phone browser: http://YOUR_IP:3000/health
- Allow port 3000 through Windows Firewall:
  Control Panel > Windows Defender Firewall > Advanced Settings
  > Inbound Rules > New Rule > Port > TCP 3000 > Allow

### Admin dashboard shows blank or 404
- Check backend is running first
- Check VITE_API_BASE_URL in admin-portal/.env
- Backend .env CORS_ORIGINS must include http://localhost:5173

### "Cannot find module" on backend startup
```
npm install
```

---

## 11. Security Checklist for Production

  [ ] Change all default passwords (admin, farmer, seller accounts)
  [ ] Set strong, unique JWT_ACCESS_SECRET and JWT_REFRESH_SECRET (64+ chars)
  [ ] Set NODE_ENV=production in backend .env
  [ ] Restrict CORS_ORIGINS to only your actual domain
  [ ] Tighten rate limits (RATE_LIMIT_MAX=200, LOGIN_RATE_LIMIT_MAX=20)
  [ ] Use HTTPS for both API and admin dashboard
  [ ] Remove seed/test accounts from the database
  [ ] Never commit .env files to Git
  [ ] Back up the database regularly

---

Generated for AgriFarm v2.0 — College Project
