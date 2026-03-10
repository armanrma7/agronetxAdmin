import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../state/auth/AuthContext";
import { AdminLayout } from "../layouts/AdminLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { UsersPage } from "../pages/users/UsersPage";
import { AnnouncementsPage } from "../pages/announcements/AnnouncementsPage";
import { ApplicationsPage } from "../pages/applications/ApplicationsPage";
import { FavoritesPage } from "../pages/favorites/FavoritesPage";
import { DevicesPage } from "../pages/devices/DevicesPage";
import { CategoriesPage } from "../pages/categories/CategoriesPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRouter = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

