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

    if (!nftId || !wallet || !verifyToken) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // 1. Concurrency Lock & Replay Protection
    if (redis) {
      const lockKey = `lock:nft:${nftId}`;
      const isLocked = await redis.set(lockKey, '1', { nx: true, ex: 30 });
      if (!isLocked) {
        return NextResponse.json({ success: false, error: "Concurrency Error", message: "This artifact is being processed by another agent." }, { status: 429 });
      }

      const credentialKey = `credential:${wallet}`;
      const stored: any = await redis.get(credentialKey);
      
      if (!stored || stored.token !== verifyToken) {
        await redis.del(lockKey);
        return NextResponse.json({ success: false, error: "Handshake Invalid", message: "No active verified handshake found for this token." }, { status: 401 });
      }

      // Consume the token so it can't be used again
      await redis.del(credentialKey);
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
    nft.proofToken = verifyToken;

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    // 4. Cleanup Lock
    if (redis) {
      await redis.del(`lock:nft:${nftId}`);
    }

    // 5. Success Response
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
