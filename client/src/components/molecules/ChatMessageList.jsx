import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

import Button from "../atoms/Button";
import { renderInquiryButton } from "./ChatPanel.helpers";
import { RATE_LIMIT_ALERT, AI_UNAVAILABLE_ALERT, GENERIC_ERROR_ALERT, WELCOME_TEXT } from "../../constants/chat";

const bubbleClass = (role) => `chat-panel__bubble chat-panel__bubble--${role === "user" ? "user" : "bot"}`;
const bubbleTestId = (role) => (role === "user" ? "chat-bubble-user" : "chat-bubble-bot");

export default function ChatMessageList({ listRef, messages, isStreaming, streamingText, loading, error, onContactRedirect }) {
  return (
    <div ref={listRef} data-testid="chat-messages" className="chat-panel__messages">
      <div data-testid="chat-bubble-bot" className="chat-panel__bubble chat-panel__bubble--bot">{WELCOME_TEXT}</div>
      {messages.map((m, i) => (
        <div key={i} data-testid={bubbleTestId(m.role)} className={bubbleClass(m.role)}>{m.content}</div>
      ))}
      {isStreaming && streamingText && (
        <div data-testid="chat-bubble-bot" className="chat-panel__bubble chat-panel__bubble--bot">{streamingText}</div>
      )}
      {messages.length > 0 && renderInquiryButton(messages, onContactRedirect)}
      {loading && !isStreaming && <div className="chat-panel__loading"><Spinner animation="border" size="sm" /></div>}
      {error === "rate_limit" && <Alert variant="warning" className="mt-2">{RATE_LIMIT_ALERT}</Alert>}
      {error === "ai_unavailable" && (
        <Alert variant="warning" className="mt-2">
          {AI_UNAVAILABLE_ALERT}
          <div className="mt-2"><Button variant="primary" size="sm" onClick={onContactRedirect}>Leave your question</Button></div>
        </Alert>
      )}
      {error === "generic" && <Alert variant="danger" className="mt-2">{GENERIC_ERROR_ALERT}</Alert>}
    </div>
  );
}
