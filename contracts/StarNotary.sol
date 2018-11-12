pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 { 

    struct Star { 
        string ra;
        string dec;
        uint mag; 
        string story;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo; 
    mapping(uint256 => uint256) public starsForSale;

    uint public starsCount = 0;
    uint[] public starsInSale;

    event starRegistered(uint _tokenId);

    function createStar(string _ra, string _dec, uint _mag, string _story, uint256 _tokenId) public { 

        require(checkIfStarExists(_ra) != true);

        Star memory newStar = Star(_ra, _dec, _mag, _story);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);

        starsCount++;

        emit starRegistered(_tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
        starsInSale.push(_tokenId);
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function checkIfStarExists(string _ra) public view returns (bool) {

        for (uint i = 1; i <= starsCount; i++) {
            if(keccak256(abi.encodePacked(tokenIdToStarInfo[i].ra)) == keccak256(abi.encodePacked(_ra))) {
                return true;
            }
        }

        return false;
    }

    function Approve(address _to, uint _tokenId) public {
        approve(_to, _tokenId);
    }

    function SafeTransferFrom(address _to, uint _tokenId) public {
        safeTransferFrom(msg.sender, _to, _tokenId);
    }

    function SetApprovalForAll(address _operator, bool _status) public {
        setApprovalForAll(_operator, _status);
    }

    function GetApproved(uint _tokenId) public view {
        getApproved(_tokenId);
    }

    function IsApprovedForAll(address _operator) public view {
        isApprovedForAll(msg.sender, _operator);
    }

    function OwnerOf(uint _tokenId) public view {
        ownerOf(_tokenId);
    }

    function StarsForSale() public view returns (uint[]) {
        return starsInSale;
    }

    function TokenIdToStarInfo(uint _tokenId) public view returns (string, string, uint, string) {
        return (tokenIdToStarInfo[_tokenId].ra, tokenIdToStarInfo[_tokenId].dec, tokenIdToStarInfo[_tokenId].mag, tokenIdToStarInfo[_tokenId].story);
    }
}