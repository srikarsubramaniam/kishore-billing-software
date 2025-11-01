# 📱 How to Access on Mobile Phone

## Method 1: Same Wi-Fi Network (Recommended)

### Step 1: Start the Server on Your Computer/Laptop

1. **Open Command Prompt** on your computer
2. Navigate to the project folder:
   ```bash
   cd "C:\Users\91968\Downloads\kishore billing software"
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. You'll see: `Server running on http://localhost:3000`

### Step 2: Find Your Computer's IP Address

**On Windows:**

1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. It will look like: `192.168.1.100` or `192.168.0.50`

**On Mac/Linux:**

1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your IP address (usually starts with 192.168.x.x)

### Step 3: Access from Mobile Phone

1. **Make sure your phone is on the SAME Wi-Fi network** as your computer
2. Open your mobile browser (Chrome, Safari, Firefox, etc.)
3. Type in the address bar:

   ```
   http://YOUR_IP_ADDRESS:3000
   ```

   For example: `http://192.168.1.100:3000`

4. The application will load on your mobile phone!

---

## Method 2: Using Your Computer's Hostname (Alternative)

Instead of IP address, you can sometimes use:

```
http://COMPUTER_NAME:3000
```

---

## Method 3: If You Have Access to Router

### Make it Accessible from Internet (Advanced)

1. Forward port 3000 in your router settings
2. Access using your public IP address
3. **⚠️ Warning:** Only do this if you have proper security in place!

---

## Troubleshooting

### Can't Access from Phone?

1. **Check Firewall:**

   - Windows: Allow Node.js through Windows Firewall
   - Mac: Allow incoming connections for Node.js

2. **Check IP Address:**

   - Make sure you're using the correct IP
   - Try `ipconfig` again to verify

3. **Same Network:**

   - Both devices must be on the same Wi-Fi
   - Phone should NOT be using mobile data

4. **Server Running:**
   - Make sure `npm start` is still running
   - Keep the Command Prompt window open

### Allow Through Firewall (Windows):

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js and check both Private and Public
4. Or temporarily disable firewall to test

---

## Quick Test

1. On your computer, open browser: `http://localhost:3000` ✅ Should work
2. On your phone (same Wi-Fi), open: `http://YOUR_IP:3000` ✅ Should work

---

## Once Connected on Mobile

The app is **fully mobile-responsive**, so:

- ✅ Touch-friendly buttons
- ✅ Easy navigation
- ✅ All features work perfectly
- ✅ Optimized for mobile screens
- ✅ Create bills, manage inventory, everything!

---

**Enjoy using Kishore Billing Software on your mobile phone! 📱**
