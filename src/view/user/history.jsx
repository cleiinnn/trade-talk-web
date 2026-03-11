import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const History = () => {
  const [user] = useState(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (err) {
      console.error("Invalid user session data", err);
      return null;
    }
  });
  const navigate = useNavigate();

  // 🔐 Load logged-in user and check role
  useEffect(() => {
    if (!user) {
      alert("Please log in first.");
      sessionStorage.removeItem("user");
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      alert("Access denied. Only regular users can access this page.");
      navigate("/login");
      return;
    }
  }, [navigate, user]);

  if (!user) return null; // optional loading indicator

  return (
    <div style={{ padding: "30px" }}>
      <h2>History Page</h2>

      {/* Logout clears sessionStorage */}
      <Link
        to="/login"
        onClick={() => sessionStorage.clear()}
        style={{ color: "blue", textDecoration: "underline" }}
      >
        Logout
      </Link>
      <br /><br />

      <Link to="/home">Home</Link><br />
      <Link to="/listings">Listing</Link><br />
      <Link to="/profile">Profile</Link><br />
    </div>
  );
};

export default History;
