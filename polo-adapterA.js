const version = '0.9.0'
const USER_AGENT = 'github.com/bostontrader/polo-adapter ' + version

const crypto = require('crypto')
const rp = require('request-promise-native')

module.exports = (function () {

  function PoloAdapter (key, secret, baseNonce, baseURL) {
    // Generate headers signed by this user's key and secret.
    // The secret is encapsulated and never exposed
    this.baseNonce = baseNonce || 0
    this.baseURL = baseURL
    this._getPrivateHeaders = function (parameters) {
      let paramString, signature

      if (!key || !secret) { throw new Error('PoloAdapter: Error. API key and secret required') }

      // Convert to `arg1=foo&arg2=bar`
      paramString = Object.keys(parameters).map(param => encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param])).join('&')
      signature = crypto.createHmac('sha512', secret).update(paramString).digest('hex')
      return {Key: key, Sign: signature}
    }
  }

  // Currently, this fails with `Error: CERT_UNTRUSTED`
  // PoloAdapter.STRICT_SSL can be set to `false` to avoid this. Use with caution.
  // Will be removed in future, once this is resolved.
  PoloAdapter.STRICT_SSL = true

  PoloAdapter.USER_AGENT = USER_AGENT

  PoloAdapter.prototype = {
    constructor: PoloAdapter,

    // Make an API request
    _request: async options => {
      return JSON.parse(await rp(options))
    },

    // Make a public API request
    _public: async function (command, parameters = {}) {
      parameters.command = command
      const options = {
        method: 'GET',
        url: this.baseURL + '/public',
        qs: parameters
      }

      return this._request(options)
    },

    // Make a private API request
    _private: async function (command, parameters) {
      parameters.command = command
      parameters.nonce = Date.now() * 1000

      const options = {
        method: 'POST',
        url: this.baseURL + '/tradingApi',
        form: parameters,
        headers: this._getPrivateHeaders(parameters)
      }
      return this._request(options)
    }

    // Undocumented
    // returnLendingPrivateInfo: async function () { return this._private('returnLendingPrivateInfo', {}) }

  }

  return PoloAdapter
})()
