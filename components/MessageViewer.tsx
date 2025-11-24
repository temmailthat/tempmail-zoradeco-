"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Message } from "@/types";
import DOMPurify from "isomorphic-dompurify";

interface MessageViewerProps {
  message: Message | null;
}

export default function MessageViewer({ message }: MessageViewerProps) {
  const [viewMode, setViewMode] = useState<"html" | "text">("html");

  if (!message) {
    return (
      <div className="w-96 bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Mail className="w-16 h-16 mx-auto mb-4" />
          <p>Chọn email để xem</p>
        </div>
      </div>
    );
  }

  const sanitizedHtml = message.bodyHtml
    ? DOMPurify.sanitize(message.bodyHtml, {
        ALLOWED_TAGS: [
          "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
          "ul", "ol", "li", "a", "img", "div", "span", "table", "tr", "td", "th",
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style"],
      })
    : "";

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {message.subject || "(Không có tiêu đề)"}
        </h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Từ:</span>{" "}
            <span className="font-medium text-gray-800">
              {message.fromName ? `${message.fromName} <${message.fromEmail}>` : message.fromEmail}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Thời gian:</span>{" "}
            <span className="text-gray-800">
              {new Date(message.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="border-b border-gray-200 px-6 py-3 flex gap-2">
        <button
          onClick={() => setViewMode("html")}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            viewMode === "html"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          HTML
        </button>
        <button
          onClick={() => setViewMode("text")}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            viewMode === "text"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Text
        </button>
      </div>

      {/* Message Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === "html" && message.bodyHtml ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {message.bodyText || "(Không có nội dung)"}
          </pre>
        )}
      </div>
    </div>
  );
}
