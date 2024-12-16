import { generatorAddress } from "@/utils/env";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Loader2, Maximize } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Hex } from "viem";
import { useShallow } from "zustand/react/shallow";
import { GenArt721GeneratorV0Abi } from "./abis/GenArt721GeneratorV0Abi";
import { TokenForm } from "./components/TokenForm";
import { useIdle } from "./hooks/useIdle";
import { cn } from "./lib/utils";
import { usePublicClientStore } from "./stores/publicClientStore";
import { useTokenFormStore } from "./stores/tokenFormStore";
import { getProjectNameAndArtist } from "./utils/project";

function App() {
  const { publicClient } = usePublicClientStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { contractAddress, projectId, tokenInvocation } = useTokenFormStore(
    useShallow((state) => ({
      contractAddress: state.contractAddress,
      projectId: state.projectId,
      tokenInvocation: state.tokenInvocation,
    }))
  );

  const isIdle = useIdle();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataHtml, setDataHtml] = useState("");
  const [projectData, setProjectData] = useState<{
    projectName: string;
    artist: string;
  } | null>(null);

  useEffect(() => {
    if (contractAddress === undefined || projectId === undefined) return;

    const controller = new AbortController();

    async function fetchProjectData() {
      if (contractAddress === undefined || projectId === undefined) return;

      try {
        if (controller.signal.aborted) return;

        const { projectName, artist } = await getProjectNameAndArtist(
          publicClient,
          contractAddress as Hex,
          BigInt(projectId)
        );

        if (!controller.signal.aborted) {
          setProjectData({ projectName, artist });
        }
      } catch (error) {
        console.error(error);
        setProjectData(null);
      }
    }

    fetchProjectData();

    return () => {
      controller.abort();
    };
  }, [contractAddress, projectId, publicClient]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTokenData() {
      if (
        contractAddress === undefined ||
        projectId === undefined ||
        tokenInvocation === undefined
      ) {
        return;
      }

      const tokenId = Number(projectId) * 1_000_000 + Number(tokenInvocation);

      try {
        // Check if already aborted
        if (controller.signal.aborted) return;

        setLoading(true);
        const data = await publicClient.readContract({
          address: generatorAddress,
          abi: GenArt721GeneratorV0Abi,
          functionName: "getTokenHtml",
          args: [contractAddress as Hex, BigInt(tokenId)],
        });

        // Check if aborted before setting state
        if (!controller.signal.aborted) {
          setDataHtml(data);
          setError(null);
          setLoading(false);
        }
      } catch (error) {
        // Only set error if not aborted
        if (!controller.signal.aborted) {
          console.log("error", error);
          console.error(error);
          setError(
            "Error fetching token data, please make sure you've provided a valid contract address and token id combination"
          );
          setLoading(false);
        }
      }
    }

    fetchTokenData();

    // Cleanup function that aborts any in-flight request
    return () => {
      controller.abort();
    };
  }, [contractAddress, tokenInvocation, projectId, publicClient]);

  return (
    <TooltipProvider>
      <div className="absolute inset-0">
        <TokenForm />
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-50 pointer-events-none opacity-0 transition-opacity duration-300 p-4 text-center",
            {
              "opacity-100": loading || error,
            }
          )}
        >
          {(() => {
            if (loading) {
              return <Loader2 className="animate-spin" />;
            }

            if (error) {
              return <div className="text-red-500">{error}</div>;
            }

            return null;
          })()}
        </div>
        <iframe
          srcDoc={dataHtml}
          className="absolute top-0 left-0 w-full h-full"
          ref={iframeRef}
          onLoad={() => {
            const currentRef = iframeRef.current;
            if (!currentRef || !currentRef.contentWindow) return;

            const existingOnMouseMove = currentRef.contentWindow.onmousemove;
            currentRef.contentWindow.onmousemove = function (e) {
              if (!currentRef.contentWindow) return;

              if (existingOnMouseMove) {
                existingOnMouseMove.call(currentRef.contentWindow, e);
              }
              window.dispatchEvent(new MouseEvent("mousemove", e));
            };
          }}
        />
        <button
          className={cn(
            "z-10 absolute p-4 rounded-full bottom-4 right-4 sm:bottom-10 sm:right-10 bg-black bg-opacity-50 hover:bg-opacity-80 transition-all duration-500",
            {
              "opacity-0 pointer-events-none": isIdle,
            }
          )}
          onClick={() => {
            iframeRef.current?.requestFullscreen();
          }}
        >
          <Maximize className="w-5 h-5 stroke-1 stroke-white" />
        </button>
        {projectData ? (
          <div
            className={cn(
              "z-10 absolute px-4 py-2 rounded-[2px] top-4 right-4 sm:top-10 sm:right-10 bg-black bg-opacity-50 text-white transition-all duration-500 text-right",
              {
                "opacity-0 pointer-events-none": isIdle,
              }
            )}
          >
            <h1 className="font-medium">{projectData?.projectName}</h1>
            <h2>{projectData?.artist}</h2>
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

export default App;
