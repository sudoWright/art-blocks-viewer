import { publicClient } from "@/utils/env";
import { useEffect, useRef, useState } from "react";
import { Hex } from "viem";
import { GenArt721GeneratorV0Abi } from "./abis/GenArt721GeneratorV0Abi";
import { TokenForm } from "./components/TokenForm";
import { generatorAddress } from "@/utils/env";
import { useSearchParams } from "./hooks/useSearchParams";
import { Loader2, Maximize } from "lucide-react";
import { cn } from "./lib/utils";
import { useIdle } from "./hooks/useIdle";

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const {
    params: { contractAddress, projectId, tokenInvocation },
  } = useSearchParams();

  const isIdle = useIdle();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataHtml, setDataHtml] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTokenData() {
      if (!contractAddress || !projectId || !tokenInvocation) {
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
  }, [contractAddress, tokenInvocation, projectId]);

  return (
    <>
      <div className="absolute inset-0">
        <div className="absolute z-20 sm:top-10 sm:left-10 sm:w-[350px] sm:bottom-auto bottom-4 left-4 right-4">
          <TokenForm />
        </div>
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-50 pointer-events-none opacity-0 transition-opacity duration-300",
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
            "absolute p-4 rounded-full bottom-4 right-4 sm:bottom-10 sm:right-10 bg-black bg-opacity-50 hover:bg-opacity-80 transition-all duration-500",
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
      </div>
    </>
  );
}

export default App;
