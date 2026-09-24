import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { createElement } from "react";

import chatReducer, { toggleModal } from "../features/chat/chatSlice";
import authReducer, {
  setUser,
  setAuthSuccess,
} from "../features/auth/authSlice";
import { openModal as openContactModal } from "../features/contact/contactSlice";

const mockSendStreamMessage = vi.fn();
const mockTriggerHistory = vi.fn();
const mockCancelStream = vi.fn();
let mockIsStreaming = false;

vi.mock("./useChatStream", () => ({
  useChatStream: () => ({
    streamingText: "",
    isStreaming: mockIsStreaming,
    sendStreamMessage: mockSendStreamMessage,
    cancelStream: mockCancelStream,
  }),
}));

vi.mock("../features/chat/chatApi", () => ({
  useLazyGetHistoryQuery: () => [mockTriggerHistory],
  chatApi: {
    reducerPath: "chatApi",
    reducer: (state = {}) => state,
    middleware: () => (next) => (action) => next(action),
  },
}));

vi.mock("../helpers/chatMessageMapper", () => ({
  mapHistoryToMessages: vi.fn((data) => data ?? []),
}));

vi.mock("../config/firebase", () => ({
  auth: { currentUser: null },
}));

vi.mock("../features/contact/contactSlice", () => ({
  openModal: vi.fn(() => ({ type: "contact/openModal" })),
}));

const { useChatPanel } = await import("./useChatPanel.js");

function createStore(overrides = {}) {
  return configureStore({
    reducer: { auth: authReducer, chat: chatReducer },
    preloadedState: {
      auth: {
        user: { uid: "u1" },
        isAuthenticated: true,
        isAdmin: false,
        loading: false,
        error: null,
        modalMode: null,
        profileState: null,
        authSuccess: false,
        enforcedLogout: false,
        ...overrides.auth,
      },
      chat: {
        messages: [],
        isOpen: true,
        loading: false,
        error: null,
        dailyCount: 0,
        ...overrides.chat,
      },
    },
  });
}

function renderPanelHook(store, props) {
  return renderHook(() => useChatPanel(props), {
    wrapper: ({ children }) => createElement(Provider, { store }, children),
  });
}

function resolvedHistory(data = []) {
  return { unwrap: () => Promise.resolve({ data }) };
}

function deferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const UNAUTH = { auth: { user: null, isAuthenticated: false } };

