# ✅ Cloud Setup Checklist

Use this checklist to track your progress.

## Phase 1: MongoDB Atlas Setup

- [ ] Created MongoDB Atlas account
- [ ] Created free M0 cluster
- [ ] Created database user (username: ___________, password saved: ✅)
- [ ] Got connection string
- [ ] Formatted connection string correctly (with database name)
- [ ] Allowed network access (0.0.0.0/0)
- [ ] Tested connection string works

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority
```

---

## Phase 2: Local Environment Setup

- [ ] Created `.env` file in project root
- [ ] Added `MONGODB_URI=your_connection_string` to `.env`
- [ ] Added `PORT=3000` to `.env`
- [ ] Ran `npm install` successfully
- [ ] Tested `npm start` - MongoDB connects ✅
- [ ] Server runs on http://localhost:3000

**Check:** Console shows "✅ MongoDB connected successfully"

---

## Phase 3: GitHub Setup

- [ ] Created GitHub account
- [ ] Created new repository
- [ ] Created `.gitignore` file
- [ ] Pushed code to GitHub (via Desktop or Git)
- [ ] Verified code is visible on GitHub

**Repository URL:** https://github.com/___________/___________

---

## Phase 4: Render.com Deployment

- [ ] Created Render.com account (via GitHub)
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Configured:
  - [ ] Name: ___________
  - [ ] Region: ___________
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Plan: Free
- [ ] Added environment variable:
  - [ ] Key: `MONGODB_URI`
  - [ ] Value: (your MongoDB connection string)
- [ ] Deployment completed successfully
- [ ] Status shows "Live" ✅

**Live URL:** https://___________.onrender.com

---

## Phase 5: Data Migration

- [ ] Checked if existing data in `data/` folder
- [ ] Ran migration: `node migrate-to-mongodb.js`
- [ ] Verified data migrated successfully
- [ ] Or initialized sample data via `/api/inventory/initialize`
- [ ] Tested live website works correctly

---

## Phase 6: Final Testing

- [ ] Can access website from any device (via internet)
- [ ] Can create inventory items
- [ ] Can generate bills
- [ ] Can view reports
- [ ] Can download CSV reports
- [ ] Data persists after page refresh
- [ ] Multiple users can access simultaneously

---

## 🎉 All Done!

Once all items are checked:
- ✅ Your app is live on the cloud
- ✅ Data is stored in MongoDB Atlas
- ✅ Accessible from anywhere
- ✅ Automatically backed up

**Next Steps:**
- Share your Render URL with team members
- Bookmark your MongoDB Atlas dashboard
- Set up regular data backups (optional)

---

## 📞 Support

If any step fails:
1. Check error messages in console/logs
2. Refer to `COMPLETE_CLOUD_SETUP.md` for detailed instructions
3. Verify all environment variables are set correctly
4. Test locally first before deploying

---

**Date Completed:** ___________

**Live URL:** https://___________.onrender.com

**MongoDB Atlas Dashboard:** https://cloud.mongodb.com


