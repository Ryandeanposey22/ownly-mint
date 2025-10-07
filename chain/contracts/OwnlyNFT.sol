// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnlyNFT is ERC721A, Ownable {
    uint256 public constant MAX_SUPPLY = 35;
    uint256 public constant MINT_PRICE = 0.01 ether;

    // single shared metadata URI for all tokens
    string private _tokenURIValue;

    constructor() ERC721A("OwnlyNFT", "OWNLY") Ownable(msg.sender) {}

    /// @notice Owner-only: set the single metadata URI (e.g. ipfs://<CID>/metadata.json)
    function setTokenURI(string calldata newTokenURI) external onlyOwner {
        _tokenURIValue = newTokenURI;
    }

    /// @dev Always return the same URI for all tokenIds; require existence for standards compliance
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIValue;
    }

    function mint(uint256 quantity) external payable {
        require(totalSupply() + quantity <= MAX_SUPPLY, "Exceeds supply");
        require(msg.value >= quantity * MINT_PRICE, "Insufficient ETH");
        _mint(msg.sender, quantity);
    }

    /// Optional: withdraw collected ETH
    function withdraw(address payable to) external onlyOwner {
        to.transfer(address(this).balance);
    }
}

