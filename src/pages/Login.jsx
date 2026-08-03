import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {

      const response = await API.post("/users/login", {
        email,
        password,
      });

      if (response.data.token) {

        localStorage.setItem("token", response.data.token);

        alert("Login Successful");

        navigate("/dashboard");

      } else {

        alert(response.data.message);

      }

    } catch (error) {

      console.log(error);

      alert("Login Failed");

    }
  };

  return (
    <div className="container">
      <div className="card">

        <h1>CloudVault</h1>
        <p>Secure File Storage System</p>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button onClick={handleLogin}>
          Login
        </button>

        <br /><br />

        <Link to="/register">
          Don't have an account? Register
        </Link>

      </div>
    </div>
  );
}

export default Login;