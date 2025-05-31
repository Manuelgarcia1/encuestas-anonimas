export interface RequestAccessResponse {
  status: string;
  message: string;
  statusCode: number;
  data: {
    token: string;
  };
}
