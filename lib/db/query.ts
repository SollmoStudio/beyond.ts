class Query {
  private _query: Object;
  get query(): Object {
    return this._query;
  }

  constructor(query: Object = {}) {
    this._query = query;
  }


  static eq<T>(field: string, value: T) {
    return new Query({ [field]: value });
  }
  static ne<T>(field: string, value: T) {
    return new Query({ [field]: { '$ne': value } });
  }

  static lt<T>(field: string, value: T) {
    return new Query({ [field]: { '$lt': value } });
  }
  static gt<T>(field: string, value: T) {
    return new Query({ [field]: { '$gt': value } });
  }

  static lte<T>(field: string, value: T) {
    return new Query({ [field]: { '$lte': value } });
  }
  static gte<T>(field: string, value: T) {
    return new Query({ [field]: { '$gte': value } });
  }

  static in<T>(field: string, value: T[]): Query {
    return new Query({ [field]: { '$in': value } });
  }
  static nin<T>(field: string, value: T[]): Query {
    return new Query({ [field]: { '$nin': value } });
  }

  static where(fn: () => boolean): Query;
  static where(fn: string): Query;
  static where(fn: any): Query {
    return new Query({ '$where': fn });
  }

  static and(...queries: Query[]): Query {
    let internalQueries = queries.map((query: Query): any => { return query.query; });
    return new Query({ '$and': internalQueries });
  }

  static or(...queries: Query[]): Query {
    let internalQueries = queries.map((query: Query): any => { return query.query; });
    return new Query({ '$or': internalQueries });
  }


  eq<T>(field: string, value: T) {
    return Query.and(this, Query.eq(field, value));
  }
  ne<T>(field: string, value: T) {
    return Query.and(this, Query.ne(field, value));
  }

  lt<T>(field: string, value: T) {
    return Query.and(this, Query.lt(field, value));
  }
  gt<T>(field: string, value: T) {
    return Query.and(this, Query.gt(field, value));
  }

  lte<T>(field: string, value: T) {
    return Query.and(this, Query.lte(field, value));
  }
  gte<T>(field: string, value: T) {
    return Query.and(this, Query.gte(field, value));
  }

  in<T>(field: string, value: T[]): Query {
    return Query.and(this, Query.in(field, value));
  }
  nin<T>(field: string, value: T[]): Query {
    return Query.and(this, Query.nin(field, value));
  }

  where(fn: () => boolean): Query;
  where(fn: string): Query;
  where(fn: any): Query {
    return Query.and(this, Query.where(fn));
  }

  and(...queries: Query[]): Query {
    let internalQueries = queries.map((query: Query): any => { return query.query; });
    internalQueries.unshift(this.query);
    return new Query({ '$and': internalQueries });
  }

  or(...queries: Query[]): Query {
    let internalQueries = queries.map((query: Query): any => { return query.query; });
    internalQueries.unshift(this.query);
    return new Query({ '$or': internalQueries });
  }
}

export = Query;
