# VitalIQ Project Execution Guide

This project consists of three main components:
1.  **AI Service**: Python FastAPI service for food/calorie prediction.
2.  **Backend**: Node.js/Express service for user management and data logging.
3.  **Frontend**: React Native/Expo mobile application.

---

## 1. AI Service (Python)
**Location**: `ai_service/`

### Prerequisites
- Python 3.8+
- pip

### Setup & Run
1.  Navigate to the directory:
    ```bash
    cd ai_service
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the service:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
*The service will be available at `http://localhost:8000`.*

---

## 2. Backend (Node.js)
**Location**: `backend/`

### Prerequisites
- Node.js & npm
- PostgreSQL

### Setup & Run
1.  Navigate to the directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Environment Setup**: Create a `.env` file in `backend/` with the following:
    ```env
    DATABASE_URL=postgres://username:password@localhost:5432/vitaliq
    JWT_SECRET=your_super_secret_key
    PORT=5000
    # Optional: For email features
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    ```
4.  **Database Migration**: Run the migration scripts to set up the schema:
    ```bash
    node migrate.js
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```
*The backend will be available at `http://localhost:5000`.*

---

## 3. Frontend (Expo)
**Location**: `frontend/`

### Prerequisites
- Node.js & npm
- Expo Go app on your phone (or an emulator)

### Setup & Run
1.  Navigate to the directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configure API URL**: 
    - Open `frontend/api.js`.
    - Change `API_URL` to point to your machine's local IP address (e.g., `http://192.168.1.XX:5000/api`). 
    - *Note: `localhost` will not work on a physical phone.*
4.  Start the application:
    ```bash
    npx expo start
    ```
5.  Scan the QR code with your Expo Go app.

---

## Port Map
- **Frontend**: 8081 (Expo default)
- **Backend**: 5000
- **AI Service**: 8000
