[![Build Status](https://travis-ci.org/bostontrader/polo-catbox.svg?branch=master)](https://travis-ci.org/bostontrader/polo-catbox)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/bostontrader/polo-catbox.svg)](https://david-dm.org/bostontrader/polo-catbox)
[![devDependency Status](https://david-dm.org/bostontrader/polo-catbox/dev-status.svg)](https://david-dm.org/bostontrader/polo-catbox#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/bostontrader/polo-catbox/badge.svg)](https://snyk.io/test/github/bostontrader/polo-catbox)

# Introduction

When writing software to use the Poloniex API we can either use a live set of keys for a real account or a "sandbox".  I for one do not like the idea of using my live keys on the real API and Poloniex does not appear to offer a sandbox.  Hence **polo-catbox**.


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

```npm start``` will start an HTTP server that does its best to mimic the Poloniex server.  Because **polo-catbox** is new and under development, it presently only partially mimics a handful of the API endpoints.  At present, it also does not support the push API.

**polo-catbox** uses [restify](https://github.com/restify/node-restify) to implement the server.  It uses [config](https://github.com/lorenwest/node-config) to manage run-time configuration.  Both of these are very malleable but their care and feeding is outside the scope of this document.  If you need fancy features in either of these departments, please consult the relevant documentation.

When the server is started it will by default tell you that it's "listening at http://[::]:3003"  This means that HTTP requests to http://localhost:3003 or http://127.0.0.1:3003 should work.  You should also be able to access this sever over the network, given the IP of the machine it is running on.  The port is configurable.

```npm test``` will start the server and run a test.  The test sends real Polo API queries to the **polo-catbox** server and expects plausible results.  The test gets the URL and port for the **polo-catbox** server from the configuration.


# Digging Deeper

As stated earlier, **polo-catbox** mimics the real Polo server.  However, as usual, doing so is easier said than done.

There are some obvious, and not so obvious issues with doing this.  One important type of problem is that there are certain conditions that we should test, but which we'll probably never encounter in the wild.  For example, what happens if you request returnTradeHistory on a server with zero trades?  Will the server return an empty array, return an error, explode, do something else?  Should you ignore this in your testing? Should the CatBox make assumptions about this?

Another issue is that we cannot actually perform all desired operations on the server using only the API.  An example of this is that we cannot make deposits using the API.  Since we can't do this with the API your software will not do it either and thus there's no need for testing.  But we still need some method of injecting this information into the server state.

Another issue is how carefully should we test API results.  Is an examination of the shape enough or shall we inspect the contents as well?  Should we count the elements in an array?  How do we know how many to expect?  Should we examine the shape of the array elements also?  Should we examine the actual content of each array element?  And in the case where results are aggregates such as sums of many trades, how do we know what the expected values should be?

A final and related issue is where to draw the line with testing.  You obviously want to test your software, but you want to avoid testing Polo's software.  Or do you?  The API docs are rather sparse and have a lot of blind spots in them.  We might want to do some charactarization testing.  If you are sending queries but not able to observe results, perhaps you're tripping over an obscure nuance of Polo's use of the input parameters.

# Server Operation

When the server starts it has a minimal state that it gets from the configuration.  Said state includes:

* An API key and secret for two users, Thing1 and Thing2.

* A collection of currencies that can be used.

* A collection of prior deposits of any currency for any user.

* A collection of acceptable markets that can be used.

These items cannot be added via the API and must be present in order to use the API.  Thus their insertion here.

Your test can further modify the state by submitting any request that modifies the state. When you do this you will need a set of credentials.  You can use Thing1 as the test subject user and  Thing2 as "all the other market participants."  In this way you can setup the market to be as elaborate as you like.  You could even add additional users if you like.


# API Key and Secret

The HTTP requests to the server come in two flavors.  There are the "public" API and "private" API endpoints.  This is important because they are handled quite differently.

The public API requests are delivered via GET and no auth 'n' auth is used.  Any anonymous fool can call these and get the public results.

The private API requests are delivered via POST and there _are_ auth 'n' auth hoops to jump through in order to do this.  We use an API Key and a "secret" for this purpose.

When using the real Polo server, the private API requests must have an API Key in the header to identify the caller.  The API parameters are url encoded, in the body, and are used to compute an HMAC signature, which is also sent in the header.  All of this is sent in plain-text over HTTPS.  HTTPS keeps the transmission private and the HMAC signature verifies that only the particular user could have created the message.  I guess that the Polo server can use the API Key to find the secret for that user, compute an HMAC signature of the incoming parameters, and compare to the signature of the incoming request.

When using the **polo-catbox** server, the API Key and secret can be any arbitrary, but configured, values.  (But probably not crazy things like null or undefined).


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

* listeningPort - Which port shall the **polo-catbox** listen on?

* credentials - Each key within is an API Key that has its associated secret

Testing will need a URL of the API endpoint.  Configure that here.

* url.protocol - HTTP or HTTPS?

* url.host - poloniex.com, localhost, 127.0.0.1 are obvious examples.

* url.port - Omit this to accept default HTTP behavior or set this to match listening_port.


# Testing

As mentioned earlier, ```npm test``` will start a test of the **polo-catbox**.  The configuration contains "test data" that the server will use and the test will use to compare to the results.


# Testing the Real Polo Server

It's tempting to configure this app to send the queries to the real Polo server, but I discourage you from doing so.  Although you _can_ do it and it _might_ seemingly _work_ there are a number of hazards to be wary of.  Such as:

* Any test that will change the state of real data, such as to place or cancel orders, lock the catdoor, launch missiles, etc., may have unpleasant real-world side-effects.  Don't do this at home.

* Any test is going to need real credentials somewhere.  Are you going to hardwire them into code or put them into the configuration?  If so, be careful that you don't let this into your SCM system.  Are you going to only have these values on the command line?  If so, keep an eye on .bash_history and others of similar ilk.

* If you're not careful to ensure that the requests are sent via HTTPS you might get HTTP instead.  If so, your API Key will be exposed.  Although your determined opponent does not have your secret (by this faux pas) he's one step closer to getting in.

* How many other ways are there for this to go wrong?  I don't know and contemplating, and fortifying against, the myraid of ways this topic could have an unhappy ending, is a distraction from this project and thus further affiant sayeth nought.

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
