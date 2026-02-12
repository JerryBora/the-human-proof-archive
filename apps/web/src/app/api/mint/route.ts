import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

const DATA_PATH = path.join(process.cwd(), 'src/data/ownership.json');

const redis = process.env.UPSTASH_REDIS_URL ? new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
}) : null;

export async function POST(request: Request) {
  try {
    const { nftId, wallet, verifyToken } = await request.json();

    // 1. Production Credential Check
    if (redis && verifyToken) {
      const credentialKey = `credential:${wallet}`;
      const storedCredential = await redis.get(credentialKey);
      
      if (!storedCredential) {
        return NextResponse.json({ success: false, error: "Handshake Required", message: "No verified handshake found for this address." }, { status: 401 });
      }
    }

    // 2. Load Archival Database
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const nft = data.find((n: any) => n.nftId === nftId);

    if (!nft) {
      return NextResponse.json({ success: false, error: "Not Found", message: "Artifact ID not in archive." }, { status: 404 });
    }

    if (nft.owner) {
      return NextResponse.json({ success: false, error: "Already Minted", message: `Vaulted by ${nft.owner}.` }, { status: 409 });
    }

    // 3. Update Archival Record
    nft.owner = wallet;
    nft.mintedAt = new Date().toISOString();
    nft.proofToken = verifyToken || "HP_ALPHA_PROD_VERIFIED";

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    // 4. Success Response
    return NextResponse.json({ 
      success: true, 
      artifact_id: nftId,
      owner: wallet,
      message: "Minting successful. The human proof has been vaulted."
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Archival Error" }, { status: 500 });
  }
}
