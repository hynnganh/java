import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("admin-token"); // Kiểm tra đúng tên key
  const role = localStorage.getItem("admin-role");

  console.log("Check Route - Token:", token); // Debug xem có token chưa
  console.log("Check Route - Role:", role);

  if (!token || role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;