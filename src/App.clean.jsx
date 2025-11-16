import { Routes, Route } from "react-router-dom";

// public screens sin autenticacion
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

// private screens requieren login
import HomeScreen from "./screens/HomeScreen";
import UploadScreen from "./screens/UploadScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EditProfileScreen from "./screens/EditProfileScreen";

// Layout y protección
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./layouts/PrivateLayout";


// main app component with routing
export default function App() {

  // define routes
  return (
    <Routes>
      {/*  públicas */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />

      {/*  privadas dentro del layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PrivateLayout />
          </ProtectedRoute>
        }>


    {/* /  home */}
        <Route index element={<HomeScreen />} />

      {/* / upload */}
        <Route path="upload" element={<UploadScreen />} />

        {/*  / favorites */}
        <Route path="favorites" element={<FavoritesScreen />} />

        {/* /profile */}
        <Route path="profile" element={<ProfileScreen />} />

        {/* /profile/edit */}
     <Route path="profile/edit" element={<EditProfileScreen />} />
        
      </Route>

    </Routes>

  );
}
