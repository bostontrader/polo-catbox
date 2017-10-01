//const PoloAdapter = require('./polo-adapter')

// Make a private API request
const _private = (command, parameters) {
  //var options;

  //if (typeof parameters === 'function') {
    //callback = parameters;
    //parameters = {};
  //}

  //parameters || (parameters = {});
  //parameters.command = command;
  //parameters.nonce = this.base_nonce + Date.now() * 1000;
  //console.log(118, parameters.nonce)
  //options = {
    //method: 'POST',
    //url: PRIVATE_API_URL,
    //form: parameters,
    //headers: this._getPrivateHeaders(parameters)
  //};
  //var self = this
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
     // }
    //} else {
      //callback(err, body)
   // }
  //});
}


const apiKey = 'key'
const privateKey = 'private'
const privateAPIURL = 'localhost:3000'

