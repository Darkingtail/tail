import Layout from "@/layout";
import { Login } from "@/pages/login";
import { Register } from "@/pages/login/register";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
