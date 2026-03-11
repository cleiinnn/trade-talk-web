// src/hooks/useAdminAuth.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAdminAuth = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || user.role !== "admin") navigate("/login");
  }, [navigate]);
};