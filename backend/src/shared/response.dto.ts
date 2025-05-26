// shared/response.dto.ts

type Meta = { total?: number; page?: number; limit?: number };

export class ApiResponse<T = any> {
  public data?: T;
  public creadorEmail?: string;
  public total?: number;
  public page?: number;
  public limit?: number;

  // Sobrecargas para TypeScript
  constructor(
    status: 'success' | 'error',
    message: string,
    statusCode: number,
    data: T,
    meta?: Meta,
  );
  constructor(
    status: 'success' | 'error',
    message: string,
    statusCode: number,
    creadorEmail: string,
    data: T,
    meta?: Meta,
  );

  // Implementación única
  constructor(
    public status: 'success' | 'error',
    public message: string,
    public statusCode: number,
    arg4?: T | string,
    arg5?: T | Meta,
    arg6?: Meta,
  ) {
    // Caso “con email”: 5 ó 6 argumentos, y arg4 es string
    if (typeof arg4 === 'string') {
      this.creadorEmail = arg4;
      this.data = arg5 as T;
      if (arg6) Object.assign(this, arg6);
    } else {
      // Caso “sin email”: 4 ó 5 argumentos, y arg4 es T
      this.data = arg4 as T;
      if (arg5 && this.isMeta(arg5)) {
        Object.assign(this, arg5 as Meta);
      }
    }
  }

  // Helper para distinguir si un objeto es Meta
  private isMeta(obj: any): obj is Meta {
    return (
      obj != null &&
      (typeof obj.total === 'number' ||
        typeof obj.page === 'number' ||
        typeof obj.limit === 'number')
    );
  }
}
