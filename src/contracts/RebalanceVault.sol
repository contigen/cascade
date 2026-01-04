// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RebalanceVault {
    /// @notice Target ETH ratio scaled by 1e18 (e.g. 60% = 0.6e18)
    uint256 public targetEthRatio;

    /// @notice Last time rebalance was executed
    uint256 public lastRebalanceAt;

    /// @notice Minimum seconds between rebalances
    uint256 public constant COOLDOWN = 1 hours;

    event Rebalanced(
        address indexed executor,
        uint256 previousRatio,
        uint256 newRatio,
        uint256 timestamp
    );

    constructor(uint256 _targetEthRatio) {
        require(_targetEthRatio <= 1e18, "invalid ratio");
        targetEthRatio = _targetEthRatio;
    }

    function rebalance(uint256 currentEthRatio) external {
        require(
            block.timestamp >= lastRebalanceAt + COOLDOWN,
            "cooldown active"
        );

        uint256 previousRatio = currentEthRatio;

        // --- demo logic (mock adjustment)
        uint256 newRatio = targetEthRatio;

        lastRebalanceAt = block.timestamp;

        emit Rebalanced(
            msg.sender,
            previousRatio,
            newRatio,
            block.timestamp
        );
    }
}
