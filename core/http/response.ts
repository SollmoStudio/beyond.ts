import _ = require('underscore');

class Response {
  body: string | IResponse;
  statusCode: number;
  headers: IHeaders = { };

  constructor(body: string | IResponse, contentType?: string, statusCode?: number) {
    this.body = body;

    if (contentType) {
      this.contentType = contentType;
    } else {
      this.contentType = typeof this.body === 'string' ? 'text/plain' : 'application/json';
    }

    this.statusCode = statusCode ? statusCode : 200;
  }

  setHeaders(object: IHeaders) {
    this.headers = _.extend(this.headers, object);
  }

  get contentType() {
    return this.headers['Content-Type'];
  }

  set contentType(cType: string) {
    this.headers['Content-Type'] = cType;
  }
}

export = Response;
