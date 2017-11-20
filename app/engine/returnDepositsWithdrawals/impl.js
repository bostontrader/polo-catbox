module.exports = (user, start, end, deposits, withdrawals) => {
  return {
    deposits: deposits.filter(deposit => deposit.user === user && start <= deposit.datetime && deposit.datetime <= end)
      .map(deposit => {
        return {
          currency: deposit.currency,
          address: 'random address',
          amount: deposit.amount,
          confirmations: 1,
          txid: 'random tx id',
          timestamp: deposit.datetime,
          status: 'COMPLETE'
        }
      }),
    withdrawals: withdrawals.filter(withdrawal => withdrawal.user === user && start <= withdrawal.datetime && withdrawal.datetime <= end)
      .map(withdrawal => {
        return {
          withdrawalNumber: 666,
          currency: withdrawal.currency,
          address: 'random address',
          amount: withdrawal.amount,
          fee: 0.00100000,
          timestamp: withdrawal.datetime,
          status: 'COMPLETE: 6a3aa6b2bc44dae58e851cde6b6316bf23d97cbc63d26b5ef2f50ab7dd28a96c',
          ipAddress: '106.185.39.151'
        }
      })
  }
}
