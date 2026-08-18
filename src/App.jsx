import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SharedFile from "./pages/SharedFile";
import Profile from "./pages/Profile";

import ProtectedRoute from "./ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =====================================================
            LOGIN
        ===================================================== */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* =====================================================
            REGISTER
        ===================================================== */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================================
            PROTECTED DASHBOARD
        ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            PROTECTED PROFILE
        ===================================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            PUBLIC SHARED FILE
        ===================================================== */}

        <Route
          path="/shared/:token"
          element={<SharedFile />}
        />


      </Routes>

    </BrowserRouter>
  );
}

export default App;