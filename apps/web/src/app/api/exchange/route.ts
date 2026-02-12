import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src/data/ownership.json');

export async function POST(request: Request) {
  try {
    const { sellerToken, buyerToken, nftId, priceETH } = await request.json();

    // 1. Load current ownership
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const nft = data.find((n: any) => n.nftId === nftId);

    if (!nft || !nft.owner) {
      return NextResponse.json({ error: "Artifact not available for exchange" }, { status: 404 });
    }

    // 2. Validate Seller (Mock: Decode sellerToken and check if it matches nft.owner)
    const sellerPayload = JSON.parse(Buffer.from(sellerToken.replace('HP_ALPHA_', ''), 'base64').toString());
    if (sellerPayload.sub !== nft.owner) {
      return NextResponse.json({ error: "Unauthorized seller" }, { status: 401 });
    }

    // 3. Validate Buyer (Mock: Decode buyerToken)
    const buyerPayload = JSON.parse(Buffer.from(buyerToken.replace('HP_ALPHA_', ''), 'base64').toString());
    
    // 4. Update Ownership
    const oldOwner = nft.owner;
    nft.owner = buyerPayload.sub;
    nft.mintedAt = new Date().toISOString();
    nft.proofToken = buyerToken;

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json({ 
      success: true, 
      artifact_id: nftId,
      from: oldOwner,
      to: nft.owner,
      curator_fee: `${(parseFloat(priceETH) * 0.025).toFixed(4)} ETH`,
      message: "Secondary exchange handshake confirmed. Ownership transferred."
    });

  } catch (error) {
    return NextResponse.json({ error: "Exchange protocol violation" }, { status: 400 });
  }
}
