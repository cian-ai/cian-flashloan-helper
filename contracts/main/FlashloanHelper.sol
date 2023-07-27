// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import "../interfaces/aave/v3/IFlashLoanSimpleReceiver.sol";
import "../interfaces/aave/v3/IPoolV3.sol";
import "../interfaces/balancer/IVault.sol";
import "./IFlashloanHelper.sol";

/**
 * @title FlashloanHelper contract
 * @author Cian
 * @dev This is a relay contract used for interacting with different flash loan protocols.
 * Only whitelist addresses can call the flash loan function of this relay contract.
 */
contract FlashloanHelper is IFlashloanHelper, Ownable {
    using SafeERC20 for IERC20;

    enum FLSource {
        AAVEV3,
        BALANCER,
        MAKER
    }

    bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");
    address public constant AAVE_V3_LENDING_POOL = 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2;
    address public constant BALANCER_VAULT = 0xBA12222222228d8Ba445958a75a0704d566BF2C8;
    address public constant DSS_FLASH_ADDR = 0x60744434d6339a6B27d73d9Eda62b6F66a0a04FA;
    address public constant DAI_ADDR = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    // Prevent re-entry calls by using this flag.
    address public executor;
    mapping(address => bool) public whitelist;

    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);
    event FlAction(address indexed account, FLSource source, address token, uint256 amount, bytes params);

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "FlashloanHelper: Not a whitelist user.");
        _;
    }

    /**
     * @dev Add a whitelist of accounts permitted to use this relay contract.
     * @param _address The whitelist address to be added.
     */
    function addToWhitelist(address _address) public onlyOwner {
        require(!whitelist[_address], "FlashloanHelper: Already a whitelist user.");
        whitelist[_address] = true;
        emit AddedToWhitelist(_address);
    }

    /**
     * @dev Remove address from the whitelist.
     * @param _address The whitelist address to be removed.
     */
    function removeFromWhitelist(address _address) public onlyOwner {
        require(whitelist[_address], "FlashloanHelper: Not a whitelist user.");
        whitelist[_address] = false;
        emit RemovedFromWhitelist(_address);
    }

    /**
     * @dev The entry function for executing the flash loan operation.
     * @param _receiver The contract of the callback function receiving the flash loan operation.
     * @param _token The type of token required for the flash loan.
     * @param _amount The amount of token required for the flash loan.
     * @param _params The parameters for executing the callback.
     * @return bool The flag indicating the operation has been completed.
     */
    function flashLoan(address _receiver, address _token, uint256 _amount, bytes calldata _params)
        external
        override
        onlyWhitelisted
        returns (bool)
    {
        require(executor == address(0) && _receiver == msg.sender, "FlashloanHelper: In progress!");
        executor = msg.sender;
        (uint256 flSelector_,,) = abi.decode(_params, (uint256, bytes4, bytes));
        if (flSelector_ == uint256(FLSource.AAVEV3)) {
            _flAaveV3(_token, _amount, _params);
        } else if (flSelector_ == uint256(FLSource.BALANCER)) {
            _flBalancer(_token, _amount, _params);
        } else if (flSelector_ == uint256(FLSource.MAKER)) {
            _flMaker(_token, _amount, _params);
        } else {
            revert("Nonexistent provider!");
        }

        executor = address(0);

        emit FlAction(address(_receiver), FLSource(flSelector_), _token, _amount, _params);
        return true;
    }

    function _flAaveV3(address _token, uint256 _amount, bytes calldata _params) internal {
        IPoolV3(AAVE_V3_LENDING_POOL).flashLoanSimple(address(this), _token, _amount, _params, 0);
    }

    function _flBalancer(address _token, uint256 _amount, bytes calldata _params) internal {
        address[] memory tokens_ = new address[](1);
        uint256[] memory amounts_ = new uint256[](1);
        tokens_[0] = address(_token);
        amounts_[0] = _amount;
        IVault(BALANCER_VAULT).flashLoan(address(this), tokens_, amounts_, _params);
    }

    function _flMaker(address _token, uint256 _amount, bytes calldata _params) internal {
        require(_token == DAI_ADDR, "Unsupported token!");
        IERC3156FlashLender(DSS_FLASH_ADDR).flashLoan(IERC3156FlashBorrower(address(this)), DAI_ADDR, _amount, _params);
    }

    /// @dev AaveV3 flashloan callback.
    function executeOperation(
        address _asset,
        uint256 _amount,
        uint256 _premium,
        address _initiator,
        bytes calldata _params
    ) external returns (bool) {
        require(msg.sender == AAVE_V3_LENDING_POOL && _initiator == address(this), "Aavev3 flashloan: Invalid call!");
        IERC20(_asset).safeTransfer(executor, _amount);
        executeOnBorrower(_asset, _amount, _premium, _params);
        IERC20(_asset).safeTransferFrom(executor, address(this), _amount + _premium);
        IERC20(_asset).safeIncreaseAllowance(AAVE_V3_LENDING_POOL, _amount + _premium);
        return true;
    }

    /// @dev Balancer flashloan callback.
    function receiveFlashLoan(
        address[] calldata _tokens,
        uint256[] calldata _amounts,
        uint256[] calldata _fees,
        bytes calldata _params
    ) external {
        require(msg.sender == BALANCER_VAULT && executor != address(0), "Balancer flashloan: Invalid call!");
        IERC20(_tokens[0]).safeTransfer(executor, _amounts[0]);
        executeOnBorrower(address(_tokens[0]), _amounts[0], _fees[0], _params);
        IERC20(_tokens[0]).safeTransferFrom(executor, BALANCER_VAULT, _amounts[0] + _fees[0]);
    }

    /// @dev Maker flashloan callback.
    function onFlashLoan(address _initiator, address _token, uint256 _amount, uint256 _fee, bytes calldata _params)
        external
        returns (bytes32)
    {
        require(msg.sender == DSS_FLASH_ADDR && _initiator == address(this), "Maker flashloan: Invalid call!");
        IERC20(_token).safeTransfer(executor, _amount);
        executeOnBorrower(_token, _amount, _fee, _params);
        IERC20(_token).safeTransferFrom(executor, address(this), _amount + _fee);
        IERC20(_token).safeIncreaseAllowance(DSS_FLASH_ADDR, _amount + _fee);

        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }

    /// @dev  Executes an operation after receiving the flash-borrowed asset.
    function executeOnBorrower(address _asset, uint256 _amount, uint256 _premium, bytes calldata _params) internal {
        /// @dev Consider that the same contract address may have more than one callback method.
        (, bytes4 callbackSelector_, bytes memory callBackData_) = abi.decode(_params, (uint256, bytes4, bytes));
        bytes memory returnData_ = Address.functionCall(
            executor, abi.encodeWithSelector(callbackSelector_, executor, _asset, _amount, _premium, callBackData_)
        );
        require(CALLBACK_SUCCESS == abi.decode(returnData_, (bytes32)), "FlashloanHelper: ExecuteOnBorrower failed!");
    }
}
