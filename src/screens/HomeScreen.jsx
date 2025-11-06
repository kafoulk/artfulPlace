import { useAuth } from "../context/AuthContext";

// Home screen component
export default function HomeScreen() {

  const { user } = useAuth();

 return (
    <main aria-label="Home screen">
      {/* Personalized greeting */}
      <h1>Hello, {user?.displayName || user?.email || "Artist"}</h1>
      <p>Welcome to your AR Dimension!</p>
      
    </main>


  );
}


