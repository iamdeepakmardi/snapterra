import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Login from "./pages/Login";
import Screenshots from "./pages/Screenshots";
import Links from "./pages/Links";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/screenshots",
    element: (
      <ProtectedRoute>
        <Screenshots />
      </ProtectedRoute>
    ),
  },
  {
    path: "/links",
    element: (
      <ProtectedRoute>
        <Links />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/screenshots" replace />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
