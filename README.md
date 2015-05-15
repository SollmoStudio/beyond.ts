# `beyond.ts`
The TypeScript port of [Beyond](https://github.com/SollmoStudio/beyond).

# Purpose

This is the TypeScript port of the Beyond framework to make it work on the
Node.js platform. We're aiming for supporting full functionality to run apps
built with the original Beyond, which is built on Scala and Rhino.

# How to use

Set `config/app.json`:

```bash
$ cp config/app.json.sample config/app.json
$ vi config/app.json
```

After the configuration:

```bash
$ npm install
$ npm install -g gulp
$ gulp run
```

Test:

```bash
$ gulp test
```

# License

Apache License, Version 2.0
