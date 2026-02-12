import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'src/data/ownership.json');

const GENESIS_THREE = [
  {
    id: 1,
    title: "The Merged Identity",
    file: "/art/IMG_20211129_205735.jpg",
    tier: "1-of-1",
    price: "0.05 ETH",
    description: "A reflection on geopolitics and shared human identity, created during the BLM movement."
  },
  {
    id: 2,
    title: "The Ink-Bleed Vision",
    file: "/art/IMG_20201031_204335_587.jpg",
    tier: "1-of-1",
    price: "0.05 ETH",
    description: "A fever-dream sketch brought to life with the ink of broken pens."
  },
  {
    id: 3,
    title: "The Ethereal Effort",
    file: "/art/PicsArt_02-14-09.14.17.jpg",
    tier: "1-of-1",
    price: "0.05 ETH",
    description: "A digital/physical hybrid born from a human crush and a Seraph anime obsession."
  }
];

export async function GET() {
  try {
    const ownership = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    
    const proofs = GENESIS_THREE.map(p => {
      const status = ownership.find((o: any) => o.nftId === p.id);
      return {
        ...p,
        owner: status?.owner || null,
        mintedAt: status?.mintedAt || null,
        available: !status?.owner
      };
    });

    return NextResponse.json(proofs);
  } catch (error) {
    return NextResponse.json(GENESIS_THREE);
  }
}
