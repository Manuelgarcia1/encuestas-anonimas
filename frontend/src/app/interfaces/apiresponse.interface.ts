export interface ApiResponse<T> {
  status: string;
  message: string;
  statusCode: number;
  data: T;
}
