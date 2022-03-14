 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";

interface IERC721 {
  function ownerOf(uint256 _tokenId) external view returns (address);

  function transferFrom(address _from, address _to, uint256 _tokenId) external payable;

  function approve(address _approved, uint256 _tokenId) external payable;
}

contract SourceWrapperManager {
  event NewSerialNumber(bytes32);

  mapping(bytes32 => address) public owners;
  address destWrapperAddr;
  address cdmAddr = 0x4361d0F75A0186C05f971c566dC6bEa5957483fD;

  constructor(address _destWrapperAddr) {
    destWrapperAddr = _destWrapperAddr;
  }

  function send(
    address tokenContractAddr,
    uint256 tokenId
  ) public {
    require(
      msg.sender == IERC721(tokenContractAddr).ownerOf(tokenId),
      "SourceWrapperManager: send function must be called by owner of nft"
    );

    IERC721(tokenContractAddr).transferFrom(msg.sender, address(this), tokenId);

    bytes32 serialNumber = keccak256(abi.encode(tokenContractAddr, msg.sender, tokenId));
    emit NewSerialNumber(serialNumber);
    owners[serialNumber] = msg.sender;
  }

  function claim(
    bytes32 serialNumber,
    address newOwner,
    address tokenContractAddr,
    uint256 tokenId
  ) public {
    address crossDomainOrigin = ICrossDomainMessenger(cdmAddr).xDomainMessageSender();
    require(
      crossDomainOrigin == destWrapperAddr,
      "Cross domain message sender must be DestWrapper"
    );

    require(
      owners[serialNumber] != address(0),
      "NFT does not exist in this contract"
    );

    IERC721(tokenContractAddr).transferFrom(address(this), newOwner, tokenId);
    owners[serialNumber] = address(0);
  }
}