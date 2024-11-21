import { network } from "@/utils/env";
import { createPublicClient, http, PublicClient } from "viem";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

function createPublicClientFromUrl(url: string) {
  return createPublicClient({
    chain: network,
    transport: http(url),
  });
}

interface PublicClientState {
  // State
  jsonRpcUrl: string;
  publicClient: PublicClient;

  // Actions
  setJsonRpcUrl: (url: string) => void;
  resetJsonRpcUrl: () => void;
}

export const usePublicClientStore = create<PublicClientState>()(
  persist(
    (set) => {
      return {
        jsonRpcUrl: import.meta.env.VITE_JSON_RPC_PROVIDER_URL,
        publicClient: createPublicClientFromUrl(
          import.meta.env.VITE_JSON_RPC_PROVIDER_URL
        ),
        setJsonRpcUrl: (url: string) => {
          set({
            jsonRpcUrl: url,
            publicClient: createPublicClientFromUrl(url),
          });
        },
        resetJsonRpcUrl: () => {
          set({
            jsonRpcUrl: import.meta.env.VITE_JSON_RPC_PROVIDER_URL,
            publicClient: createPublicClientFromUrl(
              import.meta.env.VITE_JSON_RPC_PROVIDER_URL
            ),
          });
        },
      };
    },
    {
      name: "public-client",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        jsonRpcUrl: state.jsonRpcUrl,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        if (
          typeof persistedState === "object" &&
          "jsonRpcUrl" in persistedState &&
          typeof persistedState.jsonRpcUrl === "string"
        ) {
          return {
            ...currentState,
            jsonRpcUrl: persistedState.jsonRpcUrl,
            publicClient: createPublicClientFromUrl(persistedState.jsonRpcUrl),
          };
        }
        return currentState;
      },
    }
  )
);
