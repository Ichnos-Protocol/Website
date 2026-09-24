import { useEffect } from "react";

import { openAuthModal, setAuthSuccess } from "../features/auth/authSlice";
import { fetchHistoryGuarded } from "../components/molecules/ChatPanel.helpers";

// Effects for useChatPanel. Each takes the panel context built there.
// useChatPanel calls them in a fixed order, so their effects run in that
// order: stream cancel, history sync, auto-scroll, pending-message replay.

export function useStreamCancel({ isModal, isOpen, stream }) {
  const { isStreaming, cancelStream } = stream;
  useEffect(() => {
    if (isModal && !isOpen && isStreaming) cancelStream();
  }, [isOpen, isStreaming, cancelStream, isModal]);
}

function syncHistory(ctx, active) {
  if (ctx.enforcedLogout) {
    ctx.setPendingMessage("");
    return;
  }
  const { dispatch, isAuthenticated } = ctx;
  if (active && !isAuthenticated && ctx.isModal) {
    dispatch(openAuthModal("login"));
  }
  const canFetch = active && isAuthenticated && ctx.persistState;
  if (!canFetch || ctx.sendPendingRef.current) return;
  const { triggerHistory, fetchGenRef, sendPendingRef } = ctx;
  fetchHistoryGuarded(triggerHistory, fetchGenRef, sendPendingRef, dispatch);
}

export function useHistorySync(ctx) {
  const { dispatch, triggerHistory, isModal } = ctx;
  const { isAuthenticated: authed, enforcedLogout: logout } = ctx;
  const persist = ctx.persistState;
  const active = isModal ? ctx.isOpen : true;
  useEffect(() => {
    syncHistory(ctx, active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, authed, logout, isModal, persist, dispatch, triggerHistory]);
}

export function useAutoScroll(listRef, view, { streamingText }) {
  const { messages, loading } = view;
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [listRef, messages.length, loading, streamingText]);
}

export function usePendingReplay(ctx, doSend) {
  const { enforcedLogout, authSuccess, pendingMessage: msg } = ctx;
  useEffect(() => {
    if (enforcedLogout || !ctx.persistState || !authSuccess || !msg) return;
    ctx.setPendingMessage("");
    ctx.dispatch(setAuthSuccess(false));
    doSend(msg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSuccess, enforcedLogout]);
}