describe("useChatPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsStreaming = false;
    mockSendStreamMessage.mockResolvedValue("completed");
    mockTriggerHistory.mockReturnValue(resolvedHistory());
  });

  describe("doSend", () => {
    it("persists the user message, streams only the question and refreshes history on completion", async () => {
      const store = createStore();
      let messagesAtSend = null;
      mockSendStreamMessage.mockImplementationOnce(() => {
        messagesAtSend = store.getState().chat.messages;
        return Promise.resolve("completed");
      });
      const { result } = renderPanelHook(store, {
        mode: "inline",
        persistState: true,
      });
      await waitFor(() => expect(mockTriggerHistory).toHaveBeenCalledTimes(1));

      await act(async () => {
        result.current.handleSend("q");
      });

      await waitFor(() => expect(mockTriggerHistory).toHaveBeenCalledTimes(2));
      expect(mockSendStreamMessage).toHaveBeenCalledWith("q");
      expect(messagesAtSend).toHaveLength(1);
      expect(messagesAtSend[0]).toMatchObject({ role: "user", content: "q" });
    });

    it("keeps messages local and passes non-persisting callbacks when persistState is false", async () => {
      const store = createStore();
      const { result } = renderPanelHook(store, {
        mode: "inline",
        persistState: false,
      });

      await act(async () => {
        result.current.handleSend("q");
      });

      expect(store.getState().chat.messages).toEqual([]);
      expect(result.current.messages[0]).toMatchObject({
        role: "user",
        content: "q",
      });
      expect(mockSendStreamMessage).toHaveBeenCalledWith("q", {
        persistMessages: false,
        onAiMessage: expect.any(Function),
        onLoadingChange: expect.any(Function),
        onError: expect.any(Function),
        onDailyCount: expect.any(Function),
      });
    });
  });

  describe("unauthenticated send", () => {
    it("opens the login modal without streaming", async () => {
      const store = createStore(UNAUTH);
      const { result } = renderPanelHook(store, {
        mode: "inline",
        persistState: false,
      });

      act(() => {
        result.current.handleSend("q");
      });

      expect(store.getState().auth.modalMode).toBe("login");
      expect(mockSendStreamMessage).not.toHaveBeenCalled();
    });

    it("replays the buffered message once after sign-in when persistState is true", async () => {
      const store = createStore(UNAUTH);
      const { result } = renderPanelHook(store, {
        mode: "inline",
        persistState: true,
      });

      act(() => {
        result.current.handleSend("hi");
      });
      await act(async () => {
        store.dispatch(setUser({ uid: "u1" }));
        store.dispatch(setAuthSuccess(true));
      });

      await waitFor(() =>
        expect(mockSendStreamMessage).toHaveBeenCalledTimes(1),
      );
      expect(mockSendStreamMessage).toHaveBeenCalledWith("hi");
      expect(store.getState().auth.authSuccess).toBe(false);
    });

    it("does not buffer the message when persistState is false", async () => {
      const store = createStore(UNAUTH);
      const { result } = renderPanelHook(store, {
        mode: "inline",
        persistState: false,
      });

      act(() => {
        result.current.handleSend("hi");
      });
      await act(async () => {
        store.dispatch(setUser({ uid: "u1" }));
        store.dispatch(setAuthSuccess(true));
      });

      expect(mockSendStreamMessage).not.toHaveBeenCalled();
    });
  });

  describe("handleKeyDown", () => {
    it("sends on Enter without Shift", async () => {
      const { result } = renderPanelHook(createStore(), {
        mode: "inline",
        persistState: false,
      });
      act(() => {
        result.current.setInput("hello");
      });
      const event = { key: "Enter", shiftKey: false, preventDefault: vi.fn() };

      await act(async () => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockSendStreamMessage).toHaveBeenCalledWith(
        "hello",
        expect.any(Object),
      );
    });

    it("ignores Shift+Enter", () => {
      const { result } = renderPanelHook(createStore(), {
        mode: "inline",
        persistState: false,
      });
      act(() => {
        result.current.setInput("hello");
      });
      const event = { key: "Enter", shiftKey: true, preventDefault: vi.fn() };

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockSendStreamMessage).not.toHaveBeenCalled();
    });
  });

  describe("handleContactRedirect", () => {
    it("closes the chat modal and opens the contact modal in modal mode", () => {
      const store = createStore();
      const { result } = renderPanelHook(store, {
        mode: "modal",
        persistState: false,
      });

      act(() => {
        result.current.handleContactRedirect();
      });

      expect(store.getState().chat.isOpen).toBe(false);
      expect(openContactModal).toHaveBeenCalledTimes(1);
    });

    it("leaves the chat modal state alone in inline mode", () => {
      const store = createStore();
      const { result } = renderPanelHook(store, {
        mode: "inline",
        persistState: false,
      });

      act(() => {
        result.current.handleContactRedirect();
      });

      expect(store.getState().chat.isOpen).toBe(true);
      expect(openContactModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("history guard", () => {
    it("does not fetch history when persistState is false", async () => {
      renderPanelHook(createStore(), { mode: "inline", persistState: false });
      await act(async () => {});
      expect(mockTriggerHistory).not.toHaveBeenCalled();
    });

    it("ignores a history response that resolves while a send is pending", async () => {
      const history = deferred();
      const send = deferred();
      mockTriggerHistory.mockReturnValueOnce({ unwrap: () => history.promise });
      mockSendStreamMessage.mockReturnValueOnce(send.promise);
      const store = createStore();
      const { result } = renderPanelHook(store, {
        mode: "inline",
        persistState: true,
      });

      await act(async () => {
        result.current.handleSend("q");
      });
      await act(async () => {
        history.resolve({ data: [{ role: "ai", content: "stale" }] });
      });

      expect(store.getState().chat.messages).toHaveLength(1);
      expect(store.getState().chat.messages[0]).toMatchObject({
        role: "user",
        content: "q",
      });
      await act(async () => {
        send.resolve("failed");
      });
    });

    it("ignores an older history response that resolves after a newer generation", async () => {
      const first = deferred();
      const second = deferred();
      mockTriggerHistory
        .mockReturnValueOnce({ unwrap: () => first.promise })
        .mockReturnValueOnce({ unwrap: () => second.promise });
      const store = createStore();
      renderPanelHook(store, { mode: "modal", persistState: true });
      await waitFor(() => expect(mockTriggerHistory).toHaveBeenCalledTimes(1));

      await act(async () => {
        store.dispatch(toggleModal());
      });
      await act(async () => {
        store.dispatch(toggleModal());
      });
      await waitFor(() => expect(mockTriggerHistory).toHaveBeenCalledTimes(2));

      await act(async () => {
        second.resolve({ data: [{ role: "ai", content: "fresh" }] });
      });
      await act(async () => {
        first.resolve({ data: [{ role: "ai", content: "stale" }] });
      });

      expect(store.getState().chat.messages).toEqual([
        { role: "ai", content: "fresh" },
      ]);
    });
  });

  // Auto-scroll is intentionally not unit-tested here: jsdom has no layout, scrollHeight is always 0, and such a test could only assert that scrollTop was assigned.
  describe("stream cancellation", () => {
    it("cancels an active stream once when the chat modal closes", () => {
      mockIsStreaming = true;
      const store = createStore();
      renderPanelHook(store, { mode: "modal", persistState: false });

      expect(mockCancelStream).not.toHaveBeenCalled();

      act(() => {
        store.dispatch(toggleModal());
      });

      expect(mockCancelStream).toHaveBeenCalledTimes(1);
    });
  });
});
