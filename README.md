# De Funds
## Description
A **decentralized crowdfunding platform with voting mechanism** built with **React**, **Vite**, **web3.js**, **TailwinfCSS**, **Material-UI**, **Boostrap** and **Ethereum**, **Solidity**. Users can create and fund campaigns using Ether, with campaign images uploaded via **Cloudinary**. Smart contracts (`Crowdfund` and `CrowdfundFactory`) manage campaign logic, ensuring transparency and security.

## Table of Content
- [Description](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#description)
- [Table of Content](https://github.com/Hyhen115/crowdfunding-dapp#table-of-content)
- [App Preview](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#app-preview)
  - [Connect your MetaMask Wallet & Explore Different Campaigns](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#connect-your-metamask-wallet--explore-different-campaigns)
  - [Create & Manage your own Campaigns](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#create--manage-your-own-campaigns)
  - [Propose Deadline Extensions](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#propose-deadline-extensions)
  - [Donate & Vote for your supported Campaigns](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#donate--vote-for-your-supported-campaigns)
  - [Get Funds for your Projects](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#get-funds-for-your-projects)
  - [Refund if Campaigns are Failed](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#refund-if-campaigns-are-failed)
- [Libraries](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#libraries)
- [Running](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#running)
  - [Prerequisites](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#prerequisites)
  - [Installation](https://github.com/Hyhen115/crowdfunding-dapp?tab=readme-ov-file#installation)
- [Architecture]()

## App Preview
#### App Demo
> Please Connect Your MetaMask Wallet to **Ethereum Sepolia Testnet** Before Trying out the demo

--Website Link-- [not implemented yet]

--Video Link-- [not implemented yet]

#### Connect your MetaMask Wallet & Explore Different Campaigns
![dapp-v1](https://github.com/user-attachments/assets/55d096f3-7725-44f5-b729-cf839c52ee7b)
#### Create & Manage your own Campaigns
![dapp-v2](https://github.com/user-attachments/assets/84206ea2-b286-4095-9b24-f0c2b7853d68)
#### Propose Deadline Extensions
![dapp-v3](https://github.com/user-attachments/assets/7e7c452f-7d31-4cc7-ac8a-eb5c1e798625)
#### Donate & Vote for your supported Campaigns
![dapp-v4-1](https://github.com/user-attachments/assets/19e9000c-258b-43e4-8546-ab29d20c6bd4)
![dapp-v4-2](https://github.com/user-attachments/assets/de40983c-8173-460b-8030-91cccd57f2ab)
#### Get Funds for your Projects

#### Refund if Campaigns are Failed

### Guidelines
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
  - Campaign Owner can Propose a **2 Day Deadline Extension Proposal** to your donators to vote for if they allows you to extend your deadline of your project
  - there will be a voting weight for each donators based on how much they support your campaign
    > Donating 100 ETH can have weight of 100 votes on Deadline Extension Proposals to encourage donators partipitation in votes and campaign donations
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
git clone https://github.com/Hyhen115/crowdfunding-dapp.git
cd crowdfunding-dapp
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
- Upload Images to Cloud Storage
- Provide UI for Campaign Details, Manage Campaigns, Voting, Donations and more
### Backend
- Cloud storage for storing Image user uploads
