// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

interface IFlashloanHelper {
    function flashLoan(address _receiver, address _token, uint256 _amount, bytes calldata _params)
        external
        returns (bool);
}
