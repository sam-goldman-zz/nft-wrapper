// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "hardhat/console.sol";

interface IERC721 {
  function ownerOf(uint256 _tokenId) external view returns (address);

  function transferFrom(address _from, address _to, uint256 _tokenId) external payable;

  function approve(address _approved, uint256 _tokenId) external payable;
}

contract SourceWrapperManager {
  mapping(bytes32 => address) serials; // serial => nft address or vice versa
  mapping(bytes32 => uint256) destRollups; // serial => destRollup
  mapping(bytes32 => address) initialOwners; // serial => initialOwner
  // OR
  // RollupRecord(serial_number=R, dest_rollup=B, initial_owner=01)

  // TODO:
  // -store info in mappings / rolluprecord
  function send(
    address tokenAddress,
    uint256 tokenId,
    address initialOwner,
    uint256 destRollup
  ) public {
    require(
      msg.sender == IERC721(tokenAddress).ownerOf(tokenId),
      "SourceWrapperManager: send function must be called by owner of nft"
    );

    bytes32 serialNumber = keccak256(abi.encodePacked(tokenAddress, initialOwner, tokenId));

    console.logBytes32(serialNumber);

    IERC721(tokenAddress).transferFrom(initialOwner, address(this), tokenId);
  }
}