export class NetBoxHttpError extends Error {
  status: number;
  sanitizedMessage: string;

  constructor(status: number, body: unknown) {
    const detail =
      typeof body === 'object' && body !== null && 'detail' in body
        ? (body as { detail: string }).detail
        : 'NetBox request failed';
    super(detail);
    this.name = 'NetBoxHttpError';
    this.status = status;
    this.sanitizedMessage = detail;
  }
}
