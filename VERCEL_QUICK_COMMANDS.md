# ⚡ Quick Command Reference - Vercel Deployment

## 🚀 Fast Track Commands (Copy & Paste)

### Step 1: Initialize Git (if not done)

```powershell
cd C:\Users\91968\Downloads\kishore_billing_software
git init
git add .
git commit -m "Initial commit - Ready for Vercel deployment"
```

### Step 2: Create .gitignore

Create a file named `.gitignore` with:

```
node_modules/
.env
.DS_Store
*.log
```

### Step 3: Connect to GitHub

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kishore-billing-software.git
git push -u origin main
```

_(Replace `YOUR_USERNAME` with your GitHub username)_

### Step 4: Update Code Later

```powershell
git add .
git commit -m "Your update description"
git push origin main
```

---

## 🔑 Environment Variables in Vercel

**Variable Name**: `MONGODB_URI`  
**Value**: Your MongoDB Atlas connection string  
**Format**: `mongodb+srv://username:password@cluster.mongodb.net/kishore_billing?retryWrites=true&w=majority`

---

## 🌐 Your URLs After Deployment

- Main App: `https://kishore-billing-software.vercel.app`
- API Test: `https://kishore-billing-software.vercel.app/api/inventory`

---

## 📝 MongoDB Atlas Connection String Format

```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kishore_billing?retryWrites=true&w=majority
```

Replace:

- `YOUR_USERNAME` → Your MongoDB username
- `YOUR_PASSWORD` → Your MongoDB password (no brackets!)
- `cluster0.xxxxx` → Your actual cluster address

---

## ✅ Checklist

1. MongoDB Atlas cluster ✓
2. Database user created ✓
3. Network access: `0.0.0.0/0` ✓
4. Connection string copied ✓
5. Git initialized ✓
6. Code pushed to GitHub ✓
7. Vercel project created ✓
8. Environment variable added ✓
9. Deployed! ✓

---

For detailed steps, see `VERCEL_DEPLOYMENT_GUIDE.md`
