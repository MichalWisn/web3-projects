const ganache = require('ganache-cli');
const Web3 = require('web3');

const { Inbox: { abi, bytecode } } = require('../scripts/compile');

const web3 = new Web3(ganache.provider());

describe('Inbox contract', () => {
  const defaultMsg = 'Hello World';
  let accounts;
  let inbox;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    inbox = await new web3.eth.Contract(abi)
      .deploy({ data: bytecode, arguments: [defaultMsg] })
      .send({ from: accounts[0], gas: '1000000' });
  });

  it('deploys to test network', () => {
    expect(inbox.options.address).toBeTruthy();
  });

  it('has a default message', async () => {
    const msg = await inbox.methods.message().call();
    expect(msg).toBe(defaultMsg);
  });

  it('sets a message', async () => {
    const newMsg = 'Bye World';
    await inbox.methods.setMsg(newMsg).send({ from: accounts[0] });

    const msg = await inbox.methods.message().call();
    expect(msg).toBe(newMsg);
  });

  it('web3 fetches 10 accounts', () => {
    expect(accounts.length).toBe(10);
  });
});
