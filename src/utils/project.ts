import { PublicClient } from "viem";
import { CoreDeployment } from "@/deployments/cores";

export async function getProjectRange(
  publicClient: PublicClient,
  deployment: CoreDeployment
): Promise<[number, number]> {
  const { address: coreAddress } = deployment;

  const nextProjectId = await publicClient.readContract({
    address: coreAddress,
    abi: [
      {
        inputs: [],
        name: "nextProjectId",
        outputs: [{ type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
    functionName: "nextProjectId",
  });

  return [deployment.startingProjectId, Number(nextProjectId) - 1];
}

export async function getProjectInvocations(
  publicClient: PublicClient,
  deployment: CoreDeployment,
  projectId: number
): Promise<bigint> {
  const { version, address: coreAddress } = deployment;

  if (version === 0) {
    const projectTokenInfo = await publicClient.readContract({
      address: coreAddress,
      abi: getArt721CoreV0Abi,
      functionName: "projectTokenInfo",
      args: [BigInt(projectId)],
    });

    return projectTokenInfo[2];
  }

  if (version === 1) {
    const projectTokenInfo = await publicClient.readContract({
      address: coreAddress,
      abi: genArt721CoreV1Abi,
      functionName: "projectTokenInfo",
      args: [BigInt(projectId)],
    });

    return projectTokenInfo[2];
  }

  const projectStateData = await publicClient.readContract({
    address: coreAddress,
    abi: genArt721CoreV3Abi,
    functionName: "projectStateData",
    args: [BigInt(projectId)],
  });

  return projectStateData[0];
}

export const getArt721CoreV0Abi = [
  // Get project invocations via projectTokenInfo
  {
    inputs: [{ type: "uint256" }],
    name: "projectTokenInfo",
    outputs: [
      { name: "artistAddress", type: "address" },
      { name: "pricePerTokenInWei", type: "uint256" },
      { name: "invocations", type: "uint256" },
      { name: "maxInvocations", type: "uint256" },
      { name: "active", type: "bool" },
      { name: "additionalPayee", type: "address" },
      { name: "additionalPayeePercentage", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const genArt721CoreV1Abi = [
  // Get project invocations via projectTokenInfo
  {
    inputs: [{ type: "uint256", name: "_projectId" }],
    name: "projectTokenInfo",
    outputs: [
      { name: "artistAddress", type: "address" },
      { name: "pricePerTokenInWei", type: "uint256" },
      { name: "invocations", type: "uint256" },
      { name: "maxInvocations", type: "uint256" },
      { name: "active", type: "bool" },
      { name: "additionalPayee", type: "address" },
      { name: "additionalPayeePercentage", type: "uint256" },
      { name: "currency", type: "string" },
      { name: "currencyAddress", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const genArt721CoreV3Abi = [
  // Get project state data including invocations
  {
    inputs: [{ type: "uint256", name: "_projectId" }],
    name: "projectStateData",
    outputs: [
      { name: "invocations", type: "uint256" },
      { name: "maxInvocations", type: "uint256" },
      { name: "active", type: "bool" },
      { name: "paused", type: "bool" },
      { name: "completedTimestamp", type: "uint256" },
      { name: "locked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
