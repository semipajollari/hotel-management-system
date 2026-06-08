# Requirements Specification
## Hotel Management System — Modern Version (2026)

---

## 1. Project Overview

The Hotel Management System is a web-based application that automates the daily operations of a hotel. It serves four types of users — Hotel Manager, Restaurant Manager, Receptionist, and Waiter — each with dedicated dashboards and role-based access to features.

The system replaces manual paper-based workflows with a centralized digital platform that is accessible from any device with a web browser.

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization

| ID | Requirement |
|----|-------------|
| FR-01 | The system shall allow users to log in with email and password. |
| FR-02 | The system shall deny login for invalid credentials. |
| FR-03 | The system shall assign each user a role on creation. |
| FR-04 | The system shall restrict access to features based on role. |
| FR-05 | The system shall allow users to sign out at any time. |

### 2.2 Room Management (Hotel Manager only)

| ID | Requirement |
|----|-------------|
| FR-10 | The system shall allow the Hotel Manager to add new rooms. |
| FR-11 | The system shall allow the Hotel Manager to edit room details (number, type, price, capacity, status). |
| FR-12 | The system shall allow the Hotel Manager to delete rooms. |
| FR-13 | The system shall display all rooms with their current status. |
| FR-14 | The system shall support four room types: Single, Double, Deluxe, Suite. |
| FR-15 | The system shall support three room statuses: Available, Occupied, Maintenance. |

### 2.3 Client Management (Hotel Manager, Receptionist)

| ID | Requirement |
|----|-------------|
| FR-20 | The system shall allow registering a new client with: First Name, Last Name, Email, Phone, ID Number, Nationality. |
| FR-21 | The system shall display all registered clients. |
| FR-22 | The system shall allow searching clients by name, email, or ID number. |

### 2.4 Booking Management (Hotel Manager, Receptionist)

| ID | Requirement |
|----|-------------|
| FR-30 | The system shall allow creating a booking by selecting a client, an available room, check-in and check-out dates. |
| FR-31 | The system shall automatically calculate the total price based on room price × nights. |
| FR-32 | The system shall mark a room as "Occupied" when a booking is created. |
| FR-33 | The system shall allow canceling an active booking. |
| FR-34 | The system shall mark a room as "Available" when its booking is cancelled. |
| FR-35 | The system shall display all bookings with client and room details. |

### 2.5 Employee Management (Hotel Manager, Restaurant Manager)

| ID | Requirement |
|----|-------------|
| FR-40 | The system shall allow managers to add new employee accounts. |
| FR-41 | The system shall allow managers to remove employee accounts. |
| FR-42 | The system shall prevent a manager from deleting their own account. |
| FR-43 | The system shall display all employees with their roles. |

### 2.6 Product / Menu Management (Restaurant Manager)

| ID | Requirement |
|----|-------------|
| FR-50 | The system shall allow the Restaurant Manager to add menu products with: Name, Category, Price, Availability, Description. |
| FR-51 | The system shall allow editing and deleting products. |
| FR-52 | The system shall support three product categories: Food, Drink, Dessert. |
| FR-53 | The system shall allow marking a product as unavailable without deleting it. |

### 2.7 Billing (Waiter, Restaurant Manager)

| ID | Requirement |
|----|-------------|
| FR-60 | The system shall allow a Waiter to create a bill for a table number. |
| FR-61 | The system shall allow adding multiple products with quantities to a bill. |
| FR-62 | The system shall automatically calculate the bill total. |
| FR-63 | The system shall allow the Restaurant Manager to mark a bill as "Paid". |
| FR-64 | The system shall display bill details: items, quantities, prices, total. |

### 2.8 Dashboard & Statistics

| ID | Requirement |
|----|-------------|
| FR-70 | The Hotel Manager dashboard shall show: total rooms, available rooms, active bookings, total clients, total revenue, total employees. |
| FR-71 | The Receptionist dashboard shall show: available rooms, active bookings, total clients. |
| FR-72 | The Restaurant Manager dashboard shall show: total products, available products, open bills, total revenue. |
| FR-73 | The Waiter dashboard shall show: open bills and paid bills created by them. |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Security | Passwords must be stored as bcrypt hashes, never in plain text. |
| NFR-02 | Security | All API routes must require a valid session. |
| NFR-03 | Security | Role-based access must be enforced server-side, not just client-side. |
| NFR-04 | Performance | The application must load dashboards in under 2 seconds on a standard connection. |
| NFR-05 | Usability | The interface must be responsive and usable on mobile devices. |
| NFR-06 | Usability | Forms must validate required fields before submission. |
| NFR-07 | Availability | The system must be deployable to Vercel with zero-downtime updates. |
| NFR-08 | Maintainability | Code must be written in TypeScript with clear types for all data models. |
| NFR-09 | Scalability | The MongoDB schema must support future addition of features without breaking changes. |
| NFR-10 | Reliability | Database connections must be cached to prevent connection pool exhaustion. |

---

## 4. Use Cases

### UC-01: Make a Booking
- **Actor:** Receptionist or Hotel Manager
- **Precondition:** Client is registered; at least one room is available.
- **Steps:**
  1. Actor navigates to Bookings → New Booking.
  2. Selects a client from the dropdown.
  3. Selects an available room.
  4. Enters check-in and check-out dates.
  5. System shows calculated total price.
  6. Actor clicks "Book".
  7. System creates the booking and marks the room as Occupied.
- **Postcondition:** Booking appears in the list; room status is "Occupied".
- **Exception:** If room becomes occupied between selection and submission, system returns an error.

### UC-02: Create a Restaurant Bill
- **Actor:** Waiter
- **Precondition:** At least one product is available in the menu.
- **Steps:**
  1. Actor navigates to My Bills → New Bill.
  2. Enters table number.
  3. Selects a product and quantity, clicks "Add" (repeats for each item).
  4. Reviews bill total.
  5. Clicks "Create Bill".
- **Postcondition:** Bill is saved with status "Open"; visible to Restaurant Manager.

### UC-03: Cancel a Booking
- **Actor:** Receptionist or Hotel Manager
- **Precondition:** Booking exists with status "Active".
- **Steps:**
  1. Actor finds the booking in the list.
  2. Clicks "Cancel".
  3. System confirms the action.
  4. System sets booking status to "Cancelled" and room to "Available".
- **Postcondition:** Room is available for new bookings.
