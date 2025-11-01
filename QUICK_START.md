# 🚀 Quick Start Guide - Kishore Billing Software

## How to Run (3 Simple Steps)

### Step 1: Open Command Prompt

- Press `Windows Key + R`
- Type `cmd` and press Enter

### Step 2: Navigate and Install

```bash
cd "C:\Users\91968\Downloads\kishore billing software"
npm install
```

### Step 3: Start the Server

```bash
npm start
```

### Step 4: Open Browser

Go to: **http://localhost:3000**

---

## First Time Setup

1. **Load Sample Items**: Click "Load Sample Items" button on Dashboard
2. **Configure UPI**: Go to Settings → Enter your UPI ID → Save
3. **Start Using**: Create bills, manage inventory, view reports!

---

## To Stop the Server

Press `Ctrl + C` in the Command Prompt window.

---

## Troubleshooting

**If you see "npm is not recognized":**

- Install Node.js from: https://nodejs.org/
- Restart Command Prompt after installation

**If port 3000 is busy:**

- Close other applications using port 3000
- Or change port in `server.js` (line 9)

---

**That's it! Enjoy using Kishore Billing Software! 🎉**

---

## 📱 Accessing on Mobile Phone

To use the app on your mobile phone:

1. **Make sure server is running** on your computer (see steps above)
2. **Find your computer's IP address:**
   - Open new Command Prompt window
   - Type: `ipconfig`
   - Look for "IPv4 Address" (e.g., 192.168.1.100)
3. **On your phone (same Wi-Fi network):**
   - Open mobile browser
   - Type: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`
4. **Done!** The app works perfectly on mobile!

**See MOBILE_ACCESS.md for detailed mobile instructions!**
