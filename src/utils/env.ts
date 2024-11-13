import { generatorDeployments } from "@/deployments/generator";
import { coreDeployments } from "@/deployments/cores";
import { mainnet, sepolia } from "viem/chains";
import { createPublicClient, http } from "viem";

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

// @dev default to public viem http endpoint if rpc env var not populated
export const publicClient = createPublicClient({
  chain: network,
  transport: http(import.meta.env.VITE_JSON_RPC_PROVIDER_URL),
});
