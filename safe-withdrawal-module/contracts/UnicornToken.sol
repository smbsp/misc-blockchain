// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UnicornToken is ERC20 {
    constructor() ERC20("Unicorn Token", "UNT") {
        _mint(msg.sender, 10000000);
    }
}