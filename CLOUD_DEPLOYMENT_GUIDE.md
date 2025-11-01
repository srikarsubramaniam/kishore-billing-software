# 🚀 Free Cloud Hosting Setup Guide

## ⚙️ Overview

This guide will help you deploy Saravana Stores Billing Software to **Render.com** (free hosting) with **MongoDB Atlas** (free cloud database).

### Components:

| Component              | Service          | Cost                |
| ---------------------- | ---------------- | ------------------- |
| **Backend (Node.js)**  | Render.com       | ✅ **FREE**         |
| **Database (MongoDB)** | MongoDB Atlas    | ✅ **FREE** (512MB) |
| **Frontend (Website)** | Served by Render | ✅ **FREE**         |

---

## 📋 Prerequisites

1. **GitHub Account** (free) - [Sign up here](https://github.com)
2. **MongoDB Atlas Account** (free) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
3. **Render.com Account** (free) - [Sign up here](https://render.com)

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Free Cloud Database)

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Click **"Try Free"** or **"Sign Up"**
3. Fill in your details and verify email
4. Log in to MongoDB Atlas

### 1.2 Create a Free Cluster

1. After logging in, you'll see **"Create a Deployment"**
2. Select **"M0 FREE"** (Free tier)
3. Choose a **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Select a **Region** (choose closest to you)
5. Click **"Create Deployment"**
6. Wait 1-3 minutes for cluster to be created

### 1.3 Create Database User

1. In the **"Security Quickstart"** section:

   - Choose **"Username and Password"**
   - Enter a username (e.g., `saravana-user`)
   - Click **"Autogenerate Secure Password"** or create your own
   - **⚠️ SAVE THIS PASSWORD!** You'll need it later
   - Click **"Create Database User"**

2. In **"Where would you like to connect from?"**:
   - Select **"My Local Environment"** (we'll change this later)
   - Click **"Add My Current IP Address"**
   - Click **"Finish and Close"**

### 1.4 Get Connection String

1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Select **Driver: Node.js** and **Version: 5.5 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace** `<username>` with your database username
6. **Replace** `<password>` with your database password
7. **Add database name** before `?`:
   ```
   mongodb+srv://saravana-user:yourpassword@cluster0.xxxxx.mongodb.net/saravana-stores?retryWrites=true&w=majority
   ```
8. **✅ Save this connection string** - you'll use it in Step 3

### 1.5 Allow Network Access (Important!)

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Render.com)
4. Enter: `0.0.0.0/0`
5. Click **"Confirm"**

---

## 📦 Step 2: Prepare Your Code for Cloud Deployment

### 2.1 Update package.json Script

Make sure your `package.json` has the cloud server as the start script:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

**Note:** If you're using the cloud version, `server.js` should use MongoDB. The local version is `server.local.js`.

### 2.2 Switch to Cloud Server

**Option A: Replace server.js (Recommended)**

1. Backup your current `server.js`:

   ```bash
   # Your original server.js is already saved as server.local.js
   ```

2. Rename the cloud server:
   ```bash
   # server.cloud.js should be renamed to server.js
   # OR just copy server.cloud.js to server.js
   ```

**Option B: Update package.json to use server.cloud.js**

```json
{
  "scripts": {
    "start": "node server.cloud.js"
  }
}
```

### 2.3 Install Dependencies Locally First

```bash
npm install
```

This installs:

- `mongoose` (MongoDB driver)
- `dotenv` (for environment variables)

---

## 🔄 Step 3: Set Up GitHub Repository

### 3.1 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `saravana-stores-billing`)
3. Make it **Public** or **Private** (both work)
4. Click **"Create repository"**

### 3.2 Upload Your Code

**Option A: Using Git (Command Line)**

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Cloud deployment ready"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push code
git branch -M main
git push -u origin main
```

**Option B: Using GitHub Desktop**

1. Download [GitHub Desktop](https://desktop.github.com)
2. File → Add Local Repository
3. Select your project folder
4. Click "Publish repository"

---

## ☁️ Step 4: Deploy to Render.com

### 4.1 Create Render Account

1. Go to [Render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (easiest method)
4. Authorize Render to access your GitHub

### 4.2 Create New Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Select the repository you just created
   - Click **"Connect"**

### 4.3 Configure Deployment

Fill in the form:

- **Name:** `saravana-stores` (or any name you like)
- **Region:** Choose closest to you
- **Branch:** `main` (or `master`)
- **Root Directory:** Leave empty (or `.` if needed)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Select **"Free"**

### 4.4 Add Environment Variables

Click **"Advanced"** or scroll down to **"Environment Variables"**:

1. Click **"Add Environment Variable"**
2. Add:
   - **Key:** `MONGODB_URI`
   - **Value:** Paste your MongoDB connection string from Step 1.4
3. Click **"Add Environment Variable"**
4. Add (optional):
   - **Key:** `NODE_ENV`
   - **Value:** `production`
5. Click **"Create Web Service"**

### 4.5 Wait for Deployment

- Render will automatically:
  1. Clone your code
  2. Run `npm install`
  3. Start your server with `npm start`
- **First deployment takes 5-10 minutes**
- You'll see logs in real-time
- Wait for ✅ **"Live"** status

### 4.6 Get Your Live URL

Once deployed, you'll see:

- ✅ **Status: Live**
- 🌐 **URL:** `https://your-app-name.onrender.com`

**This is your live website! 🎉**

---

## 🔄 Step 5: Migrate Existing Data (If Any)

### 5.1 Run Migration Script Locally

If you have existing data in JSON files:

1. Create `.env` file in your project root:

   ```
   MONGODB_URI=your_mongodb_connection_string_here
   ```

2. Run migration:

   ```bash
   node migrate-to-mongodb.js
   ```

3. This will copy all data from `data/inventory.json` and `data/bills.json` to MongoDB

---

## ✅ Step 6: Test Your Deployment

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. Test features:
   - ✅ Create inventory items
   - ✅ Generate bills
   - ✅ View reports
   - ✅ Download CSV reports

---

## 🔧 Troubleshooting

### Issue: "MongoDB connection failed"

**Solution:**

1. Check your connection string has correct username/password
2. Ensure IP `0.0.0.0/0` is whitelisted in MongoDB Atlas Network Access
3. Verify database name in connection string

### Issue: "Build failed" on Render

**Solution:**

1. Check `package.json` has all dependencies
2. Verify `start` script points to correct file
3. Check Render logs for specific error

### Issue: "App crashes after deployment"

**Solution:**

1. Check Render logs
2. Verify `MONGODB_URI` environment variable is set
3. Test MongoDB connection string locally

### Issue: "Database is empty"

**Solution:**

1. Run migration script: `node migrate-to-mongodb.js`
2. Or use `/api/inventory/initialize` endpoint to add sample data

---

## 📝 Important Notes

### Free Tier Limitations:

1. **Render.com Free Tier:**

   - ⚠️ Server **sleeps after 15 minutes** of inactivity
   - First request after sleep takes ~30 seconds (cold start)
   - 750 hours/month free (enough for 24/7 if not sleeping)

2. **MongoDB Atlas Free Tier:**
   - ✅ 512MB storage (plenty for small business)
   - ✅ Shared cluster (slower but free)
   - ✅ Automatic backups

### Upgrade Options (Paid):

- **Render:** $7/month for always-on server
- **MongoDB Atlas:** $9/month for better performance

---

## 🎯 Quick Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created free cluster
- [ ] Got connection string
- [ ] Allowed network access (0.0.0.0/0)
- [ ] Updated code for MongoDB
- [ ] Pushed code to GitHub
- [ ] Created Render account
- [ ] Deployed to Render
- [ ] Added MONGODB_URI environment variable
- [ ] Tested live website
- [ ] Migrated existing data (if any)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Render logs (in Render dashboard)
2. Check MongoDB Atlas connection status
3. Verify environment variables are set correctly
4. Test locally first with `.env` file

---

## 🎉 Success!

Once deployed, your billing software will be:

- ✅ Accessible from anywhere
- ✅ Always backed up (MongoDB)
- ✅ Free to host
- ✅ Scalable for growth

**Your live URL:** `https://your-app-name.onrender.com`

Enjoy your cloud-hosted billing software! 🚀

