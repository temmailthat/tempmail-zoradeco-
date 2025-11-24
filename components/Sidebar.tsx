"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw, Trash2, Clock } from "lucide-react";
import { Mailbox } from "@/types";

interface SidebarProps {
  currentMailbox: Mailbox | null;
  savedMailboxes: Mailbox[];
  onCreateMailbox: () => void;
  onSelectMailbox: (mailbox: Mailbox) => void;
  onClearMailbox: () => void;
  loading: boolean;
}

export default function Sidebar({
  currentMailbox,
  savedMailboxes,
  onCreateMailbox,
  onSelectMailbox,
  onClearMailbox,
  loading,
}: SidebarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const domain = process.env.NEXT_PUBLIC_TEMPMAIL_DOMAIN || "example.com";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-80 bg-gradient-to-b from-teal-600 to-teal-700 text-white p-6 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-8 h-8" />
          <h1 className="text-2xl font-bold">TempMail</h1>
        </div>
        <p className="text-teal-100 text-sm">for {domain}</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-2 text-teal-100">Tên người dùng (tùy chọn)</label>
        <input
          type="text"
          placeholder="Nhập tên..."
          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-2 text-teal-100">Domain</label>
        <select className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30">
          <option value={domain}>@{domain}</option>
        </select>
      </div>

      <div className="space-y-3 mb-6">
        <button
          onClick={onCreateMailbox}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo"
          )}
        </button>

        <button
          onClick={onCreateMailbox}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Ngẫu nhiên
        </button>

        <button
          onClick={onClearMailbox}
          disabled={!currentMailbox}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Hủy
        </button>
      </div>

      {savedMailboxes.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm mb-2 text-teal-100">Mailbox đã tạo</label>
          <select
            value={currentMailbox?.id || ""}
            onChange={(e) => {
              const mailbox = savedMailboxes.find((mb) => mb.id === e.target.value);
              if (mailbox) onSelectMailbox(mailbox);
            }}
            className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
          >
            {savedMailboxes.map((mb) => (
              <option key={mb.id} value={mb.id}>
                {mb.addressFull}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-white/20">
        <div className="flex items-center gap-2 text-teal-100">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {currentTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <div className="text-xs text-teal-200 mt-1">
          {currentTime.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
