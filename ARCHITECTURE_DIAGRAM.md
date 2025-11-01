# 🏗️ Application Architecture Diagram

## Current System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend Files (public/)                            │   │
│  │  • index.html                                        │   │
│  │  • styles.css                                        │   │
│  │  • script.js                                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Browser LocalStorage (Temporary)                    │   │
│  │  • UPI Settings only                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/API Calls
┌─────────────────────────────────────────────────────────────┐
│                   NODE.JS SERVER (Backend)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Server (server.js)                       │   │
│  │  • API Endpoints                                     │   │
│  │  • Port 3000                                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  File System Storage                                 │   │
│  │  ┌──────────────────┐  ┌──────────────────┐        │   │
│  │  │ inventory.json   │  │  bills.json      │        │   │
│  │  │ • Products       │  │  • Sales Bills   │        │   │
│  │  │ • Categories     │  │  • Transactions  │        │   │
│  │  │ • Prices         │  │  • Revenue       │        │   │
│  │  │ • Quantities     │  │                  │        │   │
│  │  └──────────────────┘  └──────────────────┘        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Storage Comparison

### Current: File-Based (JSON)
```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│ API Request     │
│ (Express)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│ Read/Write      │─────▶│ JSON Files   │
│ JSON File       │      │ (data/)      │
└─────────────────┘      └──────────────┘
```

### Alternative: Cloud Database
```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│ API Request     │
│ (Express)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────────┐
│ Database Query  │─────▶│ Cloud Database   │
│ (MongoDB/Firebase)      │ (Always Online)  │
└─────────────────┘      └──────────────────┘
```

## Hosting Options Comparison

| Feature | Local Server | Cloud Hosting | Browser-Only |
|---------|-------------|---------------|--------------|
| **Cost** | Free | Free/Paid | Free |
| **Access** | Same Wi-Fi | Anywhere | Single device |
| **Backend** | Required | Required | Not needed |
| **Data Storage** | Local files | Cloud DB/Files | localStorage |
| **Scalability** | Low | High | Very Low |
| **Backup** | Manual | Automatic | None |
| **Multi-device** | ✅ Same network | ✅ Yes | ❌ No |
| **Offline** | ✅ Yes | ❌ No | ✅ Yes |

## Current Storage Locations

```
Project Root/
│
├── server.js              ← Backend server (Node.js/Express)
├── package.json           ← Dependencies
│
├── data/                  ← 🔴 DATA STORAGE FOLDER
│   ├── inventory.json     ← All products stored here
│   └── bills.json         ← All sales bills stored here
│
└── public/                ← Frontend files
    ├── index.html
    ├── styles.css
    └── script.js          ← Uses localStorage for UPI settings only
```

## Data Flow Example: Creating a Bill

```
1. User clicks "Pay Now" in browser
   │
   ▼
2. JavaScript (script.js) sends POST request to /api/bills
   │
   ▼
3. Express server (server.js) receives request
   │
   ▼
4. Server reads inventory.json (check stock)
   │
   ▼
5. Server creates new bill object
   │
   ▼
6. Server writes bill to bills.json
   │
   ▼
7. Server updates inventory.json (reduce quantities)
   │
   ▼
8. Server sends response back to browser
   │
   ▼
9. Browser displays success message and invoice
```

## Security & Backup Status

### Current Status:
```
✅ Data stored locally (you control it)
⚠️ No automatic backups
⚠️ Data at risk if:
   - Server crashes
   - Files get deleted
   - Hard drive fails
   - Computer stolen
```

### Recommended Setup:
```
✅ Keep local server
✅ Add automatic daily backups
✅ Sync backups to cloud (Google Drive/Dropbox)
✅ Test restore process monthly
```

---

**Summary:** Your data is currently stored in JSON files on your server's file system. This works well for single-user or small teams, but consider cloud hosting + database for production use or multi-location access.

