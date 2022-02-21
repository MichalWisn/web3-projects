const path = require('path');
const fs = require('fs');
const solc = require('solc');

const compileContract = (name) => {
  const contractPath = path.resolve(__dirname, '..', 'contracts', `${name}.sol`);
  const source = fs.readFileSync(contractPath, 'UTF-8');

  const input = JSON.stringify({
    language: 'Solidity',
    sources: {
      current: {
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

  const contract = JSON.parse(solc.compile(input)).contracts.current[name];
  return {
    contract,
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
};

module.exports = {
  Inbox: compileContract('Inbox'),
  Lottery: compileContract('Lottery'),
};
