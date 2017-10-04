module.exports = (function() {

  // Module dependencies
  const crypto  = require('crypto')
  const request = require('request')
  const rp      = require('request-promise-native')
  // nonce   = require('nonce')();

  // Constants
  var version         = '0.0.8',
    USER_AGENT      = 'poloniex.js ' + version;

  // Constructor
  function PoloAdapter(key, secret, base_nonce, baseURL) {

    // Generate headers signed by this user's key and secret.
    // The secret is encapsulated and never exposed
    this.base_nonce = base_nonce || 0
    this.baseURL = baseURL
    this._getPrivateHeaders = function(parameters) {
      var paramString, signature;

      if (!key || !secret)
        throw 'PoloAdapter: Error. API key and secret required';

      // Convert to `arg1=foo&arg2=bar`
      paramString = Object.keys(parameters).map(function(param) {
        return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
      }).join('&');

      signature = crypto.createHmac('sha512', secret).update(paramString).digest('hex');

      return {
        Key: key,
        Sign: signature
      };
    };
  }

  // Currently, this fails with `Error: CERT_UNTRUSTED`
  // PoloAdapter.STRICT_SSL can be set to `false` to avoid this. Use with caution.
  // Will be removed in future, once this is resolved.
  PoloAdapter.STRICT_SSL = true;

  // Customisable user agent string
  PoloAdapter.USER_AGENT = USER_AGENT;

  // Prototype
  PoloAdapter.prototype = {
    constructor: PoloAdapter,

    // Make an API request
    _request: async options => {
      //if (!('headers' in options))
        //options.headers = {};

      //options.json = true;
      //options.headers['User-Agent'] = PoloAdapter.USER_AGENT;
      //options.strictSSL = PoloAdapter.STRICT_SSL;
      //request(options, function(err, response, body) {
        // Empty response
        //if (!err && (typeof body === 'undefined' || body === null))
          //err = 'Empty response';

        //callback(err, body);
      //});

      return JSON.parse(await rp(options))
      //return this;
    },

    // Make a public API request
    _public: async function(command, parameters = {}) {

      //parameters || (parameters = {});
      parameters.command = command
      const options = {
        method: 'GET',
        url: this.baseURL + "/public",
        qs: parameters
      }

      //options.qs.command = command;
      //return this._request(options, callback);
      return await this._request(options)

    },

    // Make a private API request
    _private: async function(command, parameters) {

      //parameters || (parameters = {});
      parameters.command = command;
      //parameters.nonce = this.base_nonce + Date.now() * 1000;
      const options = {
        method: 'POST',
        url: this.baseURL + "/tradingApi",
        form: parameters,
        headers: this._getPrivateHeaders(parameters)
      }
      //var self = this
      return await this._request(options)

      //this._request(options, function(err, body) {
        //if(err || body.error) {
          //console.log(err || body.error)
          // if(body.error.match(/^Nonce must be greater than ([0-9]+)\. You provided ([0-9]+)\./)) {
          //   self._private(command, parameters, callback, false)
          // } else {
          //   self._private(command, parameters, callback, false)
          // }
          //if(retry) {
            //setTimeout(function() {
              //self._private(command, parameters, callback, false)
            //}, 500)
          //}
        //} else {
          //callback(err, body)
        //}
      //});
    },

    /////
    // PUBLIC METHODS
    returnTicker: async function () {return await this._public('returnTicker')},
    return24Volume: async function () {return await this._public('return24Volume')},

    /*
    returnOrderBook: function(currencyA, currencyB, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._public('returnOrderBook', parameters, callback);
    },

    returnChartData: function(currencyA, currencyB, period, start, end, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        period: period,
        start: start,
        end: end
      };

      return this._public('returnChartData', parameters, callback);
    },

    returnCurrencies: function(callback) {
      return this._public('returnCurrencies', callback);
    },

    returnLoanOrders: function(currency, callback) {
      return this._public('returnLoanOrders', {currency: currency}, callback);
    },*/

    /////
    // PRIVATE METHODS

    /*returnBalances: function(callback) {
      return this._private('returnBalances', {}, callback);
    },

    returnCompleteBalances: function(callback) {
      return this._private('returnCompleteBalances', {}, callback);
    },

    returnDepositAddresses: function(callback) {
      return this._private('returnDepositAddresses', {}, callback);
    },

    generateNewAddress: function(currency, callback) {
      return this._private('returnDepositsWithdrawals', {currency: currency}, callback);
    },*/

    returnDepositsWithdrawals: async function (start, end) {
      return await this._private('returnDepositsWithdrawals', {start, end})
    },

    returnOpenOrders: async function (currencyPair) {
      return await this._private('returnOpenOrders', {currencyPair})
    }

    /*returnOpenOrders: function(currencyA, currencyB, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._private('returnOpenOrders', parameters, callback);
    },

    returnTradeHistory: function(currencyA, currencyB, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._private('returnTradeHistory', parameters, callback);
    },

    returnOrderTrades: function(orderNumber, callback) {
      var parameters = {
        orderNumber: orderNumber
      };

      return this._private('returnOrderTrades', parameters, callback);
    },

    buy: function(currencyA, currencyB, rate, amount, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        rate: rate,
        amount: amount
      };

      return this._private('buy', parameters, callback);
    },

    sell: function(currencyA, currencyB, rate, amount, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        rate: rate,
        amount: amount
      };

      return this._private('sell', parameters, callback);
    },

    cancelOrder: function(currencyA, currencyB, orderNumber, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        orderNumber: orderNumber
      };

      return this._private('cancelOrder', parameters, callback);
    },

    moveOrder: function(orderNumber, rate, amount, callback) {
      var parameters = {
        orderNumber: orderNumber,
        rate: rate,
        amount: amount ? amount : null
      };

      return this._private('moveOrder', parameters, callback);
    },

    withdraw: function(currency, amount, address, callback) {
      var parameters = {
        currency: currency,
        amount: amount,
        address: address
      };

      return this._private('withdraw', parameters, callback);
    },

    returnFeeInfo: function(callback) {
      return this._private('returnFeeInfo', {}, callback);
    },

    returnAvailableAccountBalances: function(account, callback) {
      var options = {};
      if (account)
        options.account = account;
      return this._private('returnAvailableAccountBalances', options, callback);
    },

    returnTradableBalances: function(callback) {
      return this._private('returnTradableBalances', {}, callback);
    },

    transferBalance: function(currency, amount, fromAccount, toAccount, callback) {
      var parameters = {
        currency: currency,
        amount: amount,
        fromAccount: fromAccount,
        toAccount: toAccount
      };

      return this._private('transferBalance', parameters, callback);
    },

    returnMarginAccountSummary: function(callback) {
      return this._private('returnMarginAccountSummary', {}, callback);
    },

    marginBuy: function(currencyA, currencyB, rate, amount, lendingRate, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        rate: rate,
        amount: amount,
        lendingRate: lendingRate ? lendingRate : null
      };

      return this._private('marginBuy', parameters, callback);
    },*/

    //marginSell: function(currencyA, currencyB, rate, amount, lendingRate, callback) {
      //var parameters = {
        //currencyPair: joinCurrencies(currencyA, currencyB),
        //rate: rate,
        //amount: amount,
        //lendingRate: lendingRate ? lendingRate : null
      //};

      //return this._private('marginSell', parameters, callback);
    //},

    /*getMarginPosition: function(currencyA, currencyB, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._private('getMarginPosition', parameters, callback);
    },

    closeMarginPosition: function(currencyA, currencyB, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };

      return this._private('closeMarginPosition', parameters, callback);
    },

    createLoanOffer: function(currency, amount, duration, autoRenew, lendingRate, callback) {
      var parameters = {
        currency: currency,
        amount: amount,
        duration: duration,
        autoRenew: autoRenew,
        lendingRate: lendingRate
      };

      return this._private('createLoanOffer', parameters, callback);
    },

    cancelLoanOffer: function(orderNumber, callback) {
      var parameters = {
        orderNumber: orderNumber
      };

      return this._private('cancelLoanOffer', parameters, callback);
    },*/

    //returnOpenLoanOffers: function(callback) {
      //return this._private('returnOpenLoanOffers', {}, callback);
    //},

    //returnActiveLoans: function(callback) {
      //return this._private('returnActiveLoans', {}, callback);
    //},

    //returnLendingHistory: function(start, end, limit, callback) {
      //var parameters = {
        //start: start,
        //end: end,
        //limit: limit
      //};

      //return this._private('returnLendingHistory', parameters, callback);
    //},

    //toggleAutoRenew: function(orderNumber, callback) {
      //return this._private('toggleAutoRenew', {orderNumber: orderNumber}, callback);
    //}

  }

  return PoloAdapter
})()
