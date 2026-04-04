# Copper Cable Inventory Management System (Integrated)

This document provides a detailed overview of the Inventory Management module integrated into the Modern Admin Panel for **Abbasi Cable**.

## 📌 Project Overview
The Inventory Management System is designed to track Copper Cable products, manage stock-in (purchases) and stock-out (sales/issues) operations, and provide comprehensive reports for data-driven decision-making.

---

## 🏗️ Architecture & Integration

The system follows a modular architecture to ensure transparency and maintainability.

### 1. **State Management**
- **Lifting State**: All inventory data is managed at the `App.jsx` level. This allows both the **Dashboard** and the **Inventory Module** to access and update real-time data.
- **Persistence**: A custom `useLocalStorage` hook ensures all data (Products, Purchases, Sales) persists even after page refreshes.
  - **Keys used**: `inventory-products`, `inventory-purchases`, `inventory-sales`.

### 2. **Navigation**
- **Sidebar Integration**: The "Inventory" menu item now dynamically displays the total count of products.
- **Routing**: Handled via the existing `currentPage` state in `App.jsx`. Selecting "Inventory" renders the `InventoryWrapper` component.

---

## 🧩 Module Components

The module is divided into four main sub-sections, accessible through a tabbed interface in the Inventory view.

### 📦 1. Product Management (`ProductManagement.jsx`)
- **CRUD Operations**: Add, Edit, and Delete cable products.
- **Fields**: Name, Unit (meter/roll/kg), Current Stock, and Minimum Stock Level.
- **Stock Indicators**: 
  - **Low Stock Alert**: Products falling below the minimum stock level are highlighted in **Red** with a warning icon.
  - **Visual Progress Bar**: Shows current stock relative to the health threshold.
- **Search**: Instant filtering of products by name.

### 📥 2. Purchase Module (`PurchaseModule.jsx`)
- **Stock In**: Increase inventory levels for existing products.
- **Transaction Entry**: Record vendor name, unit price, quantity, and date.
- **History Preview**: A "Quick History" list on the side shows the 10 most recent purchases.

### 📤 3. Sales / Issue Module (`SalesModule.jsx`)
- **Stock Out**: Record sales or issues to projects/customers.
- **Validation**: Prevents transactions if requested quantity exceeds available stock.
- **Real-time Insights**: Shows total units issued and highlights critical stock alerts.

### 📊 4. Reports & History (`Reports.jsx`)
- **Full History**: View complete tables for both Purchases and Sales.
- **Financial Summary**: High-level cards showing "Total Purchase Value," "Total Units Issued," and "Average Transaction Value."
- **Export Ready**: Includes a prototype Export button for future functionality.

---

## 📈 Dashboard Integration

The main Dashboard has been enhanced to reflect inventory data:

1. **Live Stats Cards**:
   - **Total Cables**: Total unique product count.
   - **Low Stock Items**: Count of items needing urgent replenishment.
   - **Total Sales**: Count of all stock-out transactions.
   - **Purchases**: Count of all stock-in transactions.
2. **Recent Activity**: The "Recent Orders" table now pulls data directly from the Inventory Sales history.
3. **Top Performance**: "Top Products" are now dynamically calculated based on actual sales volume.

---

## 🎨 UI/UX Design

- **Consistent Styling**: Uses the existing Tailwind CSS configuration and dark-mode compatible gradients.
- **Interactivity**: Smooth transitions, hover effects on cards, and tab-based navigation for a seamless experience.
- **Lucide Icons**: Integrated standardized icons (`Package`, `ShoppingCart`, `ShoppingBag`, `BarChart3`) to match the existing design language.

---

## 🛠️ Technical Details

| Feature | Implementation |
| :--- | :--- |
| **Framework** | React JS (Vite) |
| **Styling** | Tailwind CSS (Utility-first) |
| **Icons** | Lucide React |
| **Storage** | Browser LocalStorage |
| **State** | React Hooks (useState, useEffect) |

---

## 🚀 How to Use

1. **Add Products**: Go to **Inventory > Products** and click "Add Product" to initialize your stock.
2. **Record Purchase**: When new stock arrives, use **Inventory > Purchase (In)** to update quantities.
3. **Issue Stock**: When cables are sold or used, use **Inventory > Sales (Out)**. 
4. **View Reports**: Check **Inventory > Reports** for a full audit trail of all transactions.
5. **Monitor Dashboard**: Keep an eye on the **Main Dashboard** for top-level summaries and stock alerts.

---

*This module was custom-built for **Abbasi Cable Management System** to ensure efficiency and accuracy in stock tracking.*
