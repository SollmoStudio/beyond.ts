export class Response {
  body: string | IResponse;
  contentType: string;
  statusCode: number;
  constructor(body: string | IResponse, contentType?: string, statusCode?: number) {
    let isBodyString = typeof body === 'string';
    this.body = isBodyString ? body : JSON.stringify(body);

    this.contentType = contentType;
    if (!this.contentType) {
      this.contentType = isBodyString ? 'text/plain' : 'application/json';
    }

    this.statusCode = statusCode ? statusCode : 200;
  }
}
