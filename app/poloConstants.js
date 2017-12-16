module.exports = {

  buy: {
    INVALID_AMOUNT_PARAMETER: 'Invalid amount parameter.',
    INVALID_CURRENCY_PAIR_PARAMETER: 'Invalid currencyPair parameter.',
    INVALID_RATE_PARAMETER: 'Invalid rate parameter.',
    NO_MORE_THAN_ONE: 'No more than one of the post-only, fill-or-kill, and immediate-or-cancel flags should be set at the same time.',
    NOT_ENOUGH: 'Not enough',
    REQUIRED_PARAMETER_MISSING: 'Required parameter missing.',
    TOTAL_MUST_BE_AT_LEAST_0_0001: 'Total must be at least 0.0001.',
    UNABLE_TO_FILL_ORDER_COMPLETELY: 'Unable to fill order completely.',
    UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE: 'Unable to place post-only order at this price.'
  },

  cancelLoanOffer: {
    CANCELED: 'Loan offer canceled.',
    ERROR_OR_NOT_YOU: 'Error canceling loan order, or you are not the person who placed it.'
  },

  cancelOrder: {
    INVALID_OR_NOT_YOU: 'Invalid order number, or you are not the person who placed the order.'
  },

  makeDeposit: {
    INVALID_CURRENCY: 'Invalid currency.',
    REQUIRED_PARAMETER_MISSING: 'Required parameter missing.'
  },

  returnChartData: {
    INVALID_CURRENCY_PAIR: 'Invalid currency pair.',
    INVALID_END_TIME: 'Invalid end time.',
    INVALID_START_TIME: 'Invalid start time.',
    PLEASE_SPECIFY_A_CURRENCY_PAIR: 'Please specify a currency pair.',
    PLEASE_SPECIFY_VALID_PERIOD: 'Please specify a valid period.'
  },

  returnDepositsWithdrawals: {
    INVALID_API_KEY_SECRET_PAIR: 'Invalid API key/secret pair.',
    INVALID_START_PARAMETER: 'Invalid start parameter.',
    INVALID_END_PARAMETER: 'Invalid end parameter.'
  },

  returnLendingHistory: {
    INVALID_START_PARAMETER: 'Invalid start parameter.',
    INVALID_END_PARAMETER: 'Invalid end parameter.',
    INVALID_LIMIT_PARAMETER: 'Invalid limit parameter.'
  },

  returnOrderBook: {
    defaultDepth: 50,
    INVALID_CURRENCY_PAIR: 'Invalid currency pair.',
    INVALID_DEPTH: 'Invalid depth.',
    PLEASE_SPECIFY_A_CURRENCY_PAIR: 'Please specify a currency pair.'
  },

  returnTradeHistoryPrivate: {
    INVALID_START_PARAMETER: 'Invalid start parameter.',
    INVALID_END_PARAMETER: 'Invalid end parameter.',
    INVALID_LIMIT_PARAMETER: 'Invalid limit parameter.',
    REQUIRED_PARAMETER_MISSING: 'Required parameter missing.'
  },

  returnTradeHistoryPublic: {
    INVALID_CURRENCY_PAIR: 'Invalid currency pair.',
    INVALID_END_TIME: 'Invalid end time.',
    INVALID_START_TIME: 'Invalid start time.',
    PLEASE_SPECIFY_A_CURRENCY_PAIR: 'Please specify a currency pair.'
  },

  sell: {
    INVALID_AMOUNT_PARAMETER: 'Invalid amount parameter.',
    INVALID_CURRENCY_PAIR_PARAMETER: 'Invalid currencyPair parameter.',
    INVALID_RATE_PARAMETER: 'Invalid rate parameter.',
    NO_MORE_THAN_ONE: 'No more than one of the post-only, fill-or-kill, and immediate-or-cancel flags should be set at the same time.',
    REQUIRED_PARAMETER_MISSING: 'Required parameter missing.',
    TOTAL_MUST_BE_AT_LEAST_0_0001: 'Total must be at least 0.0001.'
  }

}
