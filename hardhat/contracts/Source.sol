// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Source {
  uint public x = 2;

  function doSomething(uint256 myFunctionParam) public {
    x = myFunctionParam;
  }
}