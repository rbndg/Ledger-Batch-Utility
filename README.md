# Ledger Batch Utility
Perform a set of actions on Ledger nano. This application should work with Bitcoin and Bitcoin forks like Dash


### Install
You need to have `yarn` installed.
1. `git clone`
2. `yarn install` **NPM does not work**
3. Connect your Ledger device and navigate to the currency you want to use
4. Configure your `config.json`
5. Finished

## Address Generation: `node gen-address.js`
Generate many addresses from a HD path

## Mass transaction: `node send.js`
Send a set amount coins from ledger to a list of addresses.
