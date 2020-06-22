const { first, map, reduce, tap } = require('rxjs/operators')
const fs = require('fs')
var readline = require('readline')
var rl = readline.createInterface(process.stdin, process.stdout)

const {
  getCryptoCurrencyById,
  formatCurrencyUnit,
  parseCurrencyUnit
} = require('@ledgerhq/live-common/lib/currencies')
const {
  getCurrencyBridge,
  getAccountBridge
} = require('@ledgerhq/live-common/lib/bridge')
const { registerTransportModule } = require('@ledgerhq/live-common/lib/hw')
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid-noevents').default
const implementLibcore = require('@ledgerhq/live-common/lib/libcore/platforms/nodejs').default
const { setSupportedCurrencies } = require('@ledgerhq/live-common/lib/data/cryptocurrencies')
// our small example is a script that takes 3 params.
// example: node send.js bitcoin bc1abc..def 0.001]

const config = {
  currency: 'dash',
  amount: '0.1',
  name: 'Dash 1',
  filePath: './Dash-Ledger-1592797899818'
}

const currency = getCryptoCurrencyById(config.currency)
const amount = parseCurrencyUnit(currency.units[0], config.amount)
const deviceId = '' // in HID case

// configure which coins to enable
setSupportedCurrencies([config.currency])

// provide a libcore implementation
implementLibcore({
  lib: () => require('@ledgerhq/ledger-core'),
  dbPath: './dbdata'
})

// configure which transport are available
registerTransportModule({
  id: 'hid',
  open: devicePath => TransportNodeHid.open(devicePath),
  disconnect: () => Promise.resolve()
})

const recipients = fs.readFileSync(config.filePath).toString().split('\n').filter(Boolean)
recipients.shift()
async function main (recipient) {
  // currency bridge is the interface to scan accounts of the device
  const currencyBridge = getCurrencyBridge(currency)

  // some currency requires some data to be loaded (today it's not highly used but will be more and more)
  await currencyBridge.preload()

  // in our case, we don't need to paginate
  const syncConfig = { paginationConfig: {} }

  // NB scanAccountsOnDevice returns an observable but we'll just get the first account as a promise.
  const scannedAccount = await currencyBridge
    .scanAccounts({ currency, syncConfig })
    .pipe(
      first(e => e.type === 'discovered' && e.account.name === config.name),
      map(e => e.account)
    )
    .toPromise()
  // account bridge is the interface to sync and do transaction on our account
  const accountBridge = getAccountBridge(scannedAccount)

  // Minimal way to synchronize an account.
  // NB: our scannedAccount is already sync in fact, this is just for the example
  const account = await accountBridge
    .sync(scannedAccount, syncConfig)
    .pipe(reduce((a, f) => f(a), scannedAccount))
    .toPromise()
  console.log(
    `Ledger Account: ${account.name} | Balance:  ${formatCurrencyUnit(account.unit, account.balance)}`
  )

  // We prepare a transaction
  let t = accountBridge.createTransaction(account)
  t = accountBridge.updateTransaction(t, { amount, recipient })
  t = await accountBridge.prepareTransaction(account, t)

  // We can always get the status. used for form validation and meta info (like calculated fees)
  const status = await accountBridge.getTransactionStatus(account, t)

  console.log({ amount: status.amount.toString(), recipient })

  // we can't broadcast the transaction if there are errors
  const errors = Object.values(status.errors)
  if (errors.length) {
    throw errors[0]
  }

  // We're good now, we can sign the transaction with the device
  const signedOperation = await accountBridge
    .signOperation({ account, transaction: t, deviceId })
    .pipe(
      tap(e => console.log(e)), // log events
      // there are many events. we just take the final signed
      first(e => e.type === 'signed'),
      map(e => e.signedOperation)
    )
    .toPromise()

  // We can then broadcast it
  const operation = await accountBridge.broadcast({ account, signedOperation })

  // the transaction is broadcasted!
  // the resulting operation is an "optimistic" response that can be prepended to our account.operations[]
  console.log('broadcasted', operation)
}

console.log('Config:')
console.log(config)
console.log('Recipients:')
console.log(recipients)

rl.question('\nIs the configuration correct? [y/n]: ', function (answer) {
  if (answer !== 'y') {
    console.log('Exiting')
    process.exit(1)
    return
  }
  try {
    main(recipients[0])
  } catch (err) {
    console.log(err)
  }
})
