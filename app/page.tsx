"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

// ---- Config --------------------------------------------------------------
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

// Minimal ABI with all calls we use
const ABI = [
  "function mint(uint256 quantity) payable",
  "function MINT_PRICE() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
] as const;

// -------------------------------------------------------------------------

export default function Home() {
  const [status, setStatus] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainOk, setChainOk] = useState<boolean>(false);

  const [mintPriceWei, setMintPriceWei] = useState<bigint | null>(null);
  const [maxSupply, setMaxSupply] = useState<bigint | null>(null);
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [myBalance, setMyBalance] = useState<bigint | null>(null);

  const [qty, setQty] = useState<number>(1);
  const [minting, setMinting] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);

  // derived: sold out?
  const soldOut =
    maxSupply != null && totalSupply != null && totalSupply >= maxSupply;

  // provider helper
  const provider = useMemo(() => {
    if (typeof window === "undefined" || !window.ethereum) return null;
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  async function getSigner() {
    if (!provider) return null;
    try {
      return await provider.getSigner();
    } catch {
      return null;
    }
  }

  async function getContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
    if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
    const p = signerOrProvider ?? provider;
    if (!p) throw new Error("No provider");
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, p);
  }

  // connect wallet
  async function connectWallet() {
    if (!provider) {
      setStatus("MetaMask not detected");
      return;
    }
    try {
      await provider.send("eth_requestAccounts", []);
      const s = await getSigner();
      const addr = await s!.getAddress();
      setAccount(addr);
      setConnected(true);
      setStatus("Wallet connected ✅");
      await checkChain();
      await refreshStats(addr);
    } catch (err) {
      console.error(err);
      setStatus("Wallet connection failed");
    }
  }

  // check sepolia (11155111)
  async function checkChain() {
    if (!provider) return;
    const net = await provider.getNetwork();
    const ok = net.chainId === BigInt(11155111);
    setChainOk(ok);
    if (!ok) setStatus("Please switch your wallet to Sepolia.");
  }

  // fetch on-chain stats
  async function refreshStats(addr?: string | null) {
    try {
      const c = await getContract(provider!);
      const [price, max, minted] = await Promise.all([
        c.MINT_PRICE(),
        c.MAX_SUPPLY(),
        c.totalSupply(),
      ]);
      setMintPriceWei(price);
      setMaxSupply(max);
      setTotalSupply(minted);

      if (addr) {
        const bal = await c.balanceOf(addr);
        setMyBalance(bal);
      }
    } catch (e) {
      console.error("refreshStats error:", e);
    }
  }

  // react to account / chain changes + initial fetch
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccounts = (accs: string[]) => {
      const addr = accs?.[0] ?? null;
      setAccount(addr);
      setConnected(!!addr);
      if (addr) refreshStats(addr);
    };
    const handleChain = async () => {
      await checkChain();
      await refreshStats(account);
    };

    window.ethereum.on?.("accountsChanged", handleAccounts);
    window.ethereum.on?.("chainChanged", handleChain);

    (async () => {
      try {
        const accs: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });
        handleAccounts(accs);
        await checkChain();
        await refreshStats(accs?.[0]);
      } catch {}
    })();

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccounts);
      window.ethereum.removeListener?.("chainChanged", handleChain);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  // mint
  async function handleMint() {
    try {
      if (!provider) throw new Error("MetaMask not detected");
      if (!chainOk) throw new Error("Please switch to Sepolia");
      if (soldOut) throw new Error("Sold out");

      const signer = await getSigner();
      if (!signer) throw new Error("No signer");

      const contract = await getContract(signer);

      // Prefer reading the on-chain price, fallback to 0.01 ETH
      const pricePer = mintPriceWei ?? ethers.parseEther("0.01");
      const totalValue = pricePer * BigInt(qty);

      setMinting(true);
      setStatus("Minting… ⛏️");

      const tx = await contract.mint(qty, {
        value: totalValue,
        // gasLimit: 200000n, // uncomment if you ever see estimateGas quirks
      });
      setLastTx(tx.hash);
      await tx.wait();

      setStatus("Mint successful ✅");
      await refreshStats(account);
    } catch (err: any) {
      console.error(err);
      const reason = err?.reason ?? err?.message ?? "Mint failed";
      setStatus(`❌ ${reason}`);
    } finally {
      setMinting(false);
    }
  }

  const prettyPrice =
    mintPriceWei != null ? `${ethers.formatEther(mintPriceWei)} ETH` : "—";

  const disableMintButton = !connected || !chainOk || minting || soldOut;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-6 p-6">
      <h1 className="text-4xl font-extrabold">Ownly NFT Mint</h1>

      <div className="text-lg opacity-90">
        Minted:{" "}
        <span className="font-semibold">
          {totalSupply?.toString() ?? "—"} / {maxSupply?.toString() ?? "—"}
        </span>
      </div>

      <div className="text-lg opacity-90">
        Price: <span className="font-semibold">{prettyPrice}</span> per NFT
      </div>

      {connected && (
        <div className="text-lg opacity-90">
          Your balance:{" "}
          <span className="font-semibold">{myBalance?.toString() ?? "0"}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={connected}
        >
          {connected ? "Wallet Connected" : "Connect Wallet"}
        </button>

        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
          <span className="opacity-75">Qty</span>
          <input
            type="number"
            min={1}
            max={10}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(10, Number(e.target.value) || 1)))
            }
            className="w-16 bg-gray-700 rounded px-2 py-1 text-center"
          />
        </div>

        <button
          onClick={handleMint}
          className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          disabled={disableMintButton}
        >
          {soldOut ? "Sold out" : minting ? "Minting…" : "Mint NFT"}
        </button>
      </div>

      <div className="min-h-[24px] text-sm opacity-90">
        {status}
        {lastTx && (
          <>
            {" "}
            ·{" "}
            <a
              className="underline"
              href={`https://sepolia.etherscan.io/tx/${lastTx}`}
              target="_blank"
              rel="noreferrer"
            >
              View tx
            </a>
          </>
        )}
      </div>
    </main>
  );
}

