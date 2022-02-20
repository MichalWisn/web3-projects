const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inboxPath = path.resolve(__dirname, '..', 'contracts', 'Inbox.sol');
const source = fs.readFileSync(inboxPath, 'UTF-8');

const input = JSON.stringify({
  language: 'Solidity',
  sources: {
    'Inbox.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
});

const contract = JSON.parse(solc.compile(input)).contracts['Inbox.sol'].Inbox;

module.exports = {
  contract,
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object,
};
