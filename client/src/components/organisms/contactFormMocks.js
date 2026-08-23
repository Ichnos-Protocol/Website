import { vi } from "vitest";

// Module mocks shared by the ContactRequestForm test files. Each factory is
// passed straight to vi.mock(); the handles below stay mutable so a test can
// steer a response without redefining the whole module.
const stubSlice = (reducerPath) => ({
  reducerPath,
  reducer: (state = {}) => state,
  middleware: () => (next) => (action) => next(action),
});

export const mocks = {
  submit: vi.fn(),
  unwrap: vi.fn(),
  addQuestion: vi.fn(),
  addQuestionUnwrap: vi.fn(),
  invalidateTags: vi.fn((tags) => ({ type: "consortium/invalidate", tags })),
  consortiumMe: { data: null },
};

export function resetMocks() {
  vi.clearAllMocks();
  mocks.consortiumMe = { data: null };
  window.sessionStorage.clear();
}

export const contactApiMock = () => ({
  useSubmitContactMutation: () => [
    (body) => {
      mocks.submit(body);
      return { unwrap: mocks.unwrap };
    },
    { isLoading: false },
  ],
  useGetMyRequestsQuery: () => ({ data: null }),
  useAddQuestionMutation: () => [
    (body) => {
      mocks.addQuestion(body);
      return { unwrap: mocks.addQuestionUnwrap };
    },
    { isLoading: false },
  ],
  contactApi: stubSlice("contactApi"),
});

export const authApiMock = () => ({
  useGetMeQuery: () => ({ data: { data: { user: { name: "John" } } } }),
  authApi: stubSlice("authApi"),
});

export const consortiumApiMock = () => ({
  useGetConsortiumMeQuery: () => mocks.consortiumMe,
  consortiumApi: {
    ...stubSlice("consortiumApi"),
    util: { invalidateTags: mocks.invalidateTags },
  },
});

export const firebaseMock = () => ({ auth: { currentUser: null } });
