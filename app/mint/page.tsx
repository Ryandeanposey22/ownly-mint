'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function MintPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">Ownly Mint</h1>
      <ConnectButton />
      <p className="mt-4 text-gray-600">Connect your wallet to continue.</p>
    </main>
  );
}
