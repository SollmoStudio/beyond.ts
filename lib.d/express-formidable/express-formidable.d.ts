// Generated by dts-bundle v0.3.0
// Dependencies for this module:
//   ../lib.d/express/express.d.ts

declare module 'express-formidable' {
    import express = require('express');
    export interface IOption {
    }
    export type Middleware = (option?: IOption) => express.RequestHandler;
    export const parse: Middleware;
}

