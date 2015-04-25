import express = require('express');
import querystring = require('querystring');

class Request {
  private req: express.Request;

  constructor(req: express.Request) {
    this.req = req;
  }

  get bodyAsText(): string {
    if (this.contentType === 'application/x-www-form-urlencoded') {
      return querystring.stringify(this.req.body);
    } else {
      return JSON.stringify(this.req.body);
    }
  }

  get bodyAsFormUrlEncoded(): any {
    return this.req.body;
  }

  get bodyAsJsonString(): string {
    return JSON.stringify(this.req.body);
  }

  get bodyAsJson(): any {
    return this.req.body;
  }

  get method(): string {
    return this.req.method;
  }

  get uri(): string {
    let tokens = this.req.path.substring(1).split('/');
    tokens.splice(1, 1);
    return '/' + tokens.join('/');
  }

  get contentType(): string {
    return this.req.get('content-type');
  }

  get secure(): boolean {
    return this.req.secure;
  }

  get headers(): Dict<string> {
    return this.req.headers;
  }
}

export = Request;
