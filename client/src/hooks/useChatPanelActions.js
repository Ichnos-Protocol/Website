import { addMessage, toggleModal, clearError } from "../features/chat/chatSlice";
import { openModal as openContactModal } from "../features/contact/contactSlice";
import { openAuthModal } from "../features/auth/authSlice";
import {
  refreshHistorySafely,
  buildLocalStreamOptions,
} from "../components/molecules/ChatPanel.helpers";

// Send and UI handlers for useChatPanel. Each takes the panel context built
// there. Persisted panels write to Redux; local panels write to local state.

function appendUserMessage(ctx, userMsg) {
  if (ctx.persistState) {
    ctx.dispatch(addMessage(userMsg));
    ctx.dispatch(clearError());
    return;
  }
  ctx.local.setMessages((p) => [...p, userMsg]);
  ctx.local.setError(null);
}

function streamReply({ persistState, stream, local }, content) {
  if (persistState) return stream.sendStreamMessage(content);
  return stream.sendStreamMessage(content, buildLocalStreamOptions(local));
}

export function useSendMessage(ctx) {
  const { dispatch, persistState, sendPendingRef } = ctx;
  const { triggerHistory, fetchGenRef } = ctx;
  return async (content) => {
    sendPendingRef.current = true;
    const timestamp = new Date().toISOString();
    appendUserMessage(ctx, { role: "user", content, timestamp });
    ctx.setInput("");
    const outcome = await streamReply(ctx, content);
    if (outcome === "completed" && persistState) {
      await refreshHistorySafely(triggerHistory, fetchGenRef, dispatch);
    }
    sendPendingRef.current = false;
  };
}

function promptLogin(ctx, content) {
  if (ctx.persistState) ctx.setPendingMessage(content);
  ctx.dispatch(openAuthModal("login"));
}

function redirectToContact({ dispatch, isModal }) {
  if (isModal) dispatch(toggleModal());
  dispatch(openContactModal());
}

export function useChatHandlers(ctx, doSend) {
  const handleSend = (content = ctx.input.trim()) => {
    if (!content) return;
    if (!ctx.isAuthenticated) return promptLogin(ctx, content);
    doSend(content);
  };
  const handleContactRedirect = () => redirectToContact(ctx);
  const handleKeyDown = (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    handleSend();
  };
  return { handleSend, handleKeyDown, handleContactRedirect };
}
