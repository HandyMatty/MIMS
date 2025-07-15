# MIMS – Materials Inventory Management System

**MIMS** (Materials Inventory Management System) is a comprehensive internal platform developed for **Sentinel Integrated Security Services Inc.**. It streamlines the tracking, management, and distribution of materials and assets across the organization, providing a centralized, secure, and user-friendly inventory control solution.

This system was developed and maintained by **Matthew**, IT Support Admin at Sentinel Integrated Security Services Inc., to support company operations with robust inventory, analytics, and reporting tools.

## 🚀 Features

- 🔐 **Role-Based Access Control**  
  Secure login for Admin, User, and Guest roles with token-based authentication and session management.

- 📦 **Inventory Management**  
  Add, edit, redistribute, and track material items with unique IDs, stock levels, and purchase/pull-out history. Batch operations (add, edit, delete, print) are supported for efficiency.

- 📊 **Dashboard Analytics**  
  View inventory counts, usage trends, and recent activity through a clean dashboard with charts and statistics.

- 📷 **QR Code Integration**  
  Each inventory item is automatically assigned a unique QR code for quick lookup, identification, and printing. QR codes can be downloaded or printed in various formats.

- 🌐 **Responsive UI**  
  Built with ReactJS, Ant Design, and TailwindCSS for a sleek, mobile-friendly interface.

- 🔄 **Session Auto-Logout**  
  Automatic detection of expired or missing tokens with user activity logging.

- 🛎️ **Notification System**  
  Real-time notifications for inventory updates and system actions. Users are notified of important events and can mark notifications as read.

- 📝 **Activity Logging**  
  All significant user actions (add, edit, delete, export, print, etc.) are logged for audit and traceability.

- 📤 **Export Functionality**  
  Export inventory and history data in multiple formats (CSV, PDF, DOCX, TXT, PNG) with options for all, filtered, or selected data.

- 📶 **Offline Support**  
  Detects offline status and queues network requests, with banners and alerts to inform users. Some features are limited while offline, and data syncs when connection is restored.

## Technologies Used

- **Frontend**: ReactJS, TailwindCSS, Ant Design
- **Backend**: PHP (REST API)
- **Database**: MySQL
- **Authentication**: Token-based auth with cookies
- **State Management**: Zustand stores for role-based auth
- **Other Tools**: React Query, Activity Logger, Notification System, Context Providers

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HandyMatty/MIMS.git
   cd mims
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Follow the setup instructions for both frontend and backend as described in their respective folders.

---

