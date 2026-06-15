import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "../services/api";
import { getStoredTheme } from "../utils/theme";

const STORAGE_KEY = "parkmasterAssistantHistory";
const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Xin chào, mình là trợ lý ParkMaster. Bạn có thể hỏi bảng giá, nhờ ước tính phí, hoặc cung cấp mã vị trí để mình kiểm tra trạng thái.",
};

const suggestions = [
  "Cho tôi xem bảng giá",
  "Tính phí ô tô trong 5 giờ",
  "Kiểm tra slot B-C1-001",
];

function readHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(history) && history.length ? history : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function renderInlineMarkdown(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }

      return part;
    });
}

function isTableRow(line) {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function parseTableRow(line) {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line) {
  return parseTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function MarkdownMessage({ content }) {
  const lines = String(content || "").split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (
      isTableRow(lines[index]) &&
      isTableRow(lines[index + 1] || "") &&
      isTableDivider(lines[index + 1])
    ) {
      const headers = parseTableRow(lines[index]);
      const rows = [];
      index += 2;

      while (index < lines.length && isTableRow(lines[index])) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }

      blocks.push(
        <div className="ai-markdown-table-wrap" key={`table-${index}`}>
          <table>
            <thead>
              <tr>
                {headers.map((header, cellIndex) => (
                  <th key={cellIndex}>{renderInlineMarkdown(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{renderInlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      blocks.push(
        <h3 key={`heading-${index}`}>
          {renderInlineMarkdown(line.replace(/^#{1,3}\s+/, ""))}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];

      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ul key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraph = [line];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !isTableRow(lines[index]) &&
      !/^#{1,3}\s+/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${index}`}>
        {renderInlineMarkdown(paragraph.join(" "))}
      </p>,
    );
  }

  return <div className="ai-markdown">{blocks}</div>;
}

export default function AiAssistant() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(readHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => getStoredTheme("dark"));
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const user = getStoredUser();
  const role = user?.role || "Guest";

  useEffect(() => {
    setTheme(getStoredTheme("dark"));
  }, [location.pathname]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      setTheme(event.detail?.theme || getStoredTheme("dark"));
    };

    window.addEventListener("parkmaster-theme-change", handleThemeChange);
    return () =>
      window.removeEventListener("parkmaster-theme-change", handleThemeChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async (messageText = input) => {
    const message = messageText.trim();
    if (!message || loading) return;

    const previousMessages = messages;
    const userMessage = { role: "user", content: message };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await apiRequest("/api/assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          history: previousMessages.slice(-8),
        }),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.data.reply,
          source: result.data.source,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error.message ||
            "Mình đang không kết nối được với hệ thống. Bạn thử lại sau nhé.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  return (
    <div
      className={`ai-assistant ${theme === "light" ? "ai-assistant-light" : "ai-assistant-dark"}`}
    >
      {open && (
        <section
          className="ai-assistant-panel"
          aria-label="ParkMaster AI assistant"
        >
          <header className="ai-assistant-header">
            <div className="ai-assistant-avatar">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2>ParkMaster Assistant</h2>
              <p>
                <span />
                Online · {role}
              </p>
            </div>
            <button type="button" onClick={resetChat} aria-label="Reset chat">
              <span className="material-symbols-outlined">refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div ref={messagesRef} className="ai-assistant-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`ai-assistant-message ai-assistant-message-${message.role}`}
              >
                {message.role === "assistant" ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  message.content
                )}
              </div>
            ))}
            {loading && (
              <div className="ai-assistant-message ai-assistant-message-assistant ai-assistant-typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {messages.length <= 2 && (
            <div className="ai-assistant-suggestions">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            className="ai-assistant-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              rows="1"
              maxLength="1500"
              placeholder="Hỏi ParkMaster..."
              aria-label="Message ParkMaster assistant"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </form>
          <p className="ai-assistant-note">
            AI có thể sai. Dữ liệu giá và trạng thái được tra cứu từ hệ thống.
          </p>
        </section>
      )}

      <button
        type="button"
        className="ai-assistant-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close ParkMaster assistant" : "Open ParkMaster assistant"}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">
          {open ? "close" : "auto_awesome"}
        </span>
        {!open && <strong>Ask AI</strong>}
      </button>
    </div>
  );
}
