function convertToJSON(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

export = convertToJSON;
