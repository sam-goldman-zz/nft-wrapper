// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "hardhat/console.sol";

contract DestWrapperManager {
  mapping(bytes32 => address) public owners;

  event NewWrapper(bytes32 serialNumber);

  // TODO:
  // store (serial number, source rollup, initial owner) tuples
  function makeWrapper(
    address tokenAddress,
    uint256 tokenId,
    uint256 sourceRollup
  ) public {
    bytes32 serialNumber = keccak256(abi.encodePacked(tokenAddress, msg.sender, tokenId));

    require(
      owners[serialNumber] == address(0),
      "DestWrapperManager: serial number already exists"
    );

    emit NewWrapper(serialNumber);

    owners[serialNumber] = msg.sender;
  }

  function transfer(address to, bytes32 serialNumber) public {
    require(
      msg.sender == owners[serialNumber],
      "DestWrapperManager: transfer called by non-owner"
    );
    owners[serialNumber] = to;
  }

  // TODO:
  // receipt saying "the NFT with serial number R, source rollup A, and initial owner O1, was just unwrapped, with desired new owner O2"
  function withdraw(bytes32 serialNumber) public {
    require(
      msg.sender == owners[serialNumber],
      "DestWrapperManager: nft must be withdrawn by owner"
    );
    owners[serialNumber] = address(this);
  }
}