interface Dict<T> {
  [key: string]: T;
}

interface IPlugin {
  handle: (req: Express.Request, res: Express.Response) => void;
}

interface IResponse {
  [key: string]: number | string | boolean | number[] | string[] | boolean[]
               | IResponse | IResponse[];
}

interface IHeaders {
  [key: string]: string;
}
