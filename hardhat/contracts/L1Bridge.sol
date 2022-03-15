 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";

interface IERC721 {
  function ownerOf(uint256 _tokenId) external view returns (address);

  function transferFrom(address _from, address _to, uint256 _tokenId) external payable;

  function approve(address _approved, uint256 _tokenId) external payable;
}

contract L1Bridge {
  event NewSerialNumber(bytes32);

  mapping(bytes32 => address) public owners;
  address l2BridgeAddr;
  address cdmAddr = 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318;

  constructor(address _l2BridgeAddr) {
    l2BridgeAddr = _l2BridgeAddr;
  }

  function send(
    address tokenContractAddr,
    uint256 tokenId
  ) public {
    require(
      msg.sender == IERC721(tokenContractAddr).ownerOf(tokenId),
      "send function must be called by owner of nft"
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
      crossDomainOrigin == l2BridgeAddr,
      "Cross domain message sender must be L2Bridge"
    );

    require(
      owners[serialNumber] != address(0),
      "NFT does not exist in this contract"
    );

    IERC721(tokenContractAddr).transferFrom(address(this), newOwner, tokenId);
    owners[serialNumber] = address(0);
  }
}