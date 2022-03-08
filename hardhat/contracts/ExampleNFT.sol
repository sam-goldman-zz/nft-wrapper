// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ExampleNFT is ERC721 {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    constructor() ERC721("ExampleNFT", "EXNFT") {}

    function mint(address to) public {
        _tokenIds.increment();
        _safeMint(to, _tokenIds.current());
    }
}