# De Funds
[Try De Funds Here (Ethereum Sepolia Testnet)](https://hyhen115.github.io/DeFunds/)
## Description
A **decentralized crowdfunding platform with voting mechanism** built with **React**, **Vite**, **web3.js**, **TailwindCSS**, **Material-UI**, **Boostrap** and **Ethereum**, **Solidity**. Users can create and fund campaigns using ETH. Smart contracts (`Crowdfund` and `CrowdfundFactory`) manage campaign logic, ensuring transparency and security.

## Table of Content
- [Description](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#description)
- [Table of Content](https://github.com/Hyhen115/crowdfunding-dapp#table-of-content)
- [App Preview](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#app-preview)
  - [App Demo](https://github.com/Hyhen115/crowdfunding-dapp#app-demo)
  - [Features](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#connect-your-metamask-wallet--explore-different-campaigns)
- [Guidelines](https://github.com/Hyhen115/crowdfunding-dapp#guidelines)
- [Libraries](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#libraries)
- [Running](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#running)
  - [Prerequisites](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#prerequisites)
  - [Installation](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#installation)
- [Architecture](https://github.com/Hyhen115/crowdfunding-dapp#architecture)
- [Security Measures](https://github.com/Hyhen115/crowdfunding-dapp#security-measures)

## App Preview
#### App Demo
> Please Connect Your MetaMask Wallet to **Ethereum Sepolia Testnet** Before Trying out the demo

[De Funds Website LINK HERE](https://hyhen115.github.io/DeFunds/)

#### Connect your MetaMask Wallet & Explore Different Campaigns
![dapp-v1](https://github.com/user-attachments/assets/b9091c40-9dda-4861-9bcc-5d74192fc097)
#### Create & Manage your own Campaigns
![dapp-v2](https://github.com/user-attachments/assets/517cc4f3-2882-44ab-a133-f6e13529a0b3)
#### Propose Deadline Extensions
![dapp-v3](https://github.com/user-attachments/assets/90baf6b0-dc23-455b-b0f6-54dcf14b783d)
#### Donate & Vote for your supported Campaigns
![dapp-v4-1](https://github.com/user-attachments/assets/c4693f6f-b106-40c2-9739-fd60d02852cb)
![dapp-v4-2](https://github.com/user-attachments/assets/efd7c31a-7b56-41da-820f-7f913a56cb79)
#### Get Funds for your Projects
![dapp-v5](https://github.com/user-attachments/assets/e30df0c9-1a3a-4a79-ac38-05b4ddc1becf)
#### Refund if Campaigns are Failed
![dapp-v6](https://github.com/user-attachments/assets/cf0ec4b6-8752-4517-a37f-7f04edcd489b)
## Guidelines
- **Connect to Wallet**
  - Connect your MetaMask wallet in order to use any functions of the DApp
    > Make sure your wallet's ETH network is same as the DApp contract Demo Here uses [Ethereum Sepolia Testnet](https://sepolia.dev/) [sepolia etherscan](https://sepolia.etherscan.io/)
- **Explore Campaigns**
  - Scroll down and Explore Different Campaigns on the Home Page
- **Create Campaigns**
  - Create Campaigns by setting up the details and uploading image
- **Donate to Campaigns**
  - Support your favourate Campaign using ETH
- **Get Refunds**
  - if the Campaign Fails, You can request for a refunds for your donation fees
- **Propose Deadline Extensions**
  - Campaign Owner can Propose a **3 Day Deadline Extension Proposal** to your donators to vote for if they allows you to extend your deadline of your project
  - there will be a voting weight for each donators based on how much they support your campaign
    > Donating 100 ETH can have weight of 100 votes on Deadline Extension Proposals to encourage donators partipitation in votes and campaign donations
  - when the Extension proposal ends, campain owner can confirm the voting result and extend the deadline
- **Get Funds**
  - Campaign Owners can **Only** Withdraw Funds from the crowdfunding Campaign met its target
## Libraries
- react
- vite
- tailwindcss
- material ui
- web3
- ethereum-blockies-base64
  
> for detail libraries versions and plugins please check package.json
## Running
### Prerequisites
- Node.js (version >= 16)
- npm (comes with Node.js)
- Ethereum wallet (MetaMask)
- Smart contract deployed on an Ethereum network (testnet/mainnet)
### Installation
1. Clone the Repo
```
git clone https://github.com/Hyhen115/DeFunds.git
cd DeFunds
```
2. Install Dependencies
```
npm install
```
3. Start Development server (for dev)
```
npm run dev
```
4. Build the project
```
npm run build
```
## Architecture

### Smart Contracts
- ```crowdfunding.sol``` Handle donation, Voting, Withdraw Funds, State...
- ```crowdfundingFactory.sol``` Create and track crowdfunding campaign contracts
### Frontend
- Connect to ETH Sepolia testnet via MetaMask providers
- Provide UI for Campaign Details, Manage Campaigns, Voting, Donations and more

## Security measures
for more detailed description of the security measures of ```crowdfunding.sol``` and ```crowdfundingFactory.sol``` please refer to the report provided
### ```crowdfundingFactory.sol```

#### 1. ReentrancyGuard – `nonReentrant` Modifier
- apply to ```createCampaign()```.
  > **Prevents reentrancy attacks**, ensure external calls (e.g., contract creation) cannot re-enters.

#### 2. ```onlyOwner``` Modifier
- restrict access to `togglePause()`.
  > Ensure only owner can pause or unpause campaign creation, for maintenance or emergency purposes.

#### 3. ```whenNotPaused``` Modifier
- apply to `createCampaign()`.
  > Block campaign creation when the contract is paused, allow owner to stop operations during maintenance.

#### 4. Input Validations in ```createCampaign()```
- enforce conditions on inputs.
  > Prevent invalid campaign setups.

### ```crowdfunding.sol```

#### 1. ReentrancyGuard – `nonReentrant` Modifier
- apply to ```withdraw()``` and ```refund()```.
  > **Protects against reentrancy attacks** by preventing re-entry during external calls (e.g., ```transfer()```).

#### 2. ```onlyOwner``` Modifier
- restructive access to ```withdraw()```, ```proposeDeadlineExtension()```, and ```confirmDeadlineExtension()```.
  > Ensures that only the campaign owner can execute these sensitive operations.

#### 3. ```campaignActive``` Modifier
- apply to ```donate()```, ```proposeDeadlineExtension()```, ```voteOnDeadlineExtension()```, and ```confirmDeadlineExtension()```.
  > **Prevent invalid operations** (e.g., donate to a failed campaign).

#### 4. Input Validations for ```proposeDeadlineExtension()``` ```voteOnDeadlineExtension()``` ```confirmDeadlineExtension()```

#### 5. Safe Fund Transfers
- in ```withdraw()``` and ```refund()```, state updates occur before `transfer()`.
  > decrease risks for failed transfers or reentrancy attacks.

#### 6. Weighted Voting
- voting power of ```voteOnDeadlineExtension()``` <=> ```donationAmounts[msg.sender]```.
  > **Increases the cost of Sybil attacks**.

#### 7. Single Vote Checking
- use ```curProposal.hasVoted[msg.sender]``` to track votes.
  > **Prevents double voting**.

#### 8. Avoiding Division-by-Zero in Voting
- in ```confirmDeadlineExtension()```, uses ```votesFor * 2 > totalDonations``` instead of division.
  > **Avoids division-by-zero errors and integer truncation**.

## File Descriptions
- ```src/```
  > source code of the Dapp
- ```contract/```
  > contract of the Dapp
  > inside ```test/``` will contain test cases contracts and test results
- ```package.json```
  > app config and you can view the library used
- ```vite.config.js```
  > vite config
- ```report/```
  > detailed report
