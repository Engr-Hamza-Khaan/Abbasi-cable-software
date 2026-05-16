

The system supports:
- Admin access to all shops
- Employee access restricted to assigned shop
- Shop selection during user signup
- Dynamic shop-based data filtering

---

## 🧠 Architecture Concept

This system follows:

> **Row-Level Multi-Tenancy (Shop-Based Isolation)**

Each record in business tables is associated with a `shopId`, ensuring strict data separation.

---

## 👥 User Roles

### 👑 Admin
- Access to all shops
- Can switch shops via dropdown
- Can view/manage all data across shops

### 👤 Employee
- Assigned to a single shop
- Cannot switch shops
- Can only access data belonging to assigned `shopId` as per restricted layout jesa define hwa va he

---

## 🗄️ Database Design (Sequelize Models)

### 🏪 Shop Model
- id (UUID / INTEGER)
- name (STRING)
- location (STRING)
- phone (STRING)
- isActive (BOOLEAN)
- createdAt
- updatedAt

---

### 👤 User Model
- id
- name
- email
- password
- role ENUM('admin', 'employee')
- shopId (FK → Shops.id, nullable for admin)

---

### 📦 Inventory Model (Example)
- id
- productName
- quantity
- price
- shopId (FK → Shops.id)

---

## 🔐 Authentication (JWT)

JWT payload must include:

```json
{
  "userId": "uuid",
  "role": "admin | employee",
  "shopId": "uuid (if employee)"
}
```

---

## 🏪 Shop Selection During Signup

### Flow

1. Fetch shops:
```
GET /shops
```

2. User selects shop from dropdown

3. Signup payload includes shopId

---

### Signup Payload Example

```json
{
  "name": "Ali Khan",
  "email": "ali@test.com",
  "password": "123456",
  "role": "employee",
  "shopId": "2"
}
```

---

## ⚙️ Backend Signup Rules

- Employee → shopId REQUIRED
- Admin → shopId OPTIONAL
- shopId must exist in Shops table

---

### Signup Controller Example

```js
const signup = async (req, res) => {
  const { name, email, password, role, shopId } = req.body;

  if (role === "employee" && !shopId) {
    return res.status(400).json({ message: "Shop is required for employee" });
  }

  if (shopId) {
    const shopExists = await Shop.findByPk(shopId);
    if (!shopExists) {
      return res.status(400).json({ message: "Invalid shop selected" });
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    shopId: role === "employee" ? shopId : null
  });

  res.json(user);
};
```

---

## ⚙️ Shop Context Middleware

### Purpose
Automatically determine which shop data user can access.

### Logic

```js
const resolveShop = (req, res, next) => {
  const user = req.user;

  req.context = {
    userId: user.id,
    role: user.role,
    shopId: user.role === "admin"
      ? req.query.shopId || null
      : user.shopId
  };

  next();
};
```

---

## 📦 API Behavior

### Inventory Example

Admin:
```
GET /inventory?shopId=1
```

Employee:
```
GET /inventory
```

---

### Query Enforcement

```js
where: {
  shopId: req.context.shopId
}
```

---

## 🖥️ Frontend Flow

### Admin Dashboard
- Shop dropdown visible
- Can switch shops dynamically

### Employee Dashboard
- No dropdown
- Fixed shop context

---

## 🔐 Security Rules

- Never trust frontend shopId
- Always validate shopId in backend
- Employee cannot override shopId
- All queries must include shopId filter

---

## 🚀 Advanced Improvements

### Sequelize Default Scope
```js
defaultScope: {
  where: { shopId: CURRENT_CONTEXT_SHOP }
}
```

### Hook Automation
```js
beforeCreate: (record, options) => {
  record.shopId = options.shopId;
};
```

---

## 📊 Final Outcome

- Multi-shop SaaS architecture
- Secure tenant isolation
- Clean onboarding flow
- Scalable system design

---

## 🏁 Summary

This system converts your application into a:

> Fully scalable multi-tenant shop management platform 🚀

