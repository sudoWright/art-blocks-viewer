import { generatorDeployments } from "@/deployments/generator";
import { coreDeployments } from "@/deployments/cores";
import { mainnet, sepolia } from "viem/chains";

export const networkNameToChainMap = {
  mainnet: mainnet,
  sepolia: sepolia,
};

// @dev default to mainnet if network env var not populated
export const network =
  networkNameToChainMap[
    (import.meta.env.VITE_NETWORK || "mainnet") as "mainnet" | "sepolia"
  ];

export const generatorAddress = generatorDeployments[network.id];
export const networkCoreDeployments = coreDeployments[network.id];
