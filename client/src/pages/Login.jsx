import { useState } from "react";
import { loginUser, registerUser } from "../services/api";
import "../App.css"; // ✅ IMPORTANT CHANGE

export default function Login({ setToken }) {
  const [isSignup, setIsSignup] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!data.email || !data.password || (isSignup && !data.name)) {
      return alert("Please fill all fields");
    }

    try {
      setLoading(true);

      let res;

      if (isSignup) {
        res = await registerUser(data);
      } else {
        res = await loginUser({
          email: data.email,
          password: data.password,
        });
      }

      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role || "member");

        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        }

        setToken(res.token);
      } else {
        alert(res?.message || "Invalid credentials");
      }

    } catch (err) {
      console.log(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">

      {/* LEFT SIDE */}
      <div className="login-left">
        <h1>Task Manager</h1>
        <p>Manage tasks </p> {/* ✅ THIS WAS MISSING */}
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-box">

          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

          {isSignup && (
            <input
              name="name"
              placeholder="Name"
              value={data.name}
              onChange={handleChange}
            />
          )}

          <input
            name="email"
            placeholder="Email"
            value={data.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
          />

          <button onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Please wait..."
              : isSignup
              ? "Signup"
              : "Login"}
          </button>

          <p onClick={() => setIsSignup(!isSignup)}>
            {isSignup
              ? "Already have an account? Login"
              : "New user? Create account"}
          </p>

        </div>
      </div>

    </div>
  );
}