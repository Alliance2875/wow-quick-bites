import type { AuthUser } from "@/lib/redux/slices/authSlice";
import { apiSlice } from "./apiSlice";

export type AuthTokens = {
  access: string;
  refresh: string;
  user: AuthUser;
};

export type SignUpRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  lang?: string;
};

export type ProfilePatch = {
  name?: string;
  phone?: string;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthTokens, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/sign-in/", method: "POST", body }),
    }),
    signUp: builder.mutation<{ email: string; pendingVerification: boolean }, SignUpRequest>({
      query: (body) => ({ url: "/auth/sign-up/", method: "POST", body }),
    }),
    verifyEmail: builder.mutation<AuthTokens, { email: string; code: string }>({
      query: (body) => ({ url: "/auth/verify-email/", method: "POST", body }),
    }),
    resendVerification: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: "/auth/verify-email/resend/", method: "POST", body }),
    }),
    signOut: builder.mutation<void, { refresh: string }>({
      query: (body) => ({ url: "/auth/sign-out/", method: "POST", body }),
    }),
    getAuthMe: builder.query<AuthUser, void>({
      query: () => "/auth/me/",
      providesTags: ["CurrentUser"],
    }),
    updateAuthMe: builder.mutation<AuthUser, ProfilePatch>({
      query: (body) => ({ url: "/auth/me/", method: "PATCH", body }),
      invalidatesTags: ["CurrentUser"],
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => "/me/",
      providesTags: ["CurrentUser"],
    }),
    updateMe: builder.mutation<AuthUser, ProfilePatch>({
      query: (body) => ({ url: "/me/", method: "PATCH", body }),
      invalidatesTags: ["CurrentUser"],
    }),
    changePassword: builder.mutation<
      AuthTokens,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/auth/password/change/", method: "POST", body }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: "/auth/password/forgot/", method: "POST", body }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: (body) => ({ url: "/auth/password/reset/", method: "POST", body }),
    }),
    acceptInvitation: builder.mutation<AuthTokens, { token: string; password: string }>({
      query: (body) => ({ url: "/auth/invitations/accept/", method: "POST", body }),
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useSignOutMutation,
  useGetAuthMeQuery,
  useUpdateAuthMeMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useAcceptInvitationMutation,
} = authApi;
