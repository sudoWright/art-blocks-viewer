import { useSearchParams } from "@/hooks/useSearchParams";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { networkCoreDeployments } from "@/utils/env";
import { useCallback, useEffect, useState } from "react";
import { publicClient } from "@/utils/env";
import { getProjectInvocations, getProjectRange } from "@/utils/project";
import { Input } from "./ui/input";
import { ArtBlocksLockup } from "./ArtBlocksLockup";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, Maximize } from "lucide-react";
import { useIdle } from "@/hooks/useIdle";
import { GitHubIcon } from "./GitHubIcon";

export function TokenForm({ onFullscreen }: { onFullscreen: () => void }) {
  const {
    params: { contractAddress, projectId, tokenInvocation },
    setSearchParam,
  } = useSearchParams();

  const [projectRangeLoading, setProjectRangeLoading] = useState(false);
  const [projectRange, setProjectRange] = useState<[number, number] | null>(
    null
  );

  const [invocationsLoading, setInvocationsLoading] = useState(false);
  const [invocations, setInvocations] = useState<number | null>(null);

  // Hide the controls when the user is idle
  const isIdle = useIdle();

  const setContractAddress = useCallback(
    (address: string) => {
      setSearchParam("contractAddress", address);
    },
    [setSearchParam]
  );

  const setProjectId = useCallback(
    (id: number | undefined) => {
      setSearchParam("projectId", id?.toString());
    },
    [setSearchParam]
  );

  const setTokenInvocation = useCallback(
    (id: number | undefined) => {
      setSearchParam("tokenInvocation", id?.toString());
    },
    [setSearchParam]
  );

  const coreDeployment = networkCoreDeployments.find(
    (deployment) =>
      deployment.address.toLowerCase() === contractAddress?.toLowerCase()
  );

  useEffect(() => {
    setContractAddress(networkCoreDeployments[0].address);
  }, [setContractAddress]);

  // Get the project range when the contract address changes
  useEffect(() => {
    async function getAndAssignProjectRange() {
      if (!coreDeployment) {
        return;
      }

      setProjectRangeLoading(true);
      const range = await getProjectRange(publicClient, coreDeployment);
      setProjectRange(range);
      setProjectId(range[0]);
      setProjectRangeLoading(false);
    }

    getAndAssignProjectRange();
  }, [contractAddress, coreDeployment, setProjectId]);

  // Reset the project range and selected project id when the contract address changes
  useEffect(() => {
    setProjectRange(null);
    setProjectId(undefined);
  }, [contractAddress, setProjectId]);

  // Get the invocations when the project id changes
  useEffect(() => {
    async function getAndAssignInvocations() {
      if (!coreDeployment || !projectId) {
        return;
      }

      setInvocationsLoading(true);
      const projectInvocations = await getProjectInvocations(
        publicClient,
        coreDeployment,
        Number(projectId)
      );

      setInvocations(Number(projectInvocations));
      setTokenInvocation(0);
      setInvocationsLoading(false);
    }

    getAndAssignInvocations();
  }, [projectId, contractAddress, coreDeployment, setTokenInvocation]);

  // Reset the invocations and selected token invocation when the project id changes
  useEffect(() => {
    setTokenInvocation(undefined);
    setInvocations(null);
  }, [projectId, setTokenInvocation]);

  return (
    <>
      <div
        className={cn(
          "bg-white border border-black bg-opacity-80 token-form transition-opacity duration-500",
          {
            "opacity-0": isIdle,
          }
        )}
      >
        <div className="flex border-b border-black">
          <div className="flex-1 p-4 border-r border-black">
            <ArtBlocksLockup height={24} className="fill-black w-[132px]" />
          </div>
          <a
            href="https://github.com/ArtBlocks/on-chain-generator-viewer"
            target="_blank"
            className="p-4 opacity-50 hover:opacity-100"
          >
            <GitHubIcon fill="black" className="w-6 h-6" />
          </a>
        </div>
        <div className="flex border-b border-black">
          <label className="w-24 p-4 text-sm border-r border-black">
            Contract
          </label>
          <div className="flex-1">
            <ContractSelect
              value={contractAddress}
              handleChange={setContractAddress}
              className="p-4"
            />
          </div>
        </div>
        <InputWithLabel
          label="Project"
          value={projectId ? projectId.toString() : ""}
          onValueChange={(value) => {
            if (isNaN(Number(value))) {
              return;
            }

            setProjectId(Number(value));
          }}
          onBlur={(value) => {
            if (isNaN(Number(value)) || !projectRange) {
              return;
            }

            const clampedId = Math.max(
              Math.min(Number(value), projectRange[1]),
              projectRange[0]
            );

            setProjectId(clampedId);
          }}
          min={projectRange?.[0]}
          max={projectRange?.[1]}
          loading={projectRangeLoading}
          className="border-b border-black"
        />
        <InputWithLabel
          label="Token"
          value={tokenInvocation ? tokenInvocation.toString() : ""}
          onValueChange={(value) => {
            if (isNaN(Number(value))) {
              return;
            }

            setTokenInvocation(Number(value));
          }}
          onBlur={(value) => {
            if (!invocations || isNaN(Number(value))) {
              return;
            }

            const clampedValue = Math.max(
              Math.min(Number(value), invocations - 1),
              0
            );

            setTokenInvocation(clampedValue);
          }}
          min={0}
          max={invocations ? invocations - 1 : 0}
          loading={invocationsLoading}
          className="border-b border-black"
        />
        <div>
          <button
            className="flex items-center justify-center w-full gap-2 p-4 text-sm transition-all duration-500 bg-white bg-opacity-0 hover:bg-opacity-80"
            onClick={onFullscreen}
          >
            <Maximize className="w-4 h-4" />
            <span className="text-sm">Fullscreen</span>
          </button>
        </div>
      </div>
    </>
  );
}

