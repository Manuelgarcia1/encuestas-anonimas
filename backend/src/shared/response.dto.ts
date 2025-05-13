export class ApiResponse<T> {
  constructor(
    public status: string,
    public message: string,
    public statusCode: number,
    public data?: T,
  ) {}
}
