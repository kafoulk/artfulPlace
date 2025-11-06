import { useAuth } from "../context/AuthContext";

// Profile screen component
export default function ProfileScreen() {

  // Access user to logout 
  const { user, logout } = useAuth();

  return (
    <main aria-label="Profile screen">
      <h1>Profile</h1>
      
      <p> {user?.displayName || user?.email}</p>
      <button onClick={logout}>Sign Out</button>
    </main>

    
  );
}
