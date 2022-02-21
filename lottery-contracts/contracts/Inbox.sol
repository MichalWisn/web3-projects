// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

contract Inbox {
    string public message;

    constructor (string memory initialMsg) {
        message = initialMsg;
    }

    function setMsg(string calldata newMsg) public {
        message = newMsg;
    }
}