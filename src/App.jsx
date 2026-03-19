import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Homepage
import Login from "./view/Login";
import Register from "./view/Register";
import Index from "./view/index";
import ForgotPassword from "./view/ForgotPassword";
import Favorites from "./view/user/Favorites";
import GuestGate from "./view/Guestgate";

// User Page
import Home from "./view/user/Home";
import Listings from "./view/user/listings";
import History from "./view/user/history";
import Profile from "./view/user/profile";
import Showcase from "./view/user/Showcase";
import ProductDetail from "./view/user/ProductDetail";
import Orders from "./view/user/Orders";
import Purchase from "./view/user/Purchase";
import Messages from "./view/user/Messages";
import OrderSummary from "./view/user/OrderSummary";
import GroupList from './view/user/GroupList';
import GroupDetail from './view/user/GroupDetail';
import CreateGroup from './view/user/CreateGroup';

//Admin Page
import Admin from "./view/admin/Admin";
import StatusReview from "./view/admin/statusreview";
import AdminReports from "./view/admin/AdminReports";
import AdminTransactions from "./view/admin/AdminTransactions";



// Define routes
const router = createBrowserRouter([

  // Homepage
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/", element: <Index /> },

  { path: "/marketplace", element: <GuestGate page="Marketplace" /> },
  { path: "/community", element: <GuestGate page="Community" /> },
  { path: "/safety", element: <GuestGate page="Safety" /> },

  // User Page
  { path: "/home", element: <Home /> },
  { path: "/listings", element: <Listings /> },
  { path: "/history", element: <History /> },
  { path: "/profile", element: <Profile /> },
  { path: "/profile/:userId", element: <Profile /> },
  { path: "/favorites", element: <Favorites /> },
  { path: "/showcase", element: <Showcase /> },
  { path: "/product/:id", element: <ProductDetail /> },
  { path: "/orders", element: <Orders /> },
  { path: "/purchase", element: <Purchase /> },
  { path: "/messages", element: <Messages /> },
  { path: "/order-summary", element: <OrderSummary /> },
  { path: "/groups", element: <GroupList /> },
  { path: "/groups/create", element: <CreateGroup /> },
  { path: "/groups/:groupId", element: <GroupDetail /> },


  // Admin Page
  { path: "/admin", element: <Admin /> },
  { path: "/statusreview", element: <StatusReview /> },
  { path: "/admin/reports", element: <AdminReports /> },
  { path: "/admin/transactions", element: <AdminTransactions /> }

]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
