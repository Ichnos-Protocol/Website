import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_BASE_URL } from "../../constants/api";

export const consortiumApi = createApi({
  reducerPath: "consortiumApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      const { auth } = await import("../../config/firebase");
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken();
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Consortium"],
  endpoints: (builder) => ({
    getConsortiumMe: builder.query({
      query: () => "/api/consortium/me",
      providesTags: ["Consortium"],
    }),
    getTiers: builder.query({
      query: () => "/api/consortium/tiers",
      providesTags: ["Consortium"],
    }),
    setTier: builder.mutation({
      query: (tier) => ({
        url: "/api/consortium/tier",
        method: "PUT",
        body: { tier },
      }),
      invalidatesTags: ["Consortium"],
    }),
  }),
});

export const { useGetConsortiumMeQuery, useGetTiersQuery, useSetTierMutation } =
  consortiumApi;
