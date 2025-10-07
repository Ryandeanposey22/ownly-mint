import { NextResponse } from 'next/server'

// Handles both /api/token/0 and /api/token/0.json
function parseId(raw: string | undefined) {
  if (!raw) return 0
  const cleaned = raw.endsWith('.json') ? raw.slice(0, -5) : raw
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = parseId(params.id)

  // Hardcode your shared IPFS image CID here:
  const image = "ipfs://bafybeidtr4pifwdfqp2ytakmfrbzqvfhj3vp4ex7guhnfc2obvtt2yscde"

  return NextResponse.json({
    name: `Ownly #${id}`,
    description: "Ownly Founders Collection — 35 supply on Sepolia.",
    image,
    attributes: [
      { trait_type: "Number", value: id },
      { trait_type: "Supply", value: 35 },
      { trait_type: "Edition", value: "Founders" }
    ]
  })
}

