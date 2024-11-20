import { useIdle } from "@/hooks/useIdle";
import { useSearchParams } from "@/hooks/useSearchParams";
import { cn } from "@/lib/utils";
import { networkCoreDeployments, publicClient } from "@/utils/env";
import { getProjectInvocations, getProjectRange } from "@/utils/project";
import {
  ArrowUpRight,
  ChevronLeftIcon,
  ChevronRightIcon,
  PanelBottomOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ArtBlocksLockup } from "./ArtBlocksLockup";
import { GitHubIcon } from "./GitHubIcon";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function TokenForm() {
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

  const [drawerDirection, setDrawerDirection] = useState<"left" | "bottom">(
    "left"
  );
  useEffect(() => {
    const handleResize = () => {
      setDrawerDirection(window.innerWidth >= 640 ? "left" : "bottom");
    };

    // Set initial direction
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <Drawer direction={drawerDirection} defaultOpen={true}>
        <DrawerTrigger
          asChild
          className={cn(
            "absolute z-20 bottom-4 left-4 sm:top-10 sm:left-10 p-4 bg-black bg-opacity-50 rounded-full transition-all duration-500 hover:bg-opacity-80",
            {
              "opacity-0": isIdle,
            }
          )}
        >
          <button>
            <PanelLeftOpen className="hidden w-5 h-5 stroke-1 stroke-white sm:block" />
            <PanelBottomOpen className="w-5 h-5 stroke-1 stroke-white sm:hidden" />
          </button>
        </DrawerTrigger>
        <DrawerContent
          className="sm:rounded-lg sm:inset-auto sm:mt-auto sm:left-2 sm:top-2 sm:bottom-2"
          style={
            { "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties
          }
        >
          <div className="flex flex-col w-full mx-auto overflow-auto sm:h-full bg-background">
            <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted sm:hidden" />
            <DrawerHeader>
              <div className="flex justify-between">
                <DrawerTitle>
                  <ArtBlocksLockup
                    height={24}
                    className="fill-black w-[132px]"
                  />
                </DrawerTitle>
                <DrawerClose asChild className="hidden sm:block">
                  <button className="transition-opacity duration-300 opacity-50 hover:opacity-100">
                    <PanelLeftClose className="w-6 h-6 stroke-1 stroke-muted-foreground" />
                  </button>
                </DrawerClose>
              </div>
              <DrawerDescription>
                Choose a token to view it using data stored entirely on-chain.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col flex-1 gap-4 px-4 mb-6">
              <div>
                <label className="block w-full mb-2">Contract</label>
                <ContractSelect
                  value={contractAddress}
                  handleChange={setContractAddress}
                  className="p-4"
                />
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
              />
            </div>
            <DrawerFooter>
              <div className="flex items-center justify-between gap-2">
                <a
                  href="https://github.com/ArtBlocks/on-chain-generator-viewer"
                  target="_blank"
                  className="opacity-50 hover:opacity-100"
                >
                  <GitHubIcon fill="black" className="w-6 h-6" />
                </a>
                <a
                  className="flex items-center gap-1 opacity-50 hover:opacity-100"
                  href="https://docs.artblocks.io/docs/on-chain-generator-viewer"
                  target="_blank"
                >
                  Learn more <ArrowUpRight className="w-4 h-4 stroke-1" />
                </a>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
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
    <div className={className}>
      <label className="block mb-2">
        <span>{label}</span>{" "}
        <span className="text-xs text-muted-foreground">
          (min: {min}, max: {max})
        </span>
      </label>
      <div
        className={cn(
          "flex items-center gap-4 opacity-100 transition-opacity duration-300",
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
          <ChevronLeftIcon
            className={cn("w-4 h-4 stroke-1", {
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
            className={cn("w-4 h-4 stroke-1", {
              "opacity-20": isIncrementDisabled,
            })}
          />
        </button>
      </div>
    </div>
  );
}
