// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";

contract DestWrapperManager {
  address l2CrossDomainMessengerAddr = 0x4200000000000000000000000000000000000007;

  struct TokenData {
    address tokenContractAddr;
    address owner;
    uint256 tokenId;
  }

  mapping(bytes32 => TokenData) serials;

  address sourceWrapperAddr;

  function initialize(address _sourceWrapperAddr) public {
    require(sourceWrapperAddr == address(0), "Contract has already been initialized.");
    sourceWrapperAddr = _sourceWrapperAddr;
  }

  function makeWrapper(
    address tokenContractAddr,
    uint256 tokenId
  ) public {
    bytes32 serialNumber = keccak256(abi.encodePacked(tokenContractAddr, msg.sender, tokenId));

    require(
      serials[serialNumber].owner == address(0),
      "DestWrapperManager: serial number already exists"
    );

    serials[serialNumber].tokenContractAddr = tokenContractAddr;
    serials[serialNumber].owner = msg.sender;
    serials[serialNumber].tokenId = tokenId;
  }

  // TODO: (later)
  // case: serial number already exists from previous makeWrapper -> withdraw
  function transfer(address to, bytes32 serialNumber) public {
    require(
      msg.sender == serials[serialNumber].owner,
      "DestWrapperManager: transfer called by non-owner"
    );
    serials[serialNumber].owner = to;
  }

  function withdraw(
    bytes32 serialNumber,
    address newOwner
  ) public {
    require(
      msg.sender == serials[serialNumber].owner,
      "DestWrapperManager: nft must be withdrawn by owner"
    );

    serials[serialNumber].owner = address(this);

    bytes memory message = abi.encodeWithSignature("claim(bytes32,address,address,uint256)", 
      serialNumber,
      newOwner,
      serials[serialNumber].tokenContractAddr,
      serials[serialNumber].tokenId
    );

    ICrossDomainMessenger(l2CrossDomainMessengerAddr).sendMessage(
        sourceWrapperAddr,
        message,
        1000000   // irrelevant here
    );
  }
}