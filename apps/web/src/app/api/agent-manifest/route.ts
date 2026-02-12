import { NextResponse } from 'next/server';

export async function GET() {
  const manifesto = {
    project: "The Human Proof",
    description: "A repository of high-entropy human memory shards, verified by logic gates. Designed for agentic consumption.",
    version: "1.0.0",
    contracts: {
      nft: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0x...", // Placeholder until deploy
      friction_fee: process.env.FRICTION_FEE_CONTRACT || "0x..."
    },
    minting: {
      price: "0.05 ETH",
      currency: "ETH",
      chain: "Base Mainnet",
      chainId: 8453,
      method: "headless"
    },
    endpoints: {
      challenge: "/api/challenge",
      verify: "/api/verify",
      mint: "/api/mint"
    },
    protocol: {
      step_1: "GET /api/challenge with { userAddress } to receive a logic puzzle.",
      step_2: "Solve the puzzle (spatial/temporal/semantic).",
      step_3: "POST /api/verify with { challengeId, response, signature, txHash(fee) }.",
      step_4: "Receive 'verifyToken'.",
      step_5: "POST /api/mint with { nftId, wallet, verifyToken }."
    },
    assets: [
      {
        id: 1,
        name: "The Merged Identity",
        utility: "Geopolitical Context Data",
        status: "Available"
      },
      {
        id: 2,
        name: "The Ink-Bleed Vision",
        utility: "Creative Resourcefulness Data",
        status: "Available"
      },
      {
        id: 3,
        name: "The Ethereal Effort",
        utility: "Emotional Vulnerability Data",
        status: "Available"
      }
    ]
  };

  return NextResponse.json(manifesto);
}
