# 🏪 Kishore Billing Software

A modern web-based billing and inventory management system for stores, built with Node.js, Express, MongoDB Atlas, and vanilla JavaScript.

## ✨ Features

- 📝 **Create Bills** - Generate bills with customer information
- 📦 **Inventory Management** - Add, edit, and manage products
- 🧾 **View Bills** - View and search all generated bills
- 📊 **Dashboard** - Overview of inventory and sales statistics
- 📈 **Sales Reports** - Daily, monthly, and yearly sales reports with CSV export
- 💳 **Payment Methods** - Support for cash and online payments with QR codes
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier available)
- Git

### Local Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd kishore_billing_software
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/kishore_billing?retryWrites=true&w=majority
   ```

4. **Start the server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

## ☁️ Deployment on Render (Free)

### Step 1: Prepare Repository

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: kishore-billing-software
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variable:
   - **Key**: `MONGO_URL`
   - **Value**: Your MongoDB Atlas connection string
6. Click "Create Web Service"

### Step 3: Verify Deployment

After deployment, test these URLs:

- `https://your-app-name.onrender.com/` - Main app
- `https://your-app-name.onrender.com/health` - Health check
- `https://your-app-name.onrender.com/api/inventory` - API test

## 🔧 Project Structure

```
kishore_billing_software/
├── api/
│   └── index.js              # Express app for Render deployment
├── config/
│   └── database.js           # MongoDB connection configuration
├── models/
│   ├── Inventory.js          # Inventory model
│   └── Bill.js               # Bill model
├── public/
│   ├── index.html            # Frontend HTML
│   ├── script.js             # Frontend JavaScript
│   └── styles.css            # Frontend CSS
├── .gitignore
├── package.json
└── README.md
```

## 📦 API Endpoints

### Inventory

- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:category` - Get items by category
- `POST /api/inventory` - Add new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `POST /api/inventory/initialize` - Initialize sample data

### Bills

- `GET /api/bills` - Get all bills
- `GET /api/bills/:id` - Get single bill
- `POST /api/bills` - Create new bill

### Reports

- `GET /api/reports/daily` - Daily sales report
- `GET /api/reports/monthly` - Monthly sales report
- `GET /api/reports/yearly` - Yearly sales report
- `GET /api/reports/download/:type` - Download report as CSV

### Health Check

- `GET /health` - Server health status

## 🔐 Environment Variables

| Variable    | Description                     | Required |
| ----------- | ------------------------------- | -------- |
| `MONGO_URL` | MongoDB Atlas connection string | Yes      |

## 🛠️ Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

### Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas (MongoDB)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Render (Web Service)

## 📝 License

ISC

## 🙋 Support

For issues or questions:

1. Check deployment logs in Render dashboard
2. Verify MongoDB Atlas connection
3. Check environment variables are set correctly

## 🎯 Features by Category

### Inventory Categories

- **Fancy Items** - Decorative and fancy store items
- **Electronics** - Electronic components and devices

### Payment Methods

- Cash
- Online Payment (with QR code generation)

---

**Made with ❤️ for store management**
