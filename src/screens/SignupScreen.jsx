import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/artfulplace-logo.png";
import googleIcon from "../assets/google.svg";


// Signup screen component
export default function SignupScreen() {

  // State and hooks
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();


  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",

  }
);

// Error state
  const [error, setError] = useState("");


  // Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
   
    try {
      await signup(form.email, form.password, form.name);
      navigate("/");

    } catch (err) {
      setError(err.message || "Signup failed");
    }


  };

  // Render the signup form
  return (

    <div id="signup-root" className="signup-root" aria-label="Signup screen">
   
      <div id="signup-card" className="signup-card">
        
    <header className="signup-header">
          <img
            src={logo}
            alt="Artful Place logo"
            className="signup-logo"
          />
          <h1 id="login-card-title" className="login-title sr-only">
            Create your account
          </h1>
          <p className="signup-subtitle">
Reality, Reimagined by Art.          </p>
<p className="signup-subtitle2"> The revolutionary AR platform for
            sharing creative achievements & inspiration in real-time. </p>
   </header>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
        
          <label className="signup-label">First Name</label>
        
        <input
            id="name"
            type="text"
            placeholder="First Name"
            className="signup-input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

        <label htmlFor="email" className="signup-label">Email</label>
         
          <input
            id="email"
            type="email"
            placeholder="Email"
            className="signup-input"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

        <label htmlFor="password" className="signup-label">Password</label>
        
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="signup-input"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

      <button type="submit" className="signup-button"> Sign Up </button>
        </form>

        <div className="signup-separator" role="separator">
          
          <span className="signup-separator-text">Or</span>
       
 </div>
{/* // google signup button */}
     <button
  type="button"
  onClick={async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/", { replace: true });  
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  }}
  className="signup-google-button"
>
  <span
      className="signup-google-icon"
      aria-hidden="true"
      style={{ backgroundImage: `url(${googleIcon})` }}  
    />
 
</button>

        {error && <p className="signup-error">{error}</p>}

       <p className="signup-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-footer-link">
            Login
          </Link>
        </p>

   </div>


    </div>


  );


}
