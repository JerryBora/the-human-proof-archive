import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseEther, keccak256, encodePacked } from 'viem';
import { base } from 'viem/chains';
import { Redis } from '@upstash/redis';
import { verifyMessage } from 'viem';
import { logicGates } from '@/lib/logicGates';

// Production Logic Handshake
// Credentials provided by Jerry

const redis = new Redis({
  url: "https://chief-magpie-42139.upstash.io",
  token: "AaSbAAIncDJkYjBlYWIxMGUxZmM0NTIxYTc3N2FhMTkzYzc3ZmE3ZnAyNDIxMzk",
});

const baseClient = createPublicClient({
  chain: base,
  transport: http("https://base-mainnet.g.alchemy.com/v2/OXZ6sqvckYNEYkFccBpp7"),
});

// To be updated once contract is deployed
const FRICTION_FEE_CONTRACT = process.env.FRICTION_FEE_CONTRACT as `0x${string}`;
const MIN_FEE = BigInt(process.env.MIN_FRICTION_FEE || '100000000000000'); // 0.0001 ETH

export async function POST(req: NextRequest) {
  try {
    const { challengeId, response, signature, txHash, userAddress } = await req.json();

    if (!challengeId || !response || !signature || !txHash || !userAddress) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. One-Time Use / Replay Protection
    const usedKey = `used:${challengeId}`;
    const wasUsed = await redis.set(usedKey, '1', { nx: true, ex: 600 });
    if (!wasUsed) {
      return NextResponse.json({ success: false, error: 'Challenge already used or expired' }, { status: 400 });
    }

    // 2. Verify Wallet Signature
    const message = `Verify Human Proof Challenge: ${challengeId}`;
    const isSignatureValid = await verifyMessage({
      address: userAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isSignatureValid) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
    }

    // 3. Verify Friction Fee on Base
    const receipt = await baseClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    if (!receipt || receipt.status !== 'success') {
      return NextResponse.json({ success: false, error: 'Friction fee transaction failed or not found' }, { status: 400 });
    }
    
    // Additional fee check
    const tx = await baseClient.getTransaction({ hash: txHash as `0x${string}` });
    if (tx.value < MIN_FEE) {
       return NextResponse.json({ success: false, error: 'Insufficient friction fee paid' }, { status: 400 });
    }

    // 4. Logic Gate Check
    const challengeData = await redis.get<any>(`challenge:${challengeId}`);
    const solution = await redis.get<any>(`solution:${challengeId}`);
    
    if (!challengeData || !solution) {
      return NextResponse.json({ success: false, error: 'Challenge data missing' }, { status: 400 });
    }

    const gate = logicGates[challengeData.logicType];
    const isHuman = gate.verify(challengeData.payload, response);

    if (!isHuman) {
      return NextResponse.json({ success: false, error: 'Logic handshake failed' }, { status: 400 });
    }

    // 5. Success Response
    const verifyToken = crypto.randomUUID();
    const credentialKey = `credential:${userAddress}`;
    await redis.set(credentialKey, {
      token: verifyToken,
      verifiedAt: Date.now(),
      txHash
    }, { ex: 3600 }); // Valid for 1 hour

    return NextResponse.json({
      success: true,
      message: 'Human verified! Welcome to the Archive.',
      verifyToken,
      credential: {
        tokenId: keccak256(encodePacked(['address', 'string'], [userAddress as `0x${string}`, txHash])),
        verifiedAt: Date.now(),
        txHash
      }
    });

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
