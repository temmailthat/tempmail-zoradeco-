"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MailboxList from "@/components/MailboxList";
import MessageViewer from "@/components/MessageViewer";
import { Mailbox, Message } from "@/types";

export default function Home() {
  const [currentMailbox, setCurrentMailbox] = useState<Mailbox | null>(null);
  const [savedMailboxes, setSavedMailboxes] = useState<Mailbox[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved mailboxes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tempmail_mailboxes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out expired mailboxes
        const valid = parsed.filter((mb: Mailbox) => new Date(mb.expiresAt) > new Date());
        setSavedMailboxes(valid);
        if (valid.length > 0 && !currentMailbox) {
          setCurrentMailbox(valid[0]);
        }
      } catch (e) {
        console.error("Failed to parse saved mailboxes", e);
      }
    }
  }, []);

  // Save mailboxes to localStorage
  useEffect(() => {
    if (savedMailboxes.length > 0) {
      localStorage.setItem("tempmail_mailboxes", JSON.stringify(savedMailboxes));
    }
  }, [savedMailboxes]);

  // Poll for new messages
  useEffect(() => {
    if (!currentMailbox) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/mailboxes/${currentMailbox.id}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        } else if (res.status === 404 || res.status === 410) {
          // Mailbox expired
          handleMailboxExpired();
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [currentMailbox]);

  const handleMailboxExpired = () => {
    if (currentMailbox) {
      setSavedMailboxes((prev) => prev.filter((mb) => mb.id !== currentMailbox.id));
      setCurrentMailbox(null);
      setMessages([]);
      setSelectedMessage(null);
    }
  };

  const handleCreateMailbox = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mailboxes", {
        method: "POST",
      });
      if (res.ok) {
        const newMailbox = await res.json();
        setCurrentMailbox(newMailbox);
        setSavedMailboxes((prev) => [newMailbox, ...prev]);
        setMessages([]);
        setSelectedMessage(null);
      } else {
        alert("Failed to create mailbox");
      }
    } catch (error) {
      console.error("Failed to create mailbox", error);
      alert("Failed to create mailbox");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMailbox = (mailbox: Mailbox) => {
    setCurrentMailbox(mailbox);
    setMessages([]);
    setSelectedMessage(null);
  };

  const handleClearMailbox = () => {
    setCurrentMailbox(null);
    setMessages([]);
    setSelectedMessage(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentMailbox={currentMailbox}
        savedMailboxes={savedMailboxes}
        onCreateMailbox={handleCreateMailbox}
        onSelectMailbox={handleSelectMailbox}
        onClearMailbox={handleClearMailbox}
        loading={loading}
      />
      <MailboxList
        mailbox={currentMailbox}
        messages={messages}
        selectedMessage={selectedMessage}
        onSelectMessage={setSelectedMessage}
      />
      <MessageViewer message={selectedMessage} />
    </div>
  );
}
