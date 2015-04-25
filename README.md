# `beyond.js`
The Node.js port of [Beyond](https://github.com/SollmoStudio/beyond).

# Purpose

This is the native Node.js port of the Beyond framework, mainly for the
benchmark usage. We're aiming for supporting basic functionality to run
apps built with the original Beyond, which is built on Scala and Rhino.

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
