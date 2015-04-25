interface Dict<T> {
  [key: string]: T;
}

interface IPlugin {
  handle: (action: string, callback: IPluginCallback) => void;
}

interface IPluginCallback {
  (err: Error, resObj: any);
}
