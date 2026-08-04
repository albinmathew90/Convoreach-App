# ConvoReach

ConvoReach is a comprehensive WhatsApp CRM and bulk-messaging platform. This repository contains both the frontend UI and the backend API services.

## 📂 Folder Structure

This is a monorepo containing two main projects:

- `/frontend` - The React/Vite frontend application (Dashboard, Flows, Inbox, Contacts).
- `/backend` - The Node.js backend (OpenWa API, WhatsApp Web JS integration, Authentication).

---

## 🚀 Getting Started (Local Development)

To run this project locally, you will need to open two separate terminals—one for the frontend and one for the backend.

### 1. Start the Backend

The backend handles database connections, WhatsApp sessions, and API requests.

```bash
cd backend
npm install
npm run dev
```
*By default, the backend runs on port **2785**.*

### 2. Start the Frontend

The frontend is built with Vite and React.

```bash
cd frontend
npm install
npm run dev
```
*By default, the frontend runs on port **5173**.*

---

## ⚙️ Environment Variables

For security reasons, `.env` files are not pushed to this repository. You must create them manually in both folders based on the `.env.example` templates.

### Backend (`/backend/.env`)
Create a `.env` file inside the `backend` folder containing your secret keys, database paths, and port configurations.

### Frontend (`/frontend/.env`)
Create a `.env` file inside the `frontend` folder containing the API URL pointing to the backend. Example:
```env
VITE_API_URL=http://localhost:2785
```

---

## ☁️ Deployment (Azure / Production)

1. **Prerequisites:** Ensure you have an Ubuntu VM with Node.js, PM2, and Nginx installed.
2. **Backend:** Clone the repository, navigate to `backend`, run `npm install`, create the `.env` file, and start it using PM2 (`pm2 start npm --name "convoreach-api" -- start`).
3. **Frontend:** Navigate to `frontend`, run `npm install`, add your production VM IP to the `.env` file, and run `npm run build`.
4. **Nginx:** Configure Nginx to serve the frontend `dist` folder on port 80 and proxy `/api` requests to your PM2 backend on port 2785.
