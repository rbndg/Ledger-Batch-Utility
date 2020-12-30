# Ledger Batch Utility
Perform a set of actions on Ledger nano.


### Install
You need to have `yarn` installed.
1. `git clone`
2. `yarn install` **NPM does not work**
3. Connect your Ledger device and navigate to the currency you want to use
4. Configure your `config.json`
5. Finished

## Address Generation: `node gen-address.js` (Bitcoin/Dash..etc)
Generate many addresses from a HD path and saves to file

## Mass transaction: `node send.js` (Bitcoin/Dash..etc)
Send a set amount coins from ledger to a list of addresses.

## Generate ETH2 staking key `eth2-staking-key.js` (Eth2)
Generate keys for staking ETH2