[![Build Status](https://travis-ci.org/bostontrader/polo-catbox.svg?branch=master)](https://travis-ci.org/bostontrader/polo-catbox)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/bostontrader/polo-catbox.svg)](https://david-dm.org/bostontrader/polo-catbox)
[![devDependency Status](https://david-dm.org/bostontrader/polo-catbox/dev-status.svg)](https://david-dm.org/bostontrader/polo-catbox#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/bostontrader/polo-catbox/badge.svg)](https://snyk.io/test/github/bostontrader/polo-catbox)

# Introduction

When writing software to use the Poloniex API we can either use a live set of keys for a real account or a "sandbox".  I for one do not like the idea of using my live keys on the real API and Poloniex does not appear to offer a sandbox.  Hence this package.


# Getting Started

Node 8.4 is a prerequisite.

```
$ git clone http://github.com/bostontrader/polo-catbox
$ cd polo-catbox
$ npm install
$ npm test
$ npm start
```

# Basic Concepts

```npm start``` will start an HTTP server that does its best to mimic the Poloniex server.  Because **polo-catbox** is new and under development, it presently only partially mimics a handful of the API endpoints.

**polo-catbox** uses [restify](https://github.com/restify/node-restify) to provide the server.  It uses [config](https://github.com/lorenwest/node-config) to manage run-time configuration.  Both of these are very malleable but their care and feeding is outside the scope of this document.  If you need fancy features in either of these departments, please consult the relevant documentation.

Among other obvious things, the configuration also contains "test data."  This is the data that the **polo-catbox** will be initially populated with and it is what the testing will compare to results from the server.

When the server is started it will by default tell you that it's "listening at http://[::]:3003"  This means that HTTP requests to http://localhost:3003 or http://127.0.0.1:3003 should work.  You should also be able to access this sever over the network, given the IP of the machine it is running on.  The port is configurable.

```npm test``` will start the server and run a test.  The test sends real Polo API queries to the **polo-catbox** server and expects plausible results.  The test gets the URL and port for the **polo-catbox** server from the configuration.  This app can also be configured so that the test uses a real API Key and secret and sends HTTP requests to the real Polo server.  Please see the configuration section for more info about that.


# API Key and Secret

When using the real Polo server, the API calls must have an API Key in the header to identify the caller.  The API parameters are url encoded, in the body, and are used to compute an HMAC signature, which is sent in the header.  All of this is sent in plain-text over HTTPS.  HTTPS keeps the transmission private and the HMAC signature verifies that only the particular user could have created the message.  I guess that the Polo server can use the API Key to find the secret for that user, compute an HMAC signature of the incoming parameters, and compare to the signature of the incoming request.

When using the **polo-catbox** server, the API Key and secret can be any arbitrary values.  (But probably not crazy things like null or undefined)

In either case the API Key and secret are part of the configuration.


# The API URL

The real Polo server uses https://poloniex.com/tradingApi as the URL for the private API and https://poloniex.com/public for the public API.  The **polo-catbox** server does the same thing but the URL is going to be different.  The difference is configurable.  In order to understand the configuration, let's examine the URLs more closely.

There are four things to consider in these URLs:

* protocol - HTTP or HTTPS?

* host - poloniex.com, localhost, 127.0.0.1 are obvious examples.

* port

* resource - tradingApi or public.  These are application constants and are not configurable.

## WARNING

You _can_ send these queries via HTTP to the real Polo server and it will _work_.  But you probably don't want to do that because your real API Key will be transmitted as plain-text.  So don't do this at home.

# Configuration

By default **polo-catbox** uses the configuration in /config/default.json. The following values are useful if set:

* listeningPort Which port shall the **polo-catbox** listen on?

* catBoxSecret - What secret will the **polo-catbox** use to validate requests?

Testing will need a URL of the API endpoint.  Configure that here.

* url.protocol - HTTP or HTTPS?

* url.host - poloniex.com, localhost, 127.0.0.1 are obvious examples.

* url.port - Omit this to accept default HTTP behavior or set this to match listening_port.

Testing will also need an API Key and a secret:

* keys.apiKey  This specific value is unimportant.

* keys.secret  This specific value is unimportant.  Just make sure it matches catBoxSecret.

## WARNING

You know better than to use your real API Key and secret here, especially anything that's going to get committed to SCM.


# Testing

As mentioned earlier, ```npm test``` will start a test of the **polo-catbox**.  The configuration contains "test data" that the server will use and the test will use to compare to the results.


# Dependencies

* colors - Sometimes I want to print console messages in different colors.

* config - A method of feeding runtime configuration to the server.

* restify - The server.

# devDependencies

* deep-equal - A convenience for testing.

* request - Testing needs a client to make HTTP requests.

* request-promise-native - A wrapper for request which uses Native ES2015 promises instead of callbacks.

# Tipjar
BTC: 1NyKNEAiF5VfSivXi9C9sXbsThpYjz1RUE

LTC: LQiT8imDmeQgErJsohA5DJhXYF2rMkcku8

CLAM: xQs7jvwin9SPy3oBjQyrYTNCZp62pp1qzU
