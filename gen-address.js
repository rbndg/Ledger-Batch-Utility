const Transport = require('@ledgerhq/hw-transport-node-hid').default
const AppBtc = require('@ledgerhq/hw-app-btc').default
const fs = require('fs')
const config = require('./config.json')
//= =============
const hdconfig = config.hd_path.split('/')
let index = +hdconfig.pop()
const TOTAL = config.generate_amount
const HD_PATH = hdconfig.join('/') + '/'

const file = () => {
  const session = `./Ledger-Dash-${Date.now()}.address`
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
  console.log(`Creating: Index: ${path} - ${result.bitcoinAddress}`)
  return result.bitcoinAddress
}

const session = file()
console.log(`HD Path : ${HD_PATH}${index}`)
createLedger()
  .then(async (ledger) => {
    console.log('Opened Ledger....')
    try {
      for (index; index < TOTAL; index++) {
        await createAddress(ledger, index)
      }
    } catch (err) {
      console.log(err)
    }

    console.log('Finished')
  })
