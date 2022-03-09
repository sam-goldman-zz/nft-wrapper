// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract DestWrapperManager {

  // mapping(bytes32 => address) owners (for ownerOf)

  // TODO:
  // generate bytes32 serialNumber
  // prevent multiple NFTs from being created with the same tuple.
  // store (serial number, source rollup, initial owner) tuples
  function makeWrapper(
    uint256 sourceRollup,
    address tokenContract,
    uint256 tokenId
  ) public {
    bytes32 serialNumber = keccak256(abi.encodePacked(tokenContract, msg.sender, tokenId));

  }

  // TODO:
  // check if msg.sender is owner of serialNumber
  // change owner
  function transfer(address to, bytes32 serialNumber) public {

  }

  function ownerOf(bytes32 serialNumber) public view {

  }
}