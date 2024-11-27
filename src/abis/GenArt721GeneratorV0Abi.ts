export const GenArt721GeneratorV0Abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_dependencyRegistry",
        type: "address",
      },
    ],
    name: "DependencyRegistryUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_gunzipScriptBytecodeAddress",
        type: "address",
      },
    ],
    name: "GunzipScriptBytecodeAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_scriptyBuilder",
        type: "address",
      },
    ],
    name: "ScriptyBuilderUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_universalBytecodeStorageReader",
        type: "address",
      },
    ],
    name: "UniversalBytecodeStorageReaderUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "dependencyRegistry",
    outputs: [
      {
        internalType: "contract IDependencyRegistryV0",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "dependencyNameAndVersion",
        type: "string",
      },
    ],
    name: "getDependencyScript",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "coreContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "getOnChainStatus",
    outputs: [
      {
        internalType: "bool",
        name: "dependencyFullyOnChain",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "injectsDecentralizedStorageNetworkAssets",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "hasOffChainFlexDepRegDependencies",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "coreContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "getProjectScript",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "coreContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getTokenHtml",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "coreContract",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getTokenHtmlBase64EncodedDataUri",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gunzipScriptBytecodeAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dependencyRegistry",
        type: "address",
      },
      {
        internalType: "address",
        name: "_scriptyBuilder",
        type: "address",
      },
      {
        internalType: "address",
        name: "_gunzipScriptBytecodeAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_universalBytecodeStorageReader",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "scriptyBuilder",
    outputs: [
      {
        internalType: "contract IScriptyBuilderV2",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "universalBytecodeStorageReader",
    outputs: [
      {
        internalType: "contract IUniversalBytecodeStorageReader",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dependencyRegistry",
        type: "address",
      },
    ],
    name: "updateDependencyRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gunzipScriptBytecodeAddress",
        type: "address",
      },
    ],
    name: "updateGunzipScriptBytecodeAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_scriptyBuilder",
        type: "address",
      },
    ],
    name: "updateScriptyBuilder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_universalBytecodeStorageReader",
        type: "address",
      },
    ],
    name: "updateUniversalBytecodeStorageReader",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
