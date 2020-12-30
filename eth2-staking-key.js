'use strict'

const Transport  = require("@ledgerhq/hw-transport-node-hid").default;
const AppEth  = require("@ledgerhq/hw-app-eth").default;
const { createInterface } = require('readline')
const rl = createInterface(process.stdin, process.stdout)
let ethApp


const getEth2PubKey = async (index) => {
  /**
   * Path is derived from: https://eips.ethereum.org/EIPS/eip-2334
   */
  const path = `12381/3600/${index}/0`
  console.log(`Generating: ${path}`)
  const key = await ethApp.eth2GetPublicKey(path,false)
  console.log(`Success: ${path} : ${key.publicKey}`)
  return {
    path,
    key: key.publicKey
  }
};

const validateAnswer =(answer)=>{
  if (Number.isNaN(parseInt(answer))) {
    console.log(`Invalid answer provided: ${answer}`)
    return process.exit(1)
  }
}

const getStartingIndex = async ()=>{
  return new Promise((resolve)=>{
    rl.question('\n How many ETH2 public keys have you generated? [Enter number]: ', async function (answer) {
      validateAnswer(answer)
      let index = parseInt(answer)
      if(index === 0){
        resolve(0)
      } else {
        resolve(index+1)
      }
    })
  })
}

rl.question('\n How many ETH2 public keys do you want to generate NOW? [Enter number]: ', async function (answer) {
  validateAnswer(answer)
  const count = parseInt(answer)
  if(count === 0 ) return process.exit(1)
  const transport = await Transport.create();
  ethApp = new AppEth(transport);
  const startingIndex = await getStartingIndex()
  console.log(`Starting to generate from ${startingIndex}`)
  try {
    let total = []
    for(let x = 0; x < count; x++){
      total.push(await getEth2PubKey(startingIndex+x))
    }
    console.log('Finished', total)
    process.exit(1)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
})