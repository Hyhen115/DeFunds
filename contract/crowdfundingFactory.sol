// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// imports
import {Crowdfund} from "./crowdfunding.sol";

contract CrowdfundFactory {

    address public owner;
    bool public pause;

    // campiagn
    struct Campaign {
        address campaignAddress;
        address owner;
        string name;
        uint256 createTime;
    }

    Campaign[] public campaigns; // list of campaigns that has created
    mapping(address => Campaign[]) public userCampaigns; // mappings for address of the corresponding 

    // constructor to construct the factory
    constructor() {
        owner = msg.sender;
    }

    // create campaign
    function createCampaign(string memory _name, string memory _description, uint256 _target, uint256 _duration, string memory _image) external whenNotPaused {
        // input validation
        require(bytes(_name).length > 0, "name is empty");
        require(_target > 0, "target must > 0");
        require(_duration > 0, "duration must > 0");

        // create a new contract for the new campaign
        Crowdfund newCampaign = new Crowdfund(
            msg.sender,
            _name,
            _description,
            _target,
            _duration,
            _image
        );

        address campaignAddr = address(newCampaign); // address of the campaign contract that created

        // make a sturct for the context of that campaign
        Campaign memory campaign = Campaign({
            campaignAddress: campaignAddr,
            owner: msg.sender,
            name: _name,
            createTime: block.timestamp
        });

        campaigns.push(campaign); // add to the campaign list
        userCampaigns[msg.sender].push(campaign); // map the campaign of this address to the current context

    }

    modifier onlyOwner() {
        require(owner == msg.sender, "only owner");
        _;
    }

    modifier whenNotPaused() {
        require(!pause , "it is paused");
        _;
    }

    // getter: get user campaigns list
    function getUserCampaigns(address userAddr) external view returns (Campaign[] memory){
        return userCampaigns[userAddr]; // return the campaign list of that user
    }

    // getter : get all campaigns
    function getAllCampaigns() external view returns (Campaign[] memory){
        return campaigns; 
    }

    // toggle pause function using the library
    function togglePause() public onlyOwner {
        pause = !pause;
    }
}