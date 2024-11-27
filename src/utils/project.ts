import { Hex, PublicClient } from "viem";
import { CoreDeployment } from "@/deployments/cores";
import { dependencyRegistryAddress, generatorAddress } from "./env";
import { GenArt721GeneratorV0Abi } from "@/abis/GenArt721GeneratorV0Abi";

export async function getProjectOnChainStatus(
  publicClient: PublicClient,
  deployment: CoreDeployment,
  projectId: number
): Promise<{
  dependencyFullyOnChain: boolean;
  injectsDecentralizedStorageNetworkAssets: boolean;
  hasOffChainFlexDepRegDependencies: boolean;
}> {
  const onChainStatus = await publicClient.readContract({
    address: generatorAddress,
    abi: GenArt721GeneratorV0Abi,
    functionName: "getOnChainStatus",
    args: [deployment.address, BigInt(projectId)],
  });

  return {
    dependencyFullyOnChain: onChainStatus[0],
    injectsDecentralizedStorageNetworkAssets: onChainStatus[1],
    hasOffChainFlexDepRegDependencies: onChainStatus[2],
  };
}

export async function getSupportedCoreContracts(
  publicClient: PublicClient
): Promise<Hex[]> {
  const supportedCoreContracts = await publicClient.readContract({
    address: dependencyRegistryAddress,
    abi: [
      {
        inputs: [],
        name: "getSupportedCoreContracts",
        outputs: [
          {
            internalType: "address[]",
            name: "",
            type: "address[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
    functionName: "getSupportedCoreContracts",
  });

  return [...supportedCoreContracts];
}

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

  let startingProjectId = deployment.startingProjectId;
  if (!startingProjectId) {
    try {
      startingProjectId = Number(
        await publicClient.readContract({
          address: coreAddress,
          abi: [
            {
              inputs: [],
              name: "startingProjectId",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ] as const,
          functionName: "startingProjectId",
        })
      );
    } catch (e) {
      startingProjectId = 0;
    }
  }

  return [
    startingProjectId,
    Math.max(startingProjectId, Number(nextProjectId) - 1),
  ];
}

export async function getProjectInvocations(
  publicClient: PublicClient,
  deployment: CoreDeployment,
  projectId: number
): Promise<bigint> {
  const { version, address: coreAddress } = deployment;
  const v0Request = publicClient.readContract({
    address: coreAddress,
    abi: getArt721CoreV0Abi,
    functionName: "projectTokenInfo",
    args: [BigInt(projectId)],
  });
  const v1Request = publicClient.readContract({
    address: coreAddress,
    abi: genArt721CoreV1Abi,
    functionName: "projectTokenInfo",
    args: [BigInt(projectId)],
  });
  const v3Request = publicClient.readContract({
    address: coreAddress,
    abi: genArt721CoreV3Abi,
    functionName: "projectStateData",
    args: [BigInt(projectId)],
  });

  if (version === 0) {
    const projectTokenInfo = await v0Request;
    return projectTokenInfo[2];
  }

  if (version === 1) {
    const projectTokenInfo = await v1Request;
    return projectTokenInfo[2];
  }

  if (version === 3) {
    const projectStateData = await v3Request;
    return projectStateData[0];
  }

  const [v0Result, v1Result, v3Result] = await Promise.allSettled([
    v0Request,
    v1Request,
    v3Request,
  ] as const);

  if (v0Result.status === "fulfilled") {
    return v0Result.value[2];
  }

  if (v1Result.status === "fulfilled") {
    return v1Result.value[2];
  }

  if (v3Result.status === "fulfilled") {
    return v3Result.value[0];
  }

  return BigInt(0);
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
