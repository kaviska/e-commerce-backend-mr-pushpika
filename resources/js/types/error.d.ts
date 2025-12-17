
declare interface ApiError {
  status: "error";
  message: string | null;
  errors: string | string[] | null;
}
