import { useEffect, useState } from "react";
import { Hex, createPublicClient, http, isAddress } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { GenArt721GeneratorV0Abi } from "./abis/GenArt721GeneratorV0Abi";
import { generatorDeployments } from "./deployments/generator";
import { coreDeployments } from "./deployments/cores";
import { InputForm } from "./components/inputForm";
import "./App.css";

const networkNameToChainMap = {
  mainnet: mainnet,
  sepolia: sepolia,
};

// @dev default to mainnet if network env var not populated
const network =
  networkNameToChainMap[
    (import.meta.env.VITE_NETWORK || "mainnet") as "mainnet" | "sepolia"
  ];

// @dev default to public viem http endpoint if rpc env var not populated
const publicClient = createPublicClient({
  chain: network,
  transport: http(import.meta.env.VITE_JSON_RPC_PROVIDER_URL),
});

const generatorAddress = generatorDeployments[network.id];
const coreDeploymentOptions = coreDeployments[network.id];

function getRedirectPathParam() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("p");
}

function App() {
  // case when running a server
  let [contractAddress, tokenId] = window.location.pathname.split("/").slice(2);
  // case when running on github pages w/404.html re-routing
  if (!contractAddress && !tokenId) {
    const path_ = getRedirectPathParam();
    if (path_) {
      [contractAddress, tokenId] = path_.split("/");
    }
  }
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isForm, setIsForm] = useState(false);
  const [dataHtml, setDataHtml] = useState("");

  useEffect(() => {
    if (!contractAddress && !tokenId) {
      setIsForm(true);
      return;
    } else {
      setIsForm(false);
    }
    if (!contractAddress || !tokenId) {
      setError(
        "Invalid URL, please make sure the URL is in the format /<contract address>/<token id>"
      );
      return;
    }

    if (!isAddress(contractAddress)) {
      setError("Invalid contract address");
      return;
    }

    if (isNaN(Number(tokenId))) {
      setError("Invalid token id");
      return;
    }

    async function fetchTokenData() {
      console.log({ generatorAddress, contractAddress });
      try {
        const data = await publicClient.readContract({
          address: generatorAddress,
          abi: GenArt721GeneratorV0Abi,
          functionName: "getTokenHtml",
          args: [contractAddress as Hex, BigInt(tokenId)],
        });
        setDataHtml(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(
          "Error fetching token data, please make sure you've provided a valid contract address and token id combination"
        );
      }
    }
    fetchTokenData();
  }, [contractAddress, tokenId]);

  if (isForm) {
    return <InputForm coreDeploymentOptions={coreDeploymentOptions} />;
  }

  if (error) {
    return <div className="center">{error}</div>;
  }

  if (loading) {
    return <div className="center">Loading...</div>;
  }

  return (
    <>
      <iframe srcDoc={dataHtml} />
    </>
  );
}

export default App;
