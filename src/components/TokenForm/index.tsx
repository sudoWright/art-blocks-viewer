import { useIdle } from "@/hooks/useIdle";
import { cn } from "@/lib/utils";
import { networkCoreDeployments } from "@/utils/env";
import {
  ArrowUpRight,
  ChevronLeftIcon,
  ChevronRightIcon,
  PanelBottomOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ArtBlocksLockup } from "../ArtBlocksLockup";
import { GitHubIcon } from "../GitHubIcon";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useTokenFormStore } from "./store";

export function TokenForm() {
  // Get and initialize the token form state
  const {
    contractAddress,
    projectId,
    tokenInvocation,
    projectRange,
    invocations,
    isLoading,
    setContractAddress,
    setProjectId,
    setTokenInvocation,
    initialize,
  } = useTokenFormStore();
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerDirection, setDrawerDirection] = useState<"left" | "bottom">(
    "left"
  );
  // Drawer direction changes based on screen size, left for desktop, bottom for mobile
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

  // Hide the drawer trigger when the user is idle
  const isIdle = useIdle();

  return (
    <>
      <Drawer
        direction={drawerDirection}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      >
        <DrawerTrigger
          asChild
          autoFocus={false}
          className={cn(
            "absolute z-20 bottom-4 left-4 sm:bottom-auto sm:top-10 sm:left-10 p-4 bg-black bg-opacity-50 rounded-full transition-all duration-500 hover:bg-opacity-80",
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
                value={projectId?.toString() ?? ""}
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
                loading={isLoading.projectRange}
              />
              <InputWithLabel
                label="Token"
                value={tokenInvocation?.toString() ?? ""}
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
                loading={isLoading.invocations}
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
  const val = value ?? networkCoreDeployments[0].address;

  return (
    <Select value={val} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a core contract" asChild>
          <span>
            <span className="mr-2">
              {networkCoreDeployments.find((d) => d.address === value)?.label ??
                "Select a core contract"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({val.slice(0, 6)}…{val.slice(-4)})
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {networkCoreDeployments.map((deployment) => (
          <SelectItem key={deployment.address} value={deployment.address}>
            <span className="block">{deployment.label}</span>
            <span className="text-xs text-muted-foreground">
              {deployment.address}
            </span>
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
