# ZOOM Clone

## **Brief Overview**

The ZOOM Clone is a full-stack web application that replicates core functionalities of Zoom, enabling users to host and join video meetings, chat in real time, and manage their meeting history. It features user authentication, meeting management, chat, and responsive design for seamless video conferencing experiences.

## **Technologies Used**

1. **Node.js**: Backend runtime environment for server-side logic.
2. **Express.js**: Web framework for routing, middleware, and API setup.
3. **MongoDB**: NoSQL database for storing user and meeting data.
4. **Mongoose**: ODM library for MongoDB schemas and queries.
5. **Socket.IO**: Real-time communication for video, audio, and chat.
6. **JWT (jsonwebtoken)**: For stateless user authentication.
7. **bcrypt**: For secure password hashing.
8. **React.js**: Frontend library for building interactive user interfaces.
9. **Vite**: Frontend build tool for fast development and optimized builds.
10. **Tailwind CSS**: Utility-first CSS framework for responsive design.
11. **dotenv**: For managing environment variables securely.
12. **http-status**: For readable HTTP status codes.
13. **Joi**: For request validation.

## **Functions and Variables in Each File**

### **1. `backend/src/App.js`**

- **Purpose**: Main entry point for the backend server.
- **Key Functions and Variables**:
  - **Express Setup**: Initializes Express app and HTTP server.
  - **Socket.IO Integration**: Attaches Socket.IO for real-time features.
  - **CORS Configuration**: Allows requests from the frontend domain.
  - **Middleware**: Parses JSON, URL-encoded data, and cookies.
  - **Routes**: Mounts user-related routes.
  - **Static File Serving**: Serves React build files for client-side routing.
  - **Catch-All Route**: Serves `index.html` for any non-API route.
  - **MongoDB Connection**: Connects to MongoDB using Mongoose.

---

### **2. `backend/src/controllers/users.controllers.js`**

- **Purpose**: Handles user authentication and meeting history.
- **Key Functions**:
  - `login`: Authenticates user, generates JWT, returns token.
  - `register`: Registers new users with hashed passwords.
  - `logout`: Handles user logout (stateless).
  - `getUserHistory`: Fetches user's meeting history.
  - `addToHistory`: Adds a meeting to user's history.

---

### **3. `backend/src/controllers/socketManager.js`**

- **Purpose**: Manages Socket.IO connections for meetings and chat.
- **Key Functions**:
  - `connectToSocket`: Initializes Socket.IO server.
  - Handles events: `join-call`, `signal`, `chat-message`, `disconnect`.
  - Manages rooms, messages, and user online times.

---

### **4. `backend/src/middlewares/isAuth.js`**

- **Purpose**: JWT authentication middleware.
- **Key Functions**:
  - `authenticateToken`: Verifies JWT from `Authorization` header, attaches user info to request.

---

### **5. `backend/src/middlewares/authValidation.js`**

- **Purpose**: Validates user input for login and registration.
- **Key Functions**:
  - `signUpValidations`: Validates registration data using Joi.
  - `loginValidations`: Validates login data using Joi.

---

### **6. `backend/src/models/user.model.js` & `meeting.model.js`**

- **Purpose**: Mongoose schemas for users and meetings.
- **Key Variables**:
  - `User`: Schema for user data (username, password, token, etc.).
  - `Meeting`: Schema for meeting history (user_id, meeting_code).

---

### **7. `backend/src/routes/users.routes.js`**

- **Purpose**: Defines API endpoints for user actions.
- **Key Routes**:
  - `/login`: User login.
  - `/register`: User registration.
  - `/logout`: User logout.
  - `/check-auth`: Checks JWT authentication.
  - `/add_to_activity`: Adds meeting to history.
  - `/get_all_activity`: Fetches meeting history.

---

### **8. `frontend/src/App.jsx`**

- **Purpose**: Main React component for routing and layout.
- **Key Functions and Variables**:
  - Uses React Router for client-side navigation.
  - Renders Navbar, Footer, and Toast notifications.
  - Defines routes for landing, login, register, account, meeting code, and video meeting.

---

### **9. `frontend/src/pages/`**

- **Purpose**: Contains React pages for different app views.
- **Key Files**:
  - `Landing.jsx`: Home page.
  - `Login.jsx`: Login form and logic.
  - `Signup.jsx`: Registration form and logic.
  - `Account.jsx`: User account and meeting history.
  - `MeetingCode.jsx`: Enter meeting code to join.
  - `VideoMeet.jsx`: Video meeting room with chat, video, and controls.

---

### **10. `frontend/src/components/`**

- **Purpose**: Reusable UI components.
- **Key Files**:
  - `Navbar.jsx`: Top navigation bar.
  - `Footer.jsx`: Footer section.
  - Other shared UI elements.

---

### **11. `frontend/dist/`**

- **Purpose**: Contains built static files for deployment.
- **Key Files**:
  - `index.html`: Main entry point for React app.
  - `assets/`: Static assets (images, CSS, JS).

---

### **12. `.env`**

- **Purpose**: Stores environment variables.
- **Variables**:
  - `JWT_SECRET_KEY`: Secret for JWT signing.
  - `MONGO_URL`: MongoDB connection string.
  - `PORT`: Server port.

## **Setup Instructions**

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   ```

2. **Install backend dependencies:**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies and build:**

   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

4. **Configure environment variables:**

   - Create a `.env` file in `backend` with:
     ```
     JWT_SECRET_KEY=your-secret-key
     MONGO_URL=your-mongodb-url
     PORT=10000
     ```

5. **Start the backend server:**

   ```bash
   cd ../backend
   node src/App.js
   ```

6. **Deploy frontend and backend (e.g., Render):**
   - Frontend: Deploy `dist` as static site.
   - Backend: Deploy Express server.

## **Future Improvements**

- **Meeting Scheduling:** Allow users to schedule meetings in advance.
- **Screen Sharing:** Enhance screen sharing features.
- **Recording:** Add meeting recording functionality.
- **User Profiles:** Add profile management and avatars.
- **Notifications:** Real-time notifications for meeting invites and chat.
- **Improved UI/UX:** More interactive and accessible design.

## **Other Important Information**

- **Authentication:** Uses JWT for stateless authentication; tokens are stored in localStorage on the frontend.
- **Real-Time Communication:** Socket.IO enables instant video, audio, and chat.
- **Error Handling:** Uses HTTP status codes and JSON error messages.
- **Responsive Design:** Tailwind CSS ensures usability on all devices.
- **Security:** Passwords are hashed with bcrypt; JWT secret is stored in `.env`.

---

"Thank you for exploring this ZOOM Clone project! Feel free to contribute, customize, and extend its features for your own video conferencing."
