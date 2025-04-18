
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import Foundry's Test framework and console
import {Test, console} from "forge-std/Test.sol";
// Import the tested contracts from the provided file path
import {Crowdfund, CrowdfundFactory} from "../src/test_20980517_1744950497.sol";

contract CrowdfundTest is Test {
    // Instance of the Crowdfund campaign under test
    Crowdfund public campaign;
    // Instance of the CrowdfundFactory contract under test
    CrowdfundFactory public factory;

    // Addresses used in testing 
    address public owner;    // campaign owner
    address public donor1;   // donor account 1
    address public donor2;   // donor account 2
    address public nonDonor; // an account that never donated

    // Common campaign parameters for testing
    string public campaignName = "Test Campaign";
    string public description = "Campaign for unit testing.";
    uint256 public target = 10 ether; // target fund 
    uint256 public deadline;          // campaign deadline
    string public image = "ipfs://image";

    // Voting period constant is defined in the Crowdfund contract (3 days)
    uint256 constant VOTING_PERIOD = 3 days;

    // ================= Setup =================
    function setUp() public {
        // Assign test addresses
        owner = address(this); // our test contract is owner for campaign-related operations
        donor1 = vm.addr(1);
        donor2 = vm.addr(2);
        nonDonor = vm.addr(3);

        // Set initial ETH balances for donors and nonDonor for testing 
        vm.deal(donor1, 100 ether);
        vm.deal(donor2, 100 ether);
        vm.deal(nonDonor, 100 ether);

        // Set the campaign's deadline to 5 days from now
        deadline = block.timestamp + 5 days;

        // Deploy a new Crowdfund campaign contract with the set parameters
        campaign = new Crowdfund(owner, campaignName, description, target, deadline, image);

        // Deploy a new CrowdfundFactory contract for testing its functionality
        factory = new CrowdfundFactory();

        // Log initial state for debugging
        console.log("Campaign deployed with deadline: %s and target: %s ether", deadline, target / 1 ether);
    }
    // =========================================

    // ======= Crowdfund Campaign Tests =======

    // Test successful donation flow:
    // - A donor sends ETH which updates donation amount, adds donor to list, and campaign remains active.
    function test_donate_success() public {
        console.log("Running test_donate_success");

        uint256 donationAmount = 2 ether;
        // donor1 makes a donation
        vm.prank(donor1);
        campaign.donate{value: donationAmount}();

        // Check donation record
        uint256 recordedDonation = campaign.donationAmounts(donor1);
        assertEq(recordedDonation, donationAmount, "Donation amount not recorded correctly");

        // Check that donor1 is registered (hasDonated mapping should be true)
        bool donated = campaign.hasDonated(donor1);
        assertTrue(donated, "Donor was not registered");

        // Campaign state should still be Active because target not reached and deadline not passed.
        Crowdfund.CampaignState state = campaign.getState();
        assertEq(uint(state), uint(Crowdfund.CampaignState.Active), "Campaign state should be Active");
    }

    // Test that donation with zero value reverts.
    function test_donate_zero_revert() public {
        console.log("Running test_donate_zero_revert");
        vm.prank(donor1);
        vm.expectRevert(bytes("Must donate some ETH to donate"));
        campaign.donate{value: 0}();
    }

    // Test that donation is not allowed during an active voting period.
    function test_donate_during_voting_revert() public {
        console.log("Running test_donate_during_voting_revert");
        // First, have donor1 donate so that they can participate in voting if needed.
        vm.prank(donor1);
        campaign.donate{value: 1 ether}();

        // Owner initiates a deadline extension proposal.
        campaign.proposeDeadlineExtension(2);

        // Now, any donation attempt should revert due to active voting period.
        vm.prank(donor2);
        vm.expectRevert(bytes("voting period now, cannot donate"));
        campaign.donate{value: 1 ether}();
    }

    // Test successful withdrawal:
    // - Accumulate donations meeting or exceeding target.
    // - Only the owner can withdraw.
    // - Withdrawal transfers funds to the owner.
    function test_withdraw_success() public {
        console.log("Running test_withdraw_success");

        // Make donations from donor1 and donor2 so that total meets target.
        uint256 donation1 = 6 ether;
        uint256 donation2 = 5 ether;

        vm.prank(donor1);
        campaign.donate{value: donation1}();

        vm.prank(donor2);
        campaign.donate{value: donation2}();

        // Campaign should now have reached or exceeded the target.
        assertGe(address(campaign).balance, target);

        // Record owner's balance before withdraw.
        uint256 ownerBalanceBefore = owner.balance;

        // Call withdraw as owner.
        campaign.withdraw();

        // After withdrawal, campaign balance should be zero.
        assertEq(address(campaign).balance, 0, "Campaign balance should be zero after withdrawal");

        // Owner's balance should increase by the withdrawn amount.
        uint256 ownerBalanceAfter = owner.balance;
        assertGe(ownerBalanceAfter, ownerBalanceBefore + donation1 + donation2);
    }

    // Test that only the owner can withdraw: a non-owner call should revert.
    function test_withdraw_onlyOwner_revert() public {
        console.log("Running test_withdraw_onlyOwner_revert");

        // Make donations to meet target.
        vm.prank(donor1);
        campaign.donate{value: 10 ether}();

        // Try to withdraw using donor1 (non-owner)
        vm.prank(donor1);
        vm.expectRevert(bytes("only owner"));
        campaign.withdraw();
    }

    // Test refund functionality for a failed campaign:
    // - Donor donates.
    // - Time is advanced past deadline without meeting target.
    // - Donor can refund his donation.
    function test_refund_success() public {
        console.log("Running test_refund_success");

        uint256 donationAmount = 2 ether;
        // donor1 donates some ETH
        vm.prank(donor1);
        campaign.donate{value: donationAmount}();

        // Advance time past deadline so that the campaign fails because target is not met.
        vm.warp(deadline + 1);

        // Ensure that campaign state becomes Fail.
        Crowdfund.CampaignState state = campaign.getState();
        assertEq(uint(state), uint(Crowdfund.CampaignState.Fail), "Campaign state should be Fail");

        // Record donor1's balance before refund.
        uint256 donorBalanceBefore = donor1.balance;

        // donor1 calls refund.
        vm.prank(donor1);
        campaign.refund();

        // After refund, donation amount for donor1 should be zero.
        uint256 recordedDonation = campaign.donationAmounts(donor1);
        assertEq(recordedDonation, 0, "Donation record should be zero after refund");

        // Optionally, you can check that donor1's balance has increased by the refund amount.
        uint256 donorBalanceAfter = donor1.balance;
        assertGe(donorBalanceAfter, donorBalanceBefore + donationAmount);
    }

    // Test refund for a non-donator fails.
    function test_refund_nonDonor_revert() public {
        console.log("Running test_refund_nonDonor_revert");

        // Advance time past deadline (simulate failure) so that refund is allowed.
        vm.warp(deadline + 1);

        // nonDonor, who never donated, should be unable to refund.
        vm.prank(nonDonor);
        vm.expectRevert(bytes("No fund to refund"));
        campaign.refund();
    }

    // Test the voting process for a deadline extension where the proposal passes:
    // - Owner proposes an extension.
    // - Donors vote and the votes in favor exceed the 50% threshold of total donations.
    // - Confirming the vote extends the deadline.
    function test_proposeAndVoteExtension_success() public {
        console.log("Running test_proposeAndVoteExtension_success");

        // donor1 and donor2 donate to gain vote power.
        uint256 donation1 = 3 ether;
        uint256 donation2 = 3 ether;
        vm.prank(donor1);
        campaign.donate{value: donation1}();
        vm.prank(donor2);
        campaign.donate{value: donation2}();

        // Owner proposes a deadline extension of 2 days.
        campaign.proposeDeadlineExtension(2);
        uint256 originalDeadline = deadline; // original deadline from setUp

        // donor1 votes in favor. Their vote power is 3 ether.
        vm.prank(donor1);
        campaign.voteOnDeadlineExtension(true);

        // donor2 votes against. Their vote power is 3 ether.
        // To simulate a passing vote, we let donor2 abstain.

        // Advance time past voting period.
        vm.warp(block.timestamp + VOTING_PERIOD + 1);

        // Confirm deadline extension vote.
        campaign.confirmDeadlineExtension();

        // Simulate new campaign to ensure a passing vote:
        Crowdfund campaign2 = new Crowdfund(owner, campaignName, description, target, deadline, image);
        vm.prank(donor1);
        campaign2.donate{value: 4 ether}(); // only donation; total = 4
        // Owner proposes extension of 3 days.
        campaign2.proposeDeadlineExtension(3);
        // donor1 votes in favor.
        vm.prank(donor1);
        campaign2.voteOnDeadlineExtension(true);
        // Advance time and confirm.
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        uint256 priorDeadline = campaign2.deadline();
        campaign2.confirmDeadlineExtension();
        uint256 newDeadline = campaign2.deadline();

        // Check that the deadline was extended by 3 days (in seconds)
        assertEq(newDeadline, priorDeadline + 3 days, "Deadline was not correctly extended");
    }

    // Test the voting process for a deadline extension where the proposal fails:
    // - Less than required votes are cast.
    // - Confirming the vote does not change the deadline.
    function test_proposeAndVoteExtension_fail() public {
        console.log("Running test_proposeAndVoteExtension_fail");

        // donor1 and donor2 donate.
        uint256 donation1 = 3 ether;
        uint256 donation2 = 3 ether;
        vm.prank(donor1);
        campaign.donate{value: donation1}();
        vm.prank(donor2);
        campaign.donate{value: donation2}();
        // Total donation = 6 ether. To pass, votesFor must be > 3 ether.

        // Owner proposes an extension of 2 days.
        campaign.proposeDeadlineExtension(2);
        // Only donor1 votes in favor (3 ether, which is NOT >3 ether because requirement is strictly > totalDonations/2)
        vm.prank(donor1);
        campaign.voteOnDeadlineExtension(true);

        // Advance past voting period.
        vm.warp(block.timestamp + VOTING_PERIOD + 1);

        // Save deadline before confirming extension.
        uint256 currentDeadline = campaign.deadline();

        // Confirm the extension vote.
        campaign.confirmDeadlineExtension();

        // Deadline should remain unchanged (proposal failed).
        uint256 newDeadline = campaign.deadline();
        assertEq(newDeadline, currentDeadline, "Deadline should not have been extended");
    }

    // Test getState functionality:
    // - When the campaign does not meet its target and deadline has passed, the state should be Fail.
    function test_getState_afterDeadline_fail() public {
        console.log("Running test_getState_afterDeadline_fail");

        // donor1 makes a donation that is less than the target.
        vm.prank(donor1);
        campaign.donate{value: 2 ether}();

        // Advance time past the deadline.
        vm.warp(deadline + 1);

        // Check that the state is evaluated as Fail.
        Crowdfund.CampaignState currentState = campaign.getState();
        assertEq(uint(currentState), uint(Crowdfund.CampaignState.Fail), "Campaign should have failed after deadline");
    }

    // ======= CrowdfundFactory Tests =======
    
    // Test successful campaign creation via the factory.
    function test_createCampaign_success() public {
        console.log("Running test_createCampaign_success");

        // Set new campaign parameters with a future deadline.
        uint256 futureDeadline = block.timestamp + 10 days;
        string memory newName = "Factory Campaign";
        string memory newDescription = "Created via factory";
        uint256 newTarget = 5 ether;
        string memory newImage = "ipfs://factoryImage";

        // Call createCampaign from a non-owner account for the campaign (msg.sender becomes campaign owner)
        // In Foundry tests, msg.sender is the test contract. We can simulate another caller via vm.prank.
        address creator = vm.addr(10);
        vm.prank(creator);
        factory.createCampaign(newName, newDescription, newTarget, futureDeadline, newImage);

        // Simply calling getAllCampaigns to ensure the function runs.
        factory.getAllCampaigns();

        // Verify that userCampaigns mapping is updated.
        CrowdfundFactory.Campaign[] memory userCamps = factory.getUserCampaigns(creator);
        assertGt(userCamps.length, 0, "User campaigns should have at least one campaign");
    }

    // Test campaign creation reverts for invalid parameters.
    function test_createCampaign_invalidParams() public {
        console.log("Running test_createCampaign_invalidParams");
        uint256 futureDeadline = block.timestamp + 10 days;
        string memory emptyName = "";
        string memory validDesc = "Invalid campaign test";
        uint256 zeroTarget = 0;
        string memory validImage = "ipfs://invalid";

        // Test empty name
        vm.expectRevert(bytes("name is empty"));
        factory.createCampaign(emptyName, validDesc, 5 ether, futureDeadline, validImage);

        // Test target zero (non-zero check)
        vm.expectRevert(bytes("target must > 0"));
        factory.createCampaign("Valid Name", validDesc, zeroTarget, futureDeadline, validImage);

        // Test deadline in the past
        vm.expectRevert(bytes("deadline must be in the future"));
        factory.createCampaign("Valid Name", validDesc, 5 ether, block.timestamp - 1, validImage);
    }

    // Test the pause functionality of the factory:
    // - When paused, campaign creation should revert.
    function test_togglePause() public {
        console.log("Running test_togglePause");

        // Initially, factory is not paused.
        // Owner toggles pause.
        factory.togglePause();
        // Attempt to create a campaign should now revert.
        uint256 futureDeadline = block.timestamp + 10 days;
        vm.expectRevert(bytes("it is paused"));
        factory.createCampaign("Paused Campaign", "Should fail", 5 ether, futureDeadline, "ipfs://image");
    }

    // Fallback and receive functions to accept ETH transfers if needed.
    receive() external payable {}
    fallback() external payable {}
}

