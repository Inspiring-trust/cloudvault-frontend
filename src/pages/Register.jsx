import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    try {

      const response = await API.post("/users/register", {
        name,
        email,
        password,
      });

      alert("Registration Successful");

      navigate("/");

    } catch (error) {

      console.log(error.response);

      alert("Registration Failed");

    }

  };

  return (
    <div className="container">

      <div className="card">

        <h1>CloudVault</h1>

        <p>Create New Account</p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button onClick={handleRegister}>
          Register
        </button>

        <br /><br />

        <Link to="/">
          Already have an account? Login
        </Link>

      </div>

    </div>
  );
}

export default Register;