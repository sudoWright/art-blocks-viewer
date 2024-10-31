# Art Blocks On-Chain Generator Viewer

This repository contains a viewer application for the Art Blocks On-Chain Generator.

## [https://artblocks.github.io/on-chain-generator-viewer](https://artblocks.github.io/on-chain-generator-viewer)

> You may also run the application locally by following the instructions below

## Overview

The Art Blocks On-Chain Generator is a unique smart contract that assembles various on-chain resources, including project scripts, dependency scripts, and token data into a cohesive template. All of these components are stored on-chain. The generator leverages Scripty.sol to efficiently orchestrate the integration of these resources, producing the executable code needed to render an Art Blocks NFT in a web browser.

This viewer application retrieves the data URI of the NFT from a single contract call and injects it as the source of an iframe to display the token.

No dependencies on off-chain Art Blocks APIs are required to view the NFTs. The viewer application is designed to be self-contained and can be run locally.

## Usage

Before running the application, you may optionally create a `.env.local` file in the root directory of the project based on `.env.example`. This file allows you to specify the network and RPC endpoint to use when fetching NFT data. If you do not create a `.env.local` file, the application will default to using mainnet and a public viem RPC endpoint.

To run the application, use the following commands:

```
npm install
npm run dev
```

To fill out a form and view a supported Art Blocks artwork, navigate to `http://localhost:5173/on-chain-generator-viewer/`.

To view an Art Blocks artwork directly, navigate to `http://localhost:5173/on-chain-generator-viewer/<contract-address>/<token-id>`, replacing <contract-address> and <token-id> with the address of the NFT contract and the ID of the token you want to view. The application will fetch the data URI for the NFT and display it within an iframe.
