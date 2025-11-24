"use client";

import { Copy, Mail, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Mailbox, Message } from "@/types";
import { useState } from "react";

interface MailboxListProps {
  mailbox: Mailbox | null;
  messages: Message[];
  selectedMessage: Message | null;
  onSelectMessage: (message: Message) => void;
}

export default function MailboxList({
  mailbox,
  messages,
  selectedMessage,
  onSelectMessage,
}: MailboxListProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (mailbox) {
      await navigator.clipboard.writeText(mailbox.addressFull);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mailbox) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Nhấn "Tạo" để bắt đầu</p>
          <p className="text-sm mt-2">Tạo địa chỉ email tạm thời của bạn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Email Address Display */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-600">Địa chỉ email tạm thời của bạn</h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Đã copy!" : "Copy"}
          </button>
        </div>
        <div className="text-2xl font-mono font-bold text-gray-800 break-all">
          {mailbox.addressFull}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Hết hạn: {new Date(mailbox.expiresAt).toLocaleString("vi-VN")}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Loader2 className="w-12 h-12 mb-4 animate-spin" />
            <p className="text-lg">Đang chờ email...</p>
            <p className="text-sm mt-2">Email sẽ xuất hiện tự động khi có thư mới</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message.id}
                onClick={() => onSelectMessage(message)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === message.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="font-semibold text-gray-800 truncate flex-1">
                    {message.fromName || message.fromEmail}
                  </div>
                  <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>
                </div>
                <div className="text-sm text-gray-600 truncate mb-1">
                  {message.subject || "(Không có tiêu đề)"}
                </div>
                <div className="text-xs text-gray-400 truncate">{message.fromEmail}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
