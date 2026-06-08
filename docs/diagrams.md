# System Diagrams
## Hotel Management System (2026)

> Diagrams marked **[original]** are from the original design phase and remain accurate for the current system.
> Diagrams marked **[updated]** are new versions that reflect the 2026 tech stack.

---

## 1. Use Case Diagram [original]

![Use Case Diagram](diagrams-original/Use%20Cases/Use%20Case%20HMS.png)

---

## 2. Activity Diagrams [original]

### Login
![Login Activity](diagrams-original/Activity%20%20Diagrams/Log%20In.png)

### Manage Rooms
![Manage Rooms Activity](diagrams-original/Activity%20%20Diagrams/Manage%20Rooms.png)

### Receptionist — Register Client
![Register Client](diagrams-original/Activity%20%20Diagrams/Receptionist%20Registers%20Client%20(1).png)

### Receptionist — Make Booking
![Receptionist Booking](diagrams-original/Activity%20%20Diagrams/Receptionist%20Check%20Client%20(1).png)

### Receptionist — Cancel Booking
![Cancel Booking](diagrams-original/Activity%20%20Diagrams/Receptionist%20Cancel%20Booking%20(1).png)

### Receptionist — View Available Rooms
![View Available Rooms](diagrams-original/Activity%20%20Diagrams/receptionist%20view%20avail.%20rooms%20(1).png)

### Waiter
![Waiter Activity](diagrams-original/Activity%20%20Diagrams/Waiter%20Activity%20Diagram.png)

### Add Product
![Add Product](diagrams-original/Activity%20%20Diagrams/Add%20Products%20(1).png)

### Edit Product
![Edit Product](diagrams-original/Activity%20%20Diagrams/Edit%20Products.png)

### Delete Product
![Delete Product](diagrams-original/Delete%20Product.png)

### View Finances / Dashboard
![View Finances](diagrams-original/Activity%20%20Diagrams/View%20Finances.png)

---

## 3. State Diagrams [original]

### Hotel Manager
![Hotel Manager State](diagrams-original/State%20Diagrams/Hotel%20Manager%20State%20Diagram.png)

### Receptionist
![Receptionist State](diagrams-original/State%20Diagrams/Receptionist%20State%20Diagram.png)

### Restaurant Manager
![Restaurant Manager State](diagrams-original/State%20Diagrams/Restaurant%20Manager%20State%20Diagram.png)

### Waiter
![Waiter State](diagrams-original/State%20Diagrams/Waiter%20State%20Diagram.png)

---

## 4. Sequence Diagrams [original]

### Login
![Login Sequence](diagrams-original/Sequence%20Diagrams/Log%20in%20Sequence%20Diagram.png)

### Manage Rooms
![Manage Rooms Sequence](diagrams-original/Sequence%20Diagrams/Manage%20Rooms%20Sequence%20Diagram.png)

### Manage Employees
![Manage Employees Sequence](diagrams-original/Sequence%20Diagrams/Manage%20Employees%20Sequence%20DIagram%20(1).png)

### Receptionist — Booking
![Receptionist Booking Sequence](diagrams-original/Sequence%20Diagrams/Receptionist%20Sequence%20Diagram.png)

### Receptionist — Client
![Receptionist Client Sequence](diagrams-original/Sequence%20Diagrams/Receptionist%20Client%20Sequence%20Diagram.png)

### Waiter
![Waiter Sequence](diagrams-original/Sequence%20Diagrams/Waiter%20Sequence%20Diagram.png)

### Restaurant Manager — View Products
![Restaurant Products Sequence](diagrams-original/Sequence%20Diagrams/Restaurant%20Manager%20View%20Products%20Sequence%20(2).png)

---

## 5. Collaboration Diagrams [original]

### Login
![Login Collaboration](diagrams-original/Collaboration%20Diagrams/Collab%20Login.png)

### Receptionist — Booking
![Booking Collaboration](diagrams-original/Collaboration%20Diagrams/Receptionist%20Booking%20Collaboration%20(1).png)

### Receptionist — Client
![Client Collaboration](diagrams-original/Collaboration%20Diagrams/Receptionist%20Client%20Collaboration%20(1).png)

### Manage Employees
![Employees Collaboration](diagrams-original/Collaboration%20Diagrams/Manage%20Employees%20Collab.png)

### Manage Rooms
![Rooms Collaboration](diagrams-original/Manage%20Rooms%20Collaboration.png)

### Waiter
![Waiter Collaboration](diagrams-original/Collaboration%20Diagrams/Waiter%20Collaboration%20Diagram.png)

---

## 6. Class Diagram [original]

![Class Diagram](diagrams-original/Class%20Diagram/Class%20Diagram%20(2).png)

---

## 7. Data Flow Diagrams [original]

### DFD Level 0
![DFD Level 0](diagrams-original/Data%20Flow%20Diagram/DFD%20Level%200.png)

### DFD Level 1
![DFD Level 1](diagrams-original/Data%20Flow%20Diagram/DFD%20Level%201.png)

### DFD Level 2
![DFD Level 2](diagrams-original/Data%20Flow%20Diagram/DFD%20Level%202.png)

---

## 8. Object Diagram [original]

![Object Diagram](diagrams-original/Object%20Diagrams/Object%20Diagram.png)

---

## 9. Database / ER Diagram — MongoDB Collections [updated]

> The original ERD was designed for MySQL. The updated version reflects the MongoDB document model used in the 2026 rebuild.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role
        Date createdAt
    }
    ROOM {
        ObjectId _id PK
        string number
        string type
        number price
        number capacity
        string status
        number floor
        string description
    }
    CLIENT {
        ObjectId _id PK
        string firstName
        string lastName
        string email
        string phone
        string idNumber
        string nationality
    }
    BOOKING {
        ObjectId _id PK
        ObjectId client FK
        ObjectId room FK
        Date checkIn
        Date checkOut
        string status
        number totalPrice
        string notes
        ObjectId createdBy FK
    }
    PRODUCT {
        ObjectId _id PK
        string name
        string category
        number price
        boolean available
        string description
    }
    BILL {
        ObjectId _id PK
        number tableNumber
        array items
        number total
        string status
        ObjectId createdBy FK
    }

    BOOKING }o--|| CLIENT : "belongs to"
    BOOKING }o--|| ROOM : "reserves"
    BOOKING }o--|| USER : "created by"
    BILL }o--|| USER : "created by"
    BILL ||--o{ PRODUCT : "contains"
```

---

## 10. System Architecture [updated]

> The original Component/Deployment diagrams showed XAMPP + Apache + MySQL. The updated version reflects the 2026 deployment on Vercel + MongoDB Atlas.

```mermaid
graph TB
    subgraph Client ["Browser (Any Device)"]
        UI[Next.js React UI\nTailwind CSS]
    end

    subgraph Vercel ["Vercel (Serverless Cloud)"]
        PAGES[App Router\nPages & Layouts]
        API[API Routes\n/api/*]
        AUTH[NextAuth.js\nJWT Sessions]
    end

    subgraph Atlas ["MongoDB Atlas (Cloud Database)"]
        DB[(MongoDB\nCollections)]
    end

    UI -->|Page navigation| PAGES
    UI -->|fetch() REST calls| API
    PAGES -->|getServerSession| AUTH
    API -->|verify session| AUTH
    API -->|Mongoose ODM| DB
    PAGES -->|Server-side reads| DB
```
