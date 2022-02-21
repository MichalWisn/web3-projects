// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

contract Lottery {
    address public administrator;
    address[] public players;

    constructor() {
        administrator = msg.sender;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function enter() public payable {
        require(msg.value >= .01 ether, 'Entry of .01 ETH needed.');
        players.push(msg.sender);
    }

    // pseudo random - for complete randomness access off chain
    function random() private view returns (uint) {
        bytes memory args = abi.encodePacked(block.difficulty, block.timestamp, players);
        return uint(keccak256(args));
    }

    function selectWinner() public restricted {
        uint index = random() % players.length;
        address payable winner = payable(players[index]);
        winner.transfer(address(this).balance);

        players = new address[](0);
    }

    modifier restricted() {
        require(msg.sender == administrator, 'Only administrator can call.');
        _;
    }
}