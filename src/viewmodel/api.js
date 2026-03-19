import axios from "axios";

// Only send ngrok header when using an ngrok URL to avoid CORS preflight failures.
const NGROK_HEADER = "ngrok-skip-browser-warning";
if (import.meta.env.VITE_API_BASE_URL?.includes("ngrok")) {
  axios.defaults.headers.common[NGROK_HEADER] = "true";
} else {
  delete axios.defaults.headers.common[NGROK_HEADER];
}

// VITE_API_BASE_URL=https://yourserver.com/backend
const BASE = import.meta.env.VITE_API_BASE_URL;

// REGISTER
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE}/register.php`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "Server error" };
  }
};

// LOGIN
export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(
      `${BASE}/login.php`,
      { email, password },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Server error" };
  }
};

// FORGOT PASSWORD
export const forgotPassword = async ({ email, newPassword }) => {
  try {
    const res = await axios.post(
      `${BASE}/forgot_password.php`,
      { email, newPassword },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Forgot password error:", err);
    return { success: false, message: "Server error" };
  }
};

//////////////////////////////////////////////////////////////////// USER ZONE

// ADD LISTING - USER (with file upload)
export const addListing = async (formData) => {
  try {
    const res = await axios.post(`${BASE}/add_listing.php`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("Add listing error:", err);
    return { success: false, message: "Server error" };
  }
};


// GET USER LISTINGS
export const getUserListings = async (user_id) => {
  try {
    const res = await axios.get(`${BASE}/get_user_listings.php?user_id=${user_id}`);
    return res.data;
  } catch (err) {
    console.error("Get user listings error:", err);
    return [];
  }
};


// GET USER FAVORITES(fetch the listings that the user has favorited)
export const getUserFavorites = async (userId) => {
  try {
    const res = await axios.get(`${BASE}/get_user_favorites.php?user_id=${userId}`);
    return res.data;
  } catch (err) {
    console.error("Get favorites error:", err);
    return [];
  }
};

// TOGGLE FAVORITE( add/remove a listing from user's favorites)
export const toggleFavoriteApi = async (userId, listingId) => {
  try {
    const res = await axios.post(`${BASE}/toggle_favorite.php`, {
      user_id: userId,
      listing_id: listingId,
    });
    return res.data;
  } catch (err) {
    console.error("Toggle favorite error:", err);
    return { success: false };
  }
};

// GET NOTIFICATIONS(home page bell icon)
export const getNotifications = async (userId) => {
  try {
    const res = await axios.get(`${BASE}/get_notifications.php?user_id=${userId}`);
    return res.data;
  } catch (err) {
    console.error("Get notifications error:", err);
    return [];
  }
};

// MARK NOTIFICATIONS AS READ( after user clicks the bell icon, mark all notifications as read)
export const markNotificationsRead = async (userId) => {
  try {
    const res = await axios.post(`${BASE}/mark_notifications_read.php`, {
      user_id: userId,
    });
    return res.data;
  } catch (err) {
    console.error("Mark notifications error:", err);
    return { success: false };
  }
};

// DELETE LISTING
export const deleteListing = async (listing_id) => {
  try {
    const res = await axios.post(
      `${BASE}/delete_listing.php`,
      { listing_id },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Delete listing error:", err);
    return { success: false, message: "Server error" };
  }
};


// SEND A BUY/TRADE REQUEST
export const sendTradeRequest = async (buyerId, listingId, message = "") => {
  try {
    const res = await axios.post(
      `${BASE}/buy_process.php`,
      {
        buyer_id: buyerId,
        listing_id: listingId,
        message: message,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data; // Expected: { success: true, message: "Request sent!" }
  } catch (err) {
    console.error("Trade request error:", err);
    return { success: false, message: "Server error" };
  }
};

// GET REQUESTS RECEIVED (For the Seller to see who wants to buy)
export const getIncomingRequests = async (userId) => {
  try {
    const res = await axios.get(
      `${BASE}/get_incoming_requests.php?user_id=${userId}`
    );
    return res.data;
  } catch (err) {
    console.error("Fetch incoming requests error:", err);
    return [];
  }
};


// UPDATE ORDER STATUS (shipped, completed, cancelled, no_show, returned)
export const updateOrderStatus = async (orderId, status, userId, note = "") => {
  try {
    const res = await axios.post(
      `${BASE}/update_order_status.php`,
      { order_id: orderId, status, user_id: userId, note },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Update order status error:", err);
    return { success: false, message: "Server error" };
  }
};

// SUBMIT A REPORT (user reports another user)
export const submitReport = async (reportData) => {
  try {
    const res = await axios.post(`${BASE}/submit_report.php`, reportData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error("Submit report error:", err);
    return { success: false, message: "Server error" };
  }
};

// SUBMIT A REVIEW (after completed transaction)
export const submitReview = async ({ transaction_id, reviewer_id, reviewed_user_id, rating, comment = "" }) => {
  try {
    const res = await axios.post(
      `${BASE}/submit_review.php`,
      { transaction_id, reviewer_id, reviewed_user_id, rating, comment },
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Submit review error:", err);
    return { success: false, message: "Server error" };
  }
};

// ==================== GROUPS ====================

// GET /get_groups.php
export const getGroups = async (userId, category = "") => {
  try {
    const query = new URLSearchParams();
    if (userId) query.append("user_id", String(userId));
    if (category) query.append("category", category);
    const res = await axios.get(`${BASE}/get_groups.php?${query.toString()}`);
    return res.data;
  } catch (err) {
    console.error("Get groups error:", err);
    return { success: false, groups: [] };
  }
};

// GET /get_group.php?group_id=...
export const getGroup = async (groupId, userId) => {
  try {
    const res = await axios.get(`${BASE}/get_group.php?group_id=${groupId}&user_id=${userId}`);
    return res.data;
  } catch (err) {
    console.error("Get group error:", err);
    return { success: false };
  }
};

// POST /create_group.php
export const createGroup = async (groupData) => {
  try {
    const res = await axios.post(`${BASE}/create_group.php`, groupData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.error("Create group error:", err);
    return { success: false, message: "Server error" };
  }
};

// POST /join_group.php
export const joinGroup = async (groupId, userId) => {
  try {
    const res = await axios.post(
      `${BASE}/join_group.php`,
      { group_id: groupId, user_id: userId },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Join group error:", err);
    return { success: false, message: "Server error" };
  }
};

// POST /leave_group.php
export const leaveGroup = async (groupId, userId) => {
  try {
    const res = await axios.post(
      `${BASE}/leave_group.php`,
      { group_id: groupId, user_id: userId },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Leave group error:", err);
    return { success: false, message: "Server error" };
  }
};

// POST /create_post.php
export const createPost = async (groupId, content, userId) => {
  try {
    const res = await axios.post(
      `${BASE}/create_post.php`,
      { group_id: groupId, content, user_id: userId },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Create post error:", err);
    return { success: false, message: "Server error" };
  }
};

// POST /delete_post.php
export const deletePost = async (postId, userId) => {
  try {
    const res = await axios.post(
      `${BASE}/delete_post.php`,
      { post_id: postId, user_id: userId },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Delete post error:", err);
    return { success: false, message: "Server error" };
  }
};


//////////////////////////////////////////////////////////////////// ADMIN ZONE

// GET ALL USERS (ADMIN)
export const getUsers = async () => {
  try {
    const res = await axios.get(`${BASE}/get_users.php`, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// DELETE USER (ADMIN)
export const deleteUser = async (userId) => {
  try {
    const res = await axios.post(
      `${BASE}/delete_user.php`,
      { user_id: userId },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Delete user error:", err);
    return { success: false, message: "Server error" };
  }
};

// GET ALL APPROVED LISTINGS (Admin)
export const getListings = async () => {
  try {
    const res = await axios.get(`${BASE}/get_listings.php`, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Get listings error:", err);
    return [];
  }
};

// TOGGLE USER STATUS (ADMIN)
export const toggleUserStatus = async (userId, newStatus) => {
  try {
    const res = await axios.post(
      `${BASE}/toggle_user_status.php`,
      { user_id: userId, status: newStatus },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error("Toggle status error:", err);
    return { success: false, message: "Server error" };
  }
};

// GET ALL REPORTS (ADMIN) — optional filters: { status, reported_user_id }
export const getReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const res = await axios.get(
      `${BASE}/get_reports.php${params ? `?${params}` : ""}`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Get reports error:", err);
    return { success: false, reports: [] };
  }
};

// ACTION A REPORT (ADMIN) — action: 'reviewed' | 'dismissed' | 'actioned' | 'ban'
export const actionReport = async (reportId, action, options = {}) => {
  try {
    const res = await axios.post(
      `${BASE}/action_report.php`,
      { report_id: reportId, action, ...options },
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Action report error:", err);
    return { success: false, message: "Server error" };
  }
};


// GET CREDIT SCORE LOG (ADMIN)
export const getCreditScoreLog = async (userId) => {
  try {
    const res = await axios.get(
      `${BASE}/get_credit_score_log.php?user_id=${userId}`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Get credit score log error:", err);
    return { success: false };
  }
};
