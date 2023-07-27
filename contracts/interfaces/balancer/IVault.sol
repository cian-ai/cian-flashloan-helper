// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

interface IVault {
    function flashLoan(address recipient, address[] memory tokens, uint256[] memory amounts, bytes memory userData)
        external;
}