export function ContractSelect({
  value,
  handleChange,
  className,
}: {
  value?: string;
  handleChange: (address: string) => void;
  className?: string;
}) {
  return (
    <Select
      value={value ?? networkCoreDeployments[0].address}
      onValueChange={handleChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a core contract" />
      </SelectTrigger>
      <SelectContent>
        {networkCoreDeployments.map((deployment) => (
          <SelectItem key={deployment.address} value={deployment.address}>
            {deployment.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function InputWithLabel({
  label,
  value,
  onValueChange,
  onBlur,
  min,
  max,
  loading,
  className,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: (value: string) => void;
  min?: number;
  max?: number;
  loading?: boolean;
  className?: string;
}) {
  const isDecrementDisabled =
    min === undefined || isNaN(Number(value)) || Number(value) <= min;
  const isIncrementDisabled =
    max === undefined || isNaN(Number(value)) || Number(value) >= max;

  return (
    <div className={cn("flex", className)}>
      <label className="w-24 p-4 text-sm border-r border-black ">{label}</label>
      <div
        className={cn(
          "flex items-center gap-4 flex-1 p-4 opacity-100 transition-opacity duration-300",
          {
            "opacity-80": loading,
          }
        )}
      >
        <button
          className="flex text-left opacity-50"
          onClick={() => onValueChange((Number(value) - 1).toString())}
          disabled={isDecrementDisabled}
        >
          <span className="text-xs text-black w-[5ch]">{min}</span>
          <ChevronLeftIcon
            className={cn("w-4 h-4", {
              "opacity-20": isDecrementDisabled,
            })}
          />
        </button>
        <Input
          className="flex-1 text-center"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          min={min}
          max={max}
        />
        <button
          className="flex text-right opacity-50"
          onClick={() => onValueChange((Number(value) + 1).toString())}
          disabled={isIncrementDisabled}
        >
          <ChevronRightIcon
            className={cn("w-4 h-4", {
              "opacity-20": isIncrementDisabled,
            })}
          />
          <span className="text-xs text-black w-[5ch]">{max}</span>
        </button>
      </div>
    </div>
  );
}
