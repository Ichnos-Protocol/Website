import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";

import { DAILY_MESSAGE_LIMIT, DISCLAIMER_TEXT } from "../../constants/chat";
import { useChatPanel } from "../../hooks/useChatPanel";
import Button from "../atoms/Button";
import ChatMessageList from "./ChatMessageList";

export default function ChatPanel({ mode, persistState }) {
  const { messages, loading, error, dailyCount, input, setInput, isModal, isStreaming, streamingText, listRef, handleSend, handleKeyDown, handleContactRedirect } = useChatPanel({ mode, persistState });

  return (
    <div data-testid="chat-panel" className={`chat-panel ${isModal ? "chat-panel--modal" : "chat-panel--inline"}`}>
      <ChatMessageList listRef={listRef} messages={messages} isStreaming={isStreaming} streamingText={streamingText} loading={loading} error={error} onContactRedirect={handleContactRedirect} />
      <Badge bg="secondary" className="chat-panel__count">Messages today: {dailyCount} / {DAILY_MESSAGE_LIMIT}</Badge>
      {error !== "rate_limit" && (
        <div className="chat-panel__input-row">
          <Form.Control data-testid="chat-input" type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message…" disabled={loading} className="chat-panel__input" />
          <Button data-testid="chat-send-btn" variant="primary" onClick={() => handleSend()} disabled={loading || !input.trim()} className="chat-panel__send-btn" aria-label="Send message">
            <i className="bi bi-send-fill" aria-hidden="true" />
          </Button>
        </div>
      )}
      <p data-testid="chat-panel-disclaimer" className="chat-panel__disclaimer">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
