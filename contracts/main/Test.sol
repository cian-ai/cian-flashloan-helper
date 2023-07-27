// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import "../interfaces/aave/v3/IFlashLoanSimpleReceiver.sol";
import "../interfaces/aave/v3/IPoolV3.sol";
import "./IFlashloanHelper.sol";
import "hardhat/console.sol";

contract Test {
    using SafeERC20 for IERC20;

    bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");
    address public constant aaveV3Pool = 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2;
    address public constant WETH_ADDR = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant DAI_ADDR = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    // Prevent re-entry calls by using this flag.
    address public executor;
    address public flashloanHelper;

    constructor(address _flashloanHelper) {
        flashloanHelper = _flashloanHelper;
    }

    function test() public {
        bytes memory params_ = abi.encode(WETH_ADDR);
        bytes memory dataBytes_ = abi.encode(uint256(0), this.onFlashLoan.selector, params_);
        executeFlashLoan(WETH_ADDR, 1e18, dataBytes_);
    }

    function executeFlashLoan(address _token, uint256 _amount, bytes memory _params) internal {
        require(executor == address(0), "Flashloaner: In progress!");
        executor = msg.sender;
        IFlashloanHelper(flashloanHelper).flashLoan(address(this), _token, _amount, _params);
        executor = address(0);
    }

    function onFlashLoan(address _initiator, address _token, uint256 _amount, uint256 _fee, bytes calldata _params)
        external
        returns (bytes32)
    {
        require(msg.sender == flashloanHelper && executor != address(0) && _initiator == address(this), "Invalid call!");
        console.log("onFlashLoan success!!");
        (address testAddr) = abi.decode(_params, (address));
        console.log("testAddr = ", testAddr);
        IERC20(_token).safeIncreaseAllowance(msg.sender, _amount + _fee);
        return CALLBACK_SUCCESS;
    }
}
