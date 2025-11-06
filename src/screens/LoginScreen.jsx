import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/artfulplace-logo.png"; 
import googleIcon from "../assets/google.svg";


// Login screen component
export default function LoginScreen() {

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Handle form submission
 const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  // Render the login form
  return (
    
    
    <div id="login-root" className="login-root" data-screen="login"  aria-label="Login screen" >
     
      <div
        id="login-card"
        className="login-card"              
        role="region"
        aria-labelledby="login-card-title">
        
        <header className="login-header">
          <img
            src={logo}
            alt="Artful Place logo"
            className="login-logo"  />
         
          <h1 id="login-card-title" className="login-title sr-only">
            Log in to your account
          </h1>
         
       <p className="login-subtitle">
            Reality, Reimagined by Art. 
          </p>
          <p className="login-subtitle2">The revolutionary AR platform for
            sharing creative achievements & inspiration in real-time.</p>
        </header>

        
        <form className="login-form" onSubmit={handleSubmit} noValidate>
       
   <label className="login-label" htmlFor="email"> Email </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="login-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-describedby="email-help"
          />

        
          <span id="email-help" className="login-help sr-only">
            Enter your email address
          </span>

    <label className="login-label" htmlFor="password"> Password </label>
        
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="login-input"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            aria-describedby="password-help"
          />
        
          <span id="password-help" className="login-help sr-only">
            Enter your password
          </span>

          <button
            type="submit"
            className="login-button"         
            data-variant="primary"
          > Login  </button>
        
        
        </form>

        
   <div className="login-separator" role="separator" aria-label="or">
        
          <span className="login-separator-text">Or</span>
        </div>

       
  <button
  type="button"
  className="login-google-button"
  aria-label="Continue with Google"            
  onClick={async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  }}
>
  <span
    className="login-google-icon"
    aria-hidden="true"
    style={{ backgroundImage: `url(${googleIcon})` }}  
  />
</button>
        
 <p className="login-footer-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="login-footer-link">
            Sign Up
          </Link>
        </p>
      </div>

    </div>
    
  );
}
