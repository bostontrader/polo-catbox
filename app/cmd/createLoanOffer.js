// call createLoanOffer with no parameters
// {"error":"Amount must be at least 0.01"}

// amount: 'a', -1
// {"error":"Invalid amount parameter."}

// amount: 0
// {"error":"Amount must be at least 0.01"}

// If we're missing any of the others
// {"error":"Required parameter missing."}

// {amount: 0.01, currency: 0, 'a', 'btc'}
// {"error:"Invalid currency parameter."}

// duration: 'a', -1, 2.1
// {"error":"Invalid duration parameter."}'
// duration: 0 is ok

// autoRenew: 'a', -1
// {"error":"Invalid autoRenew parameter."}'
// autoRenew: 0 is ok

// lendingRate: 'a', -1
// {"error":"Invalid lendingRate parameter."}

// {amount: 0.01, currency: 'BTC', duration: 0, autoRenew: 0, lendingRate: 0}
// { success: 0, error: 'Duration must be at least 2 days.' }

// {amount: 0.01, currency: 'BTC', duration: 2, autoRenew: 0, lendingRate: 0.051}
// success: 0, error: 'Rate cannot be greater than 5%.' }

// {amount: 0.01, currency: 'BTC', duration: 2, autoRenew: 0, lendingRate: 0.05}
// { error: 'Not enough BTC available to offer.', success: 0 }

// {amount: 0.011, currency: 'BTC', duration: 2, autoRenew: 0, lendingRate: 0.0491}
// { success: 1, message: 'Loan order placed.', orderID: 659726649 }