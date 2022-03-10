// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IL2CrossDomainMessenger {
  function sendMessage(address _target, bytes memory _message, uint32 _gasLimit) external;
}

contract Dest {
  address L2CrossDomainMessenger = 0x4200000000000000000000000000000000000007;

  function doTheThing(address sourceAddress, uint256 myFunctionParam) public {
    IL2CrossDomainMessenger(L2CrossDomainMessenger).sendMessage(
      sourceAddress,
      abi.encodeWithSignature(
        "doSomething(uint256)",
        myFunctionParam
      ),
      1000000 // use whatever gas limit you want
    );
  }
}