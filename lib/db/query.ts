class Query {
  private _query: Object;
  get query(): Object {
    return this._query;
  }

  constructor(query: Object = {}) {
    this._query = query;
  }
}

export = Query;
