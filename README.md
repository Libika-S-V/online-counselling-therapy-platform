# Serein - Online Therapy & Counselling Platform

Serein is a complete full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed to provide a safe, secure, and accessible mental health platform.

## Features

**For Clients:**
* **Browse & Filter Therapists**: Search by specialization, language, max fee, and minimum rating.
* **Book Appointments**: Select available time slots based on the therapist's calendar and choose between Video Call or Live Chat sessions.
* **Real-time Chat**: Connect securely with therapists via Socket.io during active appointments.
* **Mood Journal**: Log daily emotions with private notes to track mental well-being over time.
* **Reviews**: Leave ratings and reviews for therapists after completed sessions.

**For Therapists:**
* **Dashboard & Earnings**: View daily schedule and track lifetime/upcoming earnings.
* **Availability Management**: Set weekly recurring schedules for clients to book.
* **Profile Customization**: Update public biography, pricing, experience, and specializations.

**For Administrators:**
* **Dashboard Analytics**: Overview platform growth (users, therapists, appointments).
* **Therapist Approvals**: Review and approve/reject pending therapist applications.
* **User Management**: View all registered users and their roles.

## Technology Stack

* **Frontend**: React 18 (Vite), React Router v6, Tailwind CSS, Context API, Axios, Socket.io-client, lucide-react, date-fns.
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JSON Web Tokens (JWT), Multer (Image uploads), bcryptjs.

## Getting Started

### Prerequisites
* Node.js (v16+)
* MongoDB (Local or Atlas URI)

### Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   *Make sure your `MONGO_URI` is correctly set in `.env`.*
4. (Optional) Seed the database with mock data (Includes an Admin, Therapist, Client, Appointments, Reviews, and Messages):
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000` by default.*

### Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   *Verify `VITE_API_BASE_URL` points to `http://localhost:5000/api`.*
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser to the local address provided by Vite (usually `http://localhost:5173`).

## Default Seeded Accounts

If you ran the seed script (`npm run seed`), the following accounts are available (password for all is `Password123`):

* **Admin**: `admin@serein.com`
* **Therapist**: `sarah@serein.com`
* **Client**: `john@serein.com`

## Folder Structure

* `server/`
  * `controllers/`: Request handlers for API routes.
  * `middleware/`: Auth guards and Multer upload configurations.
  * `models/`: Mongoose schemas.
  * `routes/`: Express route definitions.
  * `socket/`: Socket.io event handlers.
  * `uploads/`: Stored user profile pictures (served statically).
* `client/`
  * `src/api/`: Axios interceptors.
  * `src/components/`: Reusable UI components.
  * `src/context/`: Global React Contexts (Auth, Socket).
  * `src/hooks/`: Custom React hooks (Data fetching).
  * `src/pages/`: Main route views.

## License
MIT License
