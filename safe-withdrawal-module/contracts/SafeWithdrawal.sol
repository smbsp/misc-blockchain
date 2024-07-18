// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ISafe} from "./interfaces/ISafe.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SafeWithdrawal is Ownable {
    ISafe public safe;
    address public token;
    mapping(address => uint256) userBalances;
    uint256 private constant AMOUNT = 10 ether;

    // keccak256("EIP712Domain(uint256 chainId,address verifyingContract)");
    bytes32 public constant DOMAIN_SEPARATOR_TYPEHASH =
        0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218;

    // keccak256("Transfer(address beneficiary,uint256 amount)");
    bytes32 public constant TRANSFER_TYPEHASH =
        0x5ca4fe40907bdcf14bd7d7c78487492a6d0618d4d0b3f5ff29dbdd3c713afcdf;

    function setAddresses(ISafe _safe, address _token) external onlyOwner {
        safe = ISafe(_safe);
        token = _token;
    }

    function unicornTokenWithdrawal(
        uint256 amount,
        address beneficiary,
        bytes memory signature
    ) public {
        require(userBalances[beneficiary] <= AMOUNT);
        bytes memory data = abi.encodeWithSignature(
            "transfer(address,uint256)",
            beneficiary,
            amount
        );
        bytes memory transferHashData = generateTransferHashData(
            beneficiary,
            amount
        );
        ISafe(safe).checkSignatures(bytes32(transferHashData), data, signature);
        userBalances[beneficiary] += amount;
        require(
            ISafe(safe).execTransactionFromModule(
                token,
                0,
                data,
                ISafe.Operation.Call
            ),
            "Token transfer failed"
        );
    }

    /// @dev Generates the data for the transfer hash (required for signing)
    function generateTransferHashData(address beneficiary, uint256 amount)
        private
        view
        returns (bytes memory)
    {
        uint256 chainId = getChainId();
        bytes32 domainSeparator = keccak256(
            abi.encode(DOMAIN_SEPARATOR_TYPEHASH, chainId, this)
        );
        bytes32 transferHash = keccak256(
            abi.encode(TRANSFER_TYPEHASH, beneficiary, amount)
        );
        return
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                domainSeparator,
                transferHash
            );
    }

    /// @dev Returns the chain id used by this contract.
    function getChainId() public view returns (uint256) {
        uint256 id;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            id := chainid()
        }
        return id;
    }
}
