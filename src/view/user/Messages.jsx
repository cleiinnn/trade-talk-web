import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Send, MessageCircle, Package,
  User, Loader2, ShoppingBag, Flag
} from "lucide-react";
import ReportUserModal from "./ReportUserModal";


import { BASE } from "../../viewmodel/constants";

// ── CONVERSATION SIDEBAR ITEM ────────────────────────────────────────────────
const ConvoItem = ({ convo, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
      isActive
        ? "bg-slate-900 text-white"
        : "bg-white hover:bg-slate-50 border border-slate-100"
    }`}
  >
    <img
      src={convo.listing_image}
      alt={convo.listing_title}
      className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-100"
    />
    <div className="flex-1 min-w-0">
      <p className={`text-xs font-black truncate ${isActive ? "text-white" : "text-slate-800"}`}>
        {convo.listing_title}
      </p>
      <p className={`text-[10px] font-bold truncate mt-0.5 ${isActive ? "text-slate-300" : "text-slate-400"}`}>
        {convo.other_username}
      </p>
      <p className={`text-[10px] truncate mt-0.5 ${isActive ? "text-slate-400" : "text-slate-300"}`}>
        {convo.last_message}
      </p>
    </div>
    {Number(convo.unread_count) > 0 && (
      <span className="bg-[#4B99D4] text-white text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
        {convo.unread_count}
      </span>
    )}
  </button>
);

// ── CHAT BUBBLE ──────────────────────────────────────────────────────────────
const ChatBubble = ({ msg, isMe }) => (
  <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
      isMe
        ? "bg-slate-900 text-white rounded-br-md"
        : "bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-sm"
    }`}>
      <p>{msg.message_text}</p>
      <p className={`text-[10px] mt-1.5 ${isMe ? "text-slate-400 text-right" : "text-slate-300"}`}>
        {new Date(msg.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  </div>
);

// ── MAIN ─────────────────────────────────────────────────────────────────────
const Messages = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const bottomRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  // Conversations list
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);

  // Active chat
  const [activeConvo, setActiveConvo] = useState(null); // { listing_id, listing_title, listing_image, other_user_id, other_username }
  const [messages, setMessages]       = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMessage, setNewMessage]   = useState("");
  const [sending, setSending]         = useState(false);

   //  state for report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportUser, setReportUser] = useState(null); // { id, name }

  // Polling ref
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== "user") navigate("/login");
  }, []);

  // If navigated here from Purchase with state, open that chat directly
  useEffect(() => {
    if (location.state?.listing_id) {
      setActiveConvo({
        listing_id:     location.state.listing_id,
        listing_title:  location.state.listing_title,
        listing_image:  location.state.listing_image,
        other_user_id:  location.state.other_user_id,
        other_username: location.state.other_username,
      });
    }
  }, [location.state]);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${BASE}/get_conversations.php?user_id=${user.user_id}`);
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch { setConversations([]); }
    finally { setLoadingConvos(false); }
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async () => {
    if (!activeConvo || !user) return;
    try {
      const res = await axios.get(`${BASE}/get_messages.php`, {
        params: {
          listing_id: activeConvo.listing_id,
          user_a:     user.user_id,
          user_b:     activeConvo.other_user_id,
        }
      });
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch { setMessages([]); }
  }, [activeConvo, user]);

  // Open a conversation
  const openConvo = (convo) => {
    setActiveConvo({
      listing_id:     convo.listing_id,
      listing_title:  convo.listing_title,
      listing_image:  convo.listing_image,
      other_user_id:  convo.other_user_id,
      other_username: convo.other_username,
    });
    setMessages([]);
  };

  // Load messages when active convo changes
  useEffect(() => {
    if (!activeConvo) return;
    setLoadingMsgs(true);
    fetchMessages().finally(() => setLoadingMsgs(false));

    // Poll every 3 seconds
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchMessages();
      fetchConversations();
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [activeConvo]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvo || sending) return;
    setSending(true);
    try {
      await axios.post(`${BASE}/send_message.php`, {
        listing_id:   activeConvo.listing_id,
        sender_id:    user.user_id,
        receiver_id:  activeConvo.other_user_id,
        message_text: newMessage.trim(),
      }, { headers: { "Content-Type": "application/json" } });

      setNewMessage("");
      fetchMessages();
      fetchConversations();
    } catch { /* silent fail */ }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 font-sans">

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <button onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 transition-colors">
          <ArrowLeft size={18} /> Home
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Messages</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your conversations</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 h-[75vh]">

        {/* ── SIDEBAR: Conversations ── */}
        <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto pr-1">
          {loadingConvos ? (
            <div className="text-center py-10 text-slate-300 font-black text-xs uppercase tracking-widest animate-pulse">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <MessageCircle size={32} className="mx-auto text-slate-200" />
              <p className="text-slate-300 font-black text-xs uppercase tracking-widest">No conversations yet</p>
              <p className="text-slate-300 text-[10px]">Accept a request to start chatting</p>
            </div>
          ) : (
            conversations.map((c, i) => (
              <ConvoItem
                key={`${c.listing_id}-${c.other_user_id}-${i}`}
                convo={c}
                isActive={
                  activeConvo?.listing_id === c.listing_id &&
                  activeConvo?.other_user_id === c.other_user_id
                }
                onClick={() => openConvo(c)}
              />
            ))
          )}
        </div>

        {/* ── MAIN: Chat Window ── */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">

          {!activeConvo ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-200">
              <MessageCircle size={56} />
              <p className="font-black text-sm uppercase tracking-widest">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-4 flex-shrink-0">
                <img
                  src={activeConvo.listing_image}
                  alt={activeConvo.listing_title}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{activeConvo.listing_title}</p>
                  <p className="text-[10px] font-bold text-[#4B99D4] uppercase tracking-widest">
                    {activeConvo.other_username}
                  </p>
                </div>

                 {/* <-- ADDED: Report button */}
                <button
                  onClick={() => {
                    setReportUser({
                      id: activeConvo.other_user_id,
                      name: activeConvo.other_username
                    });
                    setReportModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Report user"
                >
                  <Flag size={16} />
                </button>

                <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Active</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {loadingMsgs ? (
                  <div className="text-center py-10">
                    <Loader2 size={24} className="mx-auto text-slate-200 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <ShoppingBag size={32} className="mx-auto text-slate-100" />
                    <p className="text-slate-300 font-bold text-xs">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <ChatBubble
                      key={msg.message_id}
                      msg={msg}
                      isMe={Number(msg.sender_id) === Number(user.user_id)}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-slate-50 flex-shrink-0">
                <div className="flex items-end gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    rows={2}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#4B99D4]/20 focus:border-[#4B99D4] transition-all resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-[#4B99D4] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {sending
                      ? <Loader2 size={18} className="animate-spin" />
                      : <Send size={18} />
                    }
                  </button>
                </div>
                <p className="text-[10px] text-slate-300 mt-2 ml-1">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      </div>
       {/* <-- ADDED: Report modal */}
      {reportUser && (
        <ReportUserModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportUser(null);
          }}
          reportedUserId={reportUser.id}
          reportedUserName={reportUser.name}
          // Optionally pass transactionId if you have it from the request
        />
      )}
    </div>
  );
};

export default Messages;