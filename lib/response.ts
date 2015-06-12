class Response {
  body: string | IResponse;
  contentType: string;
  statusCode: number;
  constructor(body: string | IResponse, contentType?: string, statusCode?: number) {
    this.body = body;

    this.contentType = contentType;
    if (!this.contentType) {
      this.contentType = typeof this.body === 'string' ? 'text/plain' : 'application/json';
    }

    this.statusCode = statusCode ? statusCode : 200;
  }
}

export = Response;
