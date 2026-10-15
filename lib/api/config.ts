export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://wow-quick-bites-backend-ziwt.onrender.com/api/v1";

export const ACCESS_TOKEN_COOKIE = "wqb_access_token";
export const REFRESH_TOKEN_COOKIE = "wqb_refresh_token";

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string | string[]>;
  };
};

export class ApiError extends Error {
  code: string;
  details?: Record<string, string | string[]>;
  status: number;

  constructor(status: number, error: ApiErrorResponse["error"]) {
    super(error.message);
    this.name = "ApiError";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}
