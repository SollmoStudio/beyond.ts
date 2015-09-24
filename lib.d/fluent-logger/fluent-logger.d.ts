declare module 'fluent-logger' {
  export class Logger {
    emit(label: string, message: any, callback: () => void): void;
  }

  export function createFluentSender(tag: string, option: {
    host: string;
    port: string;
  }): Logger;
}
