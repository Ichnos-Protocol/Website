import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useLazyGetHistoryQuery } from "../features/chat/chatApi";
import { useChatStream } from "./useChatStream";
import {
  useStreamCancel,
  useHistorySync,
  useAutoScroll,
  usePendingReplay,
} from "./useChatPanelEffects";
import { useSendMessage, useChatHandlers } from "./useChatPanelActions";

// Owns ChatPanel's state, refs, effects and handlers. ChatPanel itself is
// presentational: it renders what this hook returns. useChatPanel builds one
// context object and calls the effect hooks in a fixed order, so their
// effects run in that order: stream cancel, history sync, auto-scroll,
// pending-message replay.

function useLocalChatState() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dailyCount, setDailyCount] = useState(0);
  const values = { messages, loading, error, dailyCount };
  const setters = { setMessages, setLoading, setError, setDailyCount };
  return { ...values, ...setters };
}

function usePanelState() {
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const listRef = useRef(null);
  const sendPendingRef = useRef(false);
  const fetchGenRef = useRef(0);
  const refs = { listRef, sendPendingRef, fetchGenRef };
  return { input, setInput, pendingMessage, setPendingMessage, ...refs };
}

function selectChatView(persistState, reduxChat, local) {
  const src = persistState ? reduxChat : local;
  const { messages, loading, error, dailyCount } = src;
  return { messages, loading, error, dailyCount };
}

function buildChatContext({ panel, reduxChat, auth, mode, ...rest }) {
  return {
    ...panel,
    ...rest,
    reduxChat,
    isModal: mode === "modal",
    isOpen: reduxChat.isOpen,
    isAuthenticated: auth.isAuthenticated,
    authSuccess: auth.authSuccess,
    enforcedLogout: auth.enforcedLogout,
  };
}

function useChatContext(mode, persistState) {
  const dispatch = useDispatch();
  const reduxChat = useSelector((s) => s.chat);
  const auth = useSelector((s) => s.auth);
  const local = useLocalChatState();
  const panel = usePanelState();
  const stream = useChatStream();
  const [triggerHistory] = useLazyGetHistoryQuery();
  const parts = { panel, reduxChat, auth, mode, persistState };
  return buildChatContext({
    ...parts,
    dispatch,
    triggerHistory,
    stream,
    local,
  });
}

function buildPanelResult(ctx, view, handlers) {
  const { input, setInput, isModal, listRef } = ctx;
  const { isStreaming, streamingText } = ctx.stream;
  const out = { input, setInput, isModal, isStreaming, streamingText, listRef };
  return { ...view, ...out, ...handlers };
}

export function useChatPanel({ mode, persistState }) {
  const ctx = useChatContext(mode, persistState);
  const view = selectChatView(persistState, ctx.reduxChat, ctx.local);
  useStreamCancel(ctx);
  useHistorySync(ctx);
  useAutoScroll(ctx.listRef, view, ctx.stream);
  const doSend = useSendMessage(ctx);
  usePendingReplay(ctx, doSend);
  const handlers = useChatHandlers(ctx, doSend);
  return buildPanelResult(ctx, view, handlers);
}
