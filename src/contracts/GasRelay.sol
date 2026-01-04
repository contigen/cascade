// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GasRelay {
    address public immutable relayer;
    uint256 public totalFeesPaid;

    event RelayerPaid(
        address indexed payer,
        address indexed relayer,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _relayer) {
        relayer = _relayer;
    }

    function payRelayer(uint256 amount) external {
        require(amount > 0, "zero amount");

        totalFeesPaid += amount;

        emit RelayerPaid(
            msg.sender,
            relayer,
            amount,
            block.timestamp
        );
    }
}
