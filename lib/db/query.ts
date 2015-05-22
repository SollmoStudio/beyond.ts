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
}

export = Query;
