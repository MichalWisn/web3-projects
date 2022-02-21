const ganache = require('ganache-cli');
const Web3 = require('web3');

const { Lottery: { abi, bytecode } } = require('../scripts/compile');

const web3 = new Web3(ganache.provider());

describe('Inbox contract', () => {
  let accounts;
  let lottery;
  let administrator;
  let player;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    [administrator, player] = accounts;

    lottery = await new web3.eth.Contract(abi)
      .deploy({ data: bytecode })
      .send({ from: administrator, gas: '1000000' });
  });

  it('deploys to test network', () => {
    expect(lottery.options.address).toBeTruthy();
  });

  it('starts with no players', async () => {
    const players = await lottery.methods.getPlayers().call();
    expect(players.length).toBe(0);
  });

  it('allows one account to enter lottery', async () => {
    await lottery.methods.enter().send({
      from: player,
      value: web3.utils.toWei('0.01', 'ether'),
    });

    const players = await lottery.methods.getPlayers().call();
    expect(players.length).toBe(1);
    expect(players[0]).toBe(player);
  });

  it('alows multiple accounts to enter lottery', async () => {
    const actions = accounts.map((acc) => lottery.methods.enter().send({
      from: acc,
      value: web3.utils.toWei('0.01', 'ether'),
    }));
    await Promise.all(actions);

    const players = await lottery.methods.getPlayers().call();
    expect(players.length).toBe(10);
    accounts.forEach((acc, idx) => expect(players[idx]).toBe(acc));
  });

  it('throws error if account tries to enter without paying enough', async () => {
    const sendInsufficientMoney = () => lottery.methods.enter().send({
      from: player,
      value: web3.utils.toWei('0.0001', 'ether'),
    });

    expect(sendInsufficientMoney()).rejects.toThrow();

    try {
      await sendInsufficientMoney();
      throw new Error('Insufficient money did not trigger error.');
    } catch (err) {
      expect(err.message.includes('Entry of .01 ETH needed.')).toBeTruthy();
    }
  });

  it('allows to select winner only for administrator', async () => {
    const selectWinner = () => lottery.methods.selectWinner().send({
      from: player,
    });

    expect(selectWinner()).rejects.toThrow();

    try {
      await selectWinner();
      throw new Error('Winner selected by unpriviledged account');
    } catch (err) {
      expect(err.message.includes('Only administrator can call.')).toBeTruthy();
    }
  });

  it('resets the array when winner is selected', async () => {
    await lottery.methods.enter().send({
      from: player,
      value: web3.utils.toWei('0.01', 'ether'),
    });

    let players = await lottery.methods.getPlayers().call();
    expect(players.length).toBe(1);

    await lottery.methods.selectWinner().send({
      from: administrator,
    });

    players = await lottery.methods.getPlayers().call();
    expect(players.length).toBe(0);
  });

  it('sends money to the winner', async () => {
    await lottery.methods.enter().send({
      from: player,
      value: web3.utils.toWei('0.01', 'ether'),
    });

    const balanceAfterEntry = await web3.eth.getBalance(player);

    await lottery.methods.selectWinner().send({
      from: administrator,
    });

    const finalBalance = await web3.eth.getBalance(player);

    expect(Number(finalBalance)).toBeGreaterThan(Number(balanceAfterEntry));
  });
});
