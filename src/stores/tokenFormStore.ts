import { create } from "zustand";
import { getProjectRange, getProjectInvocations } from "@/utils/project";
import { networkCoreDeployments } from "@/utils/env";
import { usePublicClientStore } from "./publicClientStore";

// Helper functions for URL manipulation
const getInitialStateFromURL = () => {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    contractAddress: params.get("contractAddress") || undefined,
    projectId: params.get("projectId")
      ? Number(params.get("projectId"))
      : undefined,
    tokenInvocation: params.get("tokenInvocation")
      ? Number(params.get("tokenInvocation"))
      : undefined,
  };
};

const updateURLParams = (params: Record<string, string | undefined>) => {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  window.history.pushState({}, "", url);
};

interface TokenState {
  // State
  contractAddress: string | undefined;
  projectId: number | undefined;
  tokenInvocation: number | undefined;
  projectRange: [number, number] | null;
  invocations: number | null;
  isLoading: {
    projectRange: boolean;
    invocations: boolean;
  };
  // Actions
  setContractAddress: (address: string) => Promise<void>;
  setProjectId: (id: number) => Promise<void>;
  setTokenInvocation: (invocation: number) => void;
  initialize: () => Promise<void>;
}

export const useTokenFormStore = create<TokenState>((set, get) => ({
  // Initial state merged with URL params
  ...{
    contractAddress: undefined,
    projectId: undefined,
    tokenInvocation: undefined,
    projectRange: null,
    invocations: null,
    isLoading: {
      projectRange: false,
      invocations: false,
    },
  },
  ...getInitialStateFromURL(),

  // Actions
  setContractAddress: async (address: string) => {
    const { publicClient } = usePublicClientStore.getState();
    set({ contractAddress: address });
    updateURLParams({ contractAddress: address });

    // Reset and load new project range
    set({
      projectRange: null,
      projectId: undefined,
      isLoading: { ...get().isLoading, projectRange: true },
    });
    updateURLParams({ projectId: undefined, tokenInvocation: undefined });

    const coreDeployment = networkCoreDeployments.find(
      (d) => d.address.toLowerCase() === address.toLowerCase()
    );

    if (coreDeployment) {
      const range = await getProjectRange(publicClient, coreDeployment);
      set({
        projectRange: range,
        projectId: range[0], // Auto-select first project,
        invocations: null,
        tokenInvocation: 0,
        isLoading: { ...get().isLoading, projectRange: false },
      });
      updateURLParams({ projectId: range[0].toString() });
    }
  },

  setProjectId: async (id: number) => {
    const { publicClient } = usePublicClientStore.getState();
    set({ projectId: id });
    updateURLParams({ projectId: id.toString() });

    // Reset and load new invocations
    set({
      invocations: null,
      tokenInvocation: undefined,
      isLoading: { ...get().isLoading, invocations: true },
    });
    updateURLParams({ tokenInvocation: undefined });

    const { contractAddress } = get();
    const coreDeployment = networkCoreDeployments.find(
      (d) => d.address.toLowerCase() === contractAddress?.toLowerCase()
    );

    if (coreDeployment) {
      const invocations = await getProjectInvocations(
        publicClient,
        coreDeployment,
        id
      );
      set({
        invocations: Number(invocations),
        tokenInvocation: 0, // Auto-select first token
        isLoading: { ...get().isLoading, invocations: false },
      });
      updateURLParams({ tokenInvocation: "0" });
    }
  },

  setTokenInvocation: (invocation: number) => {
    set({ tokenInvocation: invocation });
    updateURLParams({ tokenInvocation: invocation.toString() });
  },

  initialize: async () => {
    const { publicClient } = usePublicClientStore.getState();
    const { contractAddress } = get();

    // If we have a contract address from URL, load its data
    if (contractAddress) {
      const coreDeployment = networkCoreDeployments.find(
        (d) => d.address.toLowerCase() === contractAddress.toLowerCase()
      );

      if (coreDeployment) {
        set({ isLoading: { ...get().isLoading, projectRange: true } });
        const range = await getProjectRange(publicClient, coreDeployment);
        set({
          projectRange: range,
          isLoading: { ...get().isLoading, projectRange: false },
        });

        // If we have a project ID from URL, load its invocations
        const { projectId } = get();
        if (projectId !== undefined) {
          set({ isLoading: { ...get().isLoading, invocations: true } });
          const invocations = await getProjectInvocations(
            publicClient,
            coreDeployment,
            projectId
          );
          set({
            invocations: Number(invocations),
            isLoading: { ...get().isLoading, invocations: false },
            tokenInvocation: get().tokenInvocation ?? 0,
          });
        }
      }
    } else {
      // If no contract address, set default
      await get().setContractAddress(networkCoreDeployments[0].address);
    }
  },
}));
