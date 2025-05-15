# MIMS – Materials Inventory Management System

**MIMS** (Materials Inventory Management System) is a custom-built internal platform developed for **Sentinel Integrated Security Services Inc.**. It is designed to streamline and manage the procurement, tracking, and distribution of materials and assets across the organization.

This system was developed and maintained by **Matthew**, IT Support Admin at Sentinel Integrated Security Services Inc., to support company operations with a centralized and secure inventory control solution.

## 🚀 Features

- 🔐 **Role-Based Access Control**  
  Secure login for Admin, User, and Guest roles with token-based authentication and session management.

- 📦 **Inventory Management**  
  Add, edit, and track material items with unique IDs, stock levels, and purchase history.

- 🧾 **Procurement Module**  
  Users can submit material requests; admins can approve and assign them accordingly.

- 📊 **Dashboard Analytics**  
  View inventory counts, usage trends, and recent activity through a clean dashboard.

- 📷 **QR Code Integration**  
  Each inventory item is automatically assigned a unique QR code that can be scanned for quick lookup and identification.

- 🌐 **Responsive UI**  
  Built with ReactJS, Ant Design, and TailwindCSS for a sleek, mobile-friendly interface.

- 🔄 **Session Auto-Logout**  
  Automatic detection of expired or missing tokens with user activity logging.

## Technologies Used

- **Frontend**: ReactJS, TailwindCSS, Ant Design
- **Backend**: PHP (REST API)
- **Database**: MySQL
- **Authentication**: Token-based auth with cookies
- **State Management**: Zustand stores for role-based auth
- **Other Tools**: React Query, Activity Logger, Context Providers

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HandyMatty/MIMS.git
   cd mims
