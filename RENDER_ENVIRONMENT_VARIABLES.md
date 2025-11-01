# 🔧 Render Environment Variables Setup

## Required Environment Variables

You **MUST** add these environment variables in Render dashboard for your app to work:

---

### 1. ✅ `MONGO_URL` (REQUIRED)

**What it is:** Your MongoDB Atlas connection string

**Where to get it:**
1. Go to MongoDB Atlas dashboard
2. Click on your cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Add database name before `?` (e.g., `/billing-app?`)

**Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://myuser:mypassword123@cluster0.a1b2c3.mongodb.net/saravana-stores?retryWrites=true&w=majority
```

**How to add in Render:**
1. Go to Render Dashboard
2. Select your service
3. Click "Environment" tab
4. Click "Add Environment Variable"
5. Key: `MONGO_URL`
6. Value: Paste your connection string
7. Click "Save Changes"

**⚠️ Important:**
- Don't include quotes around the value
- If password has special characters, they may need URL encoding (e.g., `@` becomes `%40`)
- Make sure database name is included in the connection string

---

### 2. ⚙️ `PORT` (AUTO-SET)

**What it is:** Port number for the server

**Status:** ✅ Automatically set by Render (usually 10000)

**Action:** No action needed - Render sets this automatically

**Note:** Your code uses `process.env.PORT || 3000`, so it will work with Render's auto-set PORT

---

### 3. 🔧 `NODE_ENV` (OPTIONAL)

**What it is:** Environment indicator

**Value:** `production`

**Action:** Optional - can add for production environment detection

**How to add:**
- Key: `NODE_ENV`
- Value: `production`

---

## Quick Setup Steps

### Step 1: Get MongoDB Connection String

1. MongoDB Atlas → Your Cluster → Connect
2. Connect your application
3. Copy connection string
4. Replace `<password>` and add database name

### Step 2: Add to Render

1. Render Dashboard → Your Service → Environment
2. Add Environment Variable
3. Key: `MONGO_URL`
4. Value: Your connection string
5. Save

### Step 3: Verify

1. Check Render logs
2. Should see: `✅ MongoDB Connected: cluster0.xxxxx.mongodb.net`
3. If error, check connection string format

---

## Troubleshooting

### Error: "MONGO_URL environment variable is not set"

**Solution:**
- Make sure you added `MONGO_URL` (not `MONGODB_URI`)
- Check spelling is exactly `MONGO_URL`
- Save changes in Render dashboard
- Redeploy service

### Error: "MongoDB connection failed"

**Solutions:**
1. **Check connection string format:**
   - Must include database name: `/database-name?`
   - Must have correct username and password
   - Special characters in password need URL encoding

2. **Check MongoDB Atlas:**
   - Network Access → Allow `0.0.0.0/0`
   - Database Access → User has read/write permissions

3. **Test connection string:**
   - Try connecting from local machine first
   - Use same connection string in Render

---

## Summary

**Required:**
- ✅ `MONGO_URL` - Your MongoDB Atlas connection string

**Optional:**
- `NODE_ENV` - Set to `production`
- `PORT` - Auto-set by Render (no action needed)

**That's it!** Once `MONGO_URL` is set, your app will connect to MongoDB and work perfectly! 🚀


