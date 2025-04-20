
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Import Foundry's Test.sol and console
import {Test, console} from "forge-std/Test.sol";
// Import the tested contracts from the provided file path
import {Crowdfund, CrowdfundFactory} from "../src/allcontract_20980517_1745134084.sol";

contract ContractTest is Test {
    // Some helper addresses for testing different roles.
    address ownerAddr = address(10);
    address donor1 = address(11);
    address donor2 = address(12);

    // Common campaign parameters
    uint256 constant TARGET_AMOUNT = 10 ether;
    uint256 constant EXTENDED_TARGET_AMOUNT = 5 ether; // for proposals (>= 50% of TARGET_AMOUNT)

    // Setup function executed before each test case
    function setUp() public {
        // Give some initial ether balance to test addresses
        vm.deal(ownerAddr, 100 ether);
        vm.deal(donor1, 100 ether);
        vm.deal(donor2, 100 ether);
    }

    ////////////////////////////////////////////////////////////
    // Helper function: Create a Crowdfund campaign instance
    ////////////////////////////////////////////////////////////
    function _createCampaign(
        address _campaignOwner,
        uint256 _target,
        uint256 _deadlineOffset
    ) internal returns (Crowdfund) {
        // Campaign deadline is current timestamp + _deadlineOffset (in seconds)
        uint256 deadline = block.timestamp + _deadlineOffset;
        // Create a new Crowdfund campaign. Note: the constructor requires non-empty name and image.
        Crowdfund campaign = new Crowdfund(
            _campaignOwner,
            "Test Campaign",
            "Test Description",
            _target,
            deadline,
            "TestImage"
        );
        return campaign;
    }

    ////////////////////////////////////////////////////////////
    // Test Case 1: Donation Success and State Update
    ////////////////////////////////////////////////////////////
    function test_donate_success() public {
        console.log("Running test_donate_success");

        // Create a campaign with owner as msg.sender
        Crowdfund campaign = _createCampaign(address(this), TARGET_AMOUNT, 10 days);

        // Check initial donor state
        uint256 initialTotal = campaign.totalDonations();
        assertEq(initialTotal, 0, "Initial total donations should be zero");

        // Donate 1 ether from this contract
        uint256 donateAmount = 1 ether;
        campaign.donate{value: donateAmount}();

        // Verify donation recorded
        uint256 donated = campaign.donationAmounts(address(this));
        assertEq(donated, donateAmount, "Donation amount not recorded correctly");

        // Verify that the total donations increased
        uint256 newTotal = campaign.totalDonations();
        assertEq(newTotal, donateAmount, "Total donations should equal donated amount");

        // Verify that the donor is added in the donators list (first donor)
        address donorAddress = campaign.donators(0);
        assertEq(donorAddress, address(this), "Donor not recorded correctly");
    }

    ////////////////////////////////////////////////////////////
    // Test Case 2: Donation with Zero Value Should Revert
    ////////////////////////////////////////////////////////////
    function test_donate_zero_shouldRevert() public {
        console.log("Running test_donate_zero_shouldRevert");
        Crowdfund campaign = _createCampaign(address(this), TARGET_AMOUNT, 10 days);

        // Expect to revert because donation value is zero
        vm.expectRevert("Must donate some ETH to donate");
        campaign.donate{value: 0}();
    }

    ////////////////////////////////////////////////////////////
    // Test Case 3: Withdraw Funds Successfully After Reaching Target
    ////////////////////////////////////////////////////////////
    function test_withdraw_success() public {
        console.log("Running test_withdraw_success");
        // Create campaign with target 5 ether so that a single donation meets the target.
        Crowdfund campaign = _createCampaign(address(this), 5 ether, 10 days);

        // Donate 5 ether from the owner (address(this)), meeting the target.
        uint256 donateAmount = 5 ether;
        campaign.donate{value: donateAmount}();

        // Verify state becomes Success due to donation reaching/exceeding target.
        Crowdfund.CampaignState state = campaign.getState();
        assertEq(uint(state), uint(Crowdfund.CampaignState.Success), "Campaign should be successful");

        // Record balance of owner before withdrawal
        uint256 ownerBalanceBefore = ownerAddr.balance;
        // Send funds to the campaign so that it holds donated ether (it already holds them)
        uint256 contractBalance = campaign.getContractBalance();
        assertEq(contractBalance, donateAmount, "Campaign contract balance incorrect");

        // Withdraw funds as the owner.
        vm.prank(address(this)); // owner is address(this) for this test
        campaign.withdraw();

        // After withdrawal, the contract balance should be zero.
        uint256 contractBalanceAfter = campaign.getContractBalance();
        assertEq(contractBalanceAfter, 0, "Campaign contract should have zero balance after withdrawal");
    }

    ////////////////////////////////////////////////////////////
    // Test Case 4: Refund Funds After Campaign Failure
    ////////////////////////////////////////////////////////////
    function test_refund_success() public {
        console.log("Running test_refund_success");

        // Create campaign with target 10 ether, deadline 1 day from now.
        Crowdfund campaign = _createCampaign(address(this), TARGET_AMOUNT, 1 days);

        // Use donor1 to donate 1 ether (campaign will not meet target)
        vm.prank(donor1);
        campaign.donate{value: 1 ether}();

        // Fast forward time beyond deadline so campaign state becomes Fail
        vm.warp(block.timestamp + 2 days);

        // Before refund, check donation amount is recorded
        uint256 donated = campaign.donationAmounts(donor1);
        assertEq(donated, 1 ether, "Donation not recorded correctly");

        // Capture donor1 balance before refund
        uint256 donorBalanceBefore = donor1.balance;

        // Call refund from donor1
        vm.prank(donor1);
        campaign.refund();

        // After refund, donation record should be 0
        uint256 donatedAfter = campaign.donationAmounts(donor1);
        assertEq(donatedAfter, 0, "Donation amount should be reset after refund");

        // And the donor's balance should have increased by ~1 ether (ignoring gas)
        uint256 donorBalanceAfter = donor1.balance;
        assertApproxEqAbs(donorBalanceAfter, donorBalanceBefore + 1 ether, 1 wei);
    }

    ////////////////////////////////////////////////////////////
    // Test Case 5: Propose Deadline Extension (Only Owner, Conditions Met)
    ////////////////////////////////////////////////////////////
    function test_proposeDeadlineExtension_success() public {
        console.log("Running test_proposeDeadlineExtension_success");
        // Create campaign with TARGET_AMOUNT and long deadline.
        Crowdfund campaign = _createCampaign(address(this), TARGET_AMOUNT, 10 days);

        // Donate 5 ether from this contract to meet >= 50% of target (5*2 == 10)
        uint256 donateAmount = 5 ether;
        campaign.donate{value: donateAmount}();

        // Propose a deadline extension for 2 days by the owner (address(this))
        uint256 proposalDays = 2;
        campaign.proposeDeadlineExtension(proposalDays);

        // Check that donation is locked for new incoming funds during proposal
        vm.expectRevert("voting period now, cannot donate");
        campaign.donate{value: 0.1 ether}();

        // As we cannot directly read the internal struct fields (due to mapping),
        // we validate by checking that voteEndTime is set as expected.
        uint256 voteEndTime = campaign.voteEndTime();
        assertEq(voteEndTime, block.timestamp + 3 days, "Vote end time incorrect");
    }

    ////////////////////////////////////////////////////////////
    // Test Case 6: Vote on Deadline Extension and Confirm Extension
    ////////////////////////////////////////////////////////////
    function test_voteAndConfirmDeadlineExtension_success() public {
        console.log("Running test_voteAndConfirmDeadlineExtension_success");
        // Create a campaign with target 10 ether.
        Crowdfund campaign = _createCampaign(address(this), TARGET_AMOUNT, 10 days);

        // Use donor1 to donate 5 ether to meet the condition (>=50% of target).
        vm.prank(donor1);
        campaign.donate{value: 5 ether}();

        // Propose deadline extension as owner.
        vm.prank(address(this));
        campaign.proposeDeadlineExtension(2); // proposing a 2-day extension

        // donor1 (a valid donator) votes for the extension.
        vm.prank(donor1);
        campaign.voteOnDeadlineExtension(true);

        // Warp time beyond voting period (3 days period).
        vm.warp(block.timestamp + 4 days);

        // Capture current deadline.
        uint256 oldDeadline = campaign.deadline();
        // Confirm the voting result.
        campaign.confirmDeadlineExtension();

        // Expect deadline extended by 2 days (i.e., oldDeadline + 2 days)
        uint256 newDeadline = campaign.deadline();
        assertEq(newDeadline, oldDeadline + 2 days, "Deadline was not extended correctly");
    }

    ////////////////////////////////////////////////////////////
    // Test Case 7: Voting Reverts When Donator Votes Twice
    ////////////////////////////////////////////////////////////
    function test_voteReverts_whenAlreadyVoted() public {
        console.log("Running test_voteReverts_whenAlreadyVoted");
        Crowdfund campaign = _createCampaign(address(this), TARGET_AMOUNT, 10 days);

        // Donate from donor1 to be eligible for voting.
        vm.prank(donor1);
        campaign.donate{value: 5 ether}();

        // Propose deadline extension by owner.
        vm.prank(address(this));
        campaign.proposeDeadlineExtension(1);

        // donor1 votes once
        vm.prank(donor1);
        campaign.voteOnDeadlineExtension(true);

        // donor1 tries to vote a second time; expect revert
        vm.prank(donor1);
        vm.expectRevert("already voted");
        campaign.voteOnDeadlineExtension(true);
    }

    ////////////////////////////////////////////////////////////
    // Test Case 8: Create Campaign via Factory (Successful Creation)
    ////////////////////////////////////////////////////////////
    function test_createCampaign_inFactory() public {
        console.log("Running test_createCampaign_inFactory");

        // Deploy CrowdfundFactory
        CrowdfundFactory factory = new CrowdfundFactory();

        // Call createCampaign from a user (ownerAddr) with valid parameters.
        vm.prank(ownerAddr);
        uint256 deadline = block.timestamp + 10 days;
        factory.createCampaign("Factory Campaign", "Desc", 5 ether, deadline, "Image");

        // Retrieve campaigns list via getter
        (uint256 campaignsLength, ) = _getCampaignsLengthAndDummy(factory);

        // We expect one campaign to be created.
        assertEq(campaignsLength, 1, "Factory should have one campaign");
    }

    // Helper to extract campaigns array length from factory
    function _getCampaignsLengthAndDummy(CrowdfundFactory factory) internal view returns (uint256, uint256) {
        // Note: Since campaigns is a public array, we get its length by getting the length of campaigns().
        // However, due to limitations on dynamically returned structs in solidity, we mimic by iterating.
        // For test purpose, we assume campaigns count equals userCampaigns of ownerAddr if one campaign created.
        // Use getAllCampaigns()
        CrowdfundFactory.Campaign[] memory allCampaigns = factory.getAllCampaigns();
        return (allCampaigns.length, 0);
    }

    ////////////////////////////////////////////////////////////
    // Test Case 9: Toggle Pause in Factory Prevents Campaign Creation
    ////////////////////////////////////////////////////////////
    function test_factory_togglePause() public {
        console.log("Running test_factory_togglePause");

        // Deploy the factory contract
        CrowdfundFactory factory = new CrowdfundFactory();

        // Toggle pause using the owner (the factory owner is the deployer - which in this test is address(this))
        factory.togglePause();

        // Attempt to create a campaign while paused should revert with "it is paused"
        vm.expectRevert("it is paused");
        factory.createCampaign("Paused Campaign", "Desc", 5 ether, block.timestamp + 10 days, "Image");
    }
    
    ////////////////////////////////////////////////////////////
    // Fallback and receive functions to allow the test contract to receive ETH.
    ////////////////////////////////////////////////////////////
    receive() external payable {}
    fallback() external payable {}
}

