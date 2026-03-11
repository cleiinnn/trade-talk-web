import React, { useState } from "react";
import { forgotPassword } from "../viewmodel/api";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await forgotPassword({ email, newPassword });

    if (res.success) {
      setMessage("Password updated successfully.");
      setEmail("");
      setNewPassword("");
    } else {
      setMessage(res.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}

      <br />
      <Link to="/login">Back to Login</Link>
    </div>
  );
};

export default ForgotPassword;
