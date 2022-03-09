// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IERC721 {
  function ownerOf(uint256 _tokenId) external view returns (address);
}

contract SourceWrapperManager {
  mapping(bytes32 => address) serials; // serial => nft address or vice versa
  mapping(bytes32 => uint256) destRollups; // serial => destRollup
  mapping(bytes32 => address) initialOwners; // serial => initialOwner
  // OR
  // RollupRecord(serial_number=R, dest_rollup=B, initial_owner=01)

  // TODO:
  // -check that msg.sender is owner of nft
  // -generate serial number based on (nft tokenId, nft contractaddress, initialOwner)
  // -transfer ownership of tokenId from msg.sender to wrappermanager contract
  // -store info in mappings / rolluprecord
  function send(
    address initialOwner,
    uint256 destRollup,
    address tokenContract,
    uint256 tokenId
  ) public {
    require(
      msg.sender == IERC721(tokenContract).ownerOf(tokenId),
      "SourceWrapperManager: send function must be called by owner of nft"
    );

    bytes32 serialNumber = keccak256(abi.encodePacked(tokenContract, initialOwner, tokenId));

    // IERC721(tokenContract).transferFrom
  }
}