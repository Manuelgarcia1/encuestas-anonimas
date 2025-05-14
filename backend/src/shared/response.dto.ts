export class ApiResponse<T = any> {
  constructor(
    public status: 'success' | 'error',
    public message: string,
    public statusCode: number,
    public data?: T,
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
    }
  ) {
    if (meta) {
      Object.assign(this, meta);
    }
  }
}
