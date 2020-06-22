const Transport = require('@ledgerhq/hw-transport-node-hid').default
const AppBtc = require('@ledgerhq/hw-app-btc').default
const fs = require('fs')

//= =============
let index = 1
const TOTAL = 5
const HD_PATH = "44'/5'/0'/0/"

const file = () => {
  const session = `./Ledger-Dash-${Date.now()}`
  fs.appendFileSync(session, 'PATH: ' + HD_PATH + index + '\n')

  return {
    append: (txt) => {
      return fs.appendFileSync(session, txt)
    }
  }
}

const createLedger = async () => {
  const transport = await Transport.create()
  return new AppBtc(transport)
}

const createAddress = async (ledger, index) => {
  const path = HD_PATH + index
  const result = await ledger.getWalletPublicKey(path)
  session.append(result.bitcoinAddress + '\n')
  console.log(`Creating: Index: ${index} - ${result.bitcoinAddress}`)
  return result.bitcoinAddress
}

const session = file()
console.log(`HD Path : ${HD_PATH}${index}`)
createLedger()
  .then(async (ledger) => {
    console.log('Opened Ledger....')
    for (index; index < TOTAL; index++) {
      await createAddress(ledger, index)
    }
    console.log('Finished')
  })
