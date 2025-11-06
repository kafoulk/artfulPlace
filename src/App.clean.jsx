// import necessary modules and components
import { Routes, Route } from "react-router-dom";

// import public pages no authentication required
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

// import private pages authentication required
import HomeScreen from "./screens/HomeScreen";
import UploadScreen from "./screens/UploadScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import ProfileScreen from "./screens/ProfileScreen";

// import components for route protection and layout
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./layouts/PrivateLayout";

export default function App() {
  
  return (
    <Routes>
     
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />

   
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PrivateLayout />
          </ProtectedRoute>
        } >

        <Route index element={<HomeScreen />} /> 
        <Route path="upload" element={<UploadScreen />} />
        <Route path="favorites" element={<FavoritesScreen />} />
        <Route path="profile" element={<ProfileScreen />} />

      </Route>
    </Routes>
  );
}
