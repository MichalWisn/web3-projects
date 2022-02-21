require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const { abi, bytecode } = require('./compile');

const mnemonic = process.env.ACCOUNT_MNEMONIC;
const networkUrl = process.env.NETWORK_URL;

if (!networkUrl || !mnemonic) {
  throw new Error('Variables NETWORK_URL and ACCOUNT_MNEMONIC not provided in .env file');
}

const provider = new HDWalletProvider(mnemonic, networkUrl);
const web3 = new Web3(provider);

const deploy = async () => {
  const account = (await web3.eth.getAccounts())[0];

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode, arguments: ['Hi mom!'] })
    .send({ gas: 1000000, from: account });

  // eslint-disable-next-line no-console
  console.info('Contract deployed to: ', result.options.address);

  provider.engine.stop();
};

deploy();
