import React, { useState, useRef, useEffect } from "react";
import { sendchat } from "../api";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    try {
      // Add user message
      const userMessage = { text: inputValue, isUser: true };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setInputValue("");

      // Send to backend
      const token = localStorage.getItem("fittrack-app-token");
      const data = { query: inputValue };
      const response = await sendchat(token, data);

      // Add bot response
      const botMessage = { text: response.data.response, isUser: false };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: "Sorry, I'm having trouble. Please try again.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Fitness Assistant</h3>
        <div className="status-indicator"></div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="welcome-bubble">
              <h4>Hello! 👋</h4>
              <p>I'm your fitness assistant. How can I help you today?</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message-bubble ${msg.isUser ? "user" : "bot"}`}
            >
              {msg.text}
            </div>
          ))
        )}
        {isLoading && (
          <div className="message-bubble bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about fitness, nutrition, or workouts..."
          disabled={isLoading}
        />
        <button type="submit" disabled={!inputValue.trim() || isLoading}>
          <i className="send-icon">➤</i>
        </button>
      </form>
    </div>
  );
}

export default Chat;
// i have kept css in index.css ( just mood)
