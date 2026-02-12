# Deployment Checklist: The Human Proof

## 1. Smart Contract (Base)
- [ ] Deploy `contracts/HumanProof.sol` to Base Mainnet/Sepolia.
- [ ] Record deployed address for `FRICTION_FEE_CONTRACT` env var.

## 2. Asset Hosting (Fleek)
- [ ] Run `fleek login`.
- [ ] Run `fleek sites deploy` to host `/public/art` on Fleek.
- [ ] Update `vercel.json` rewrite destination with the Fleek URL.

## 3. API & Frontend (Vercel)
- [ ] Setup project on Vercel.
- [ ] Configure Environment Variables:
    - `BASE_RPC_URL`: (Alchemy/Infura or public node)
    - `FRICTION_FEE_CONTRACT`: (From step 1)
    - `UPSTASH_REDIS_URL`: (From Upstash dashboard)
    - `UPSTASH_REDIS_TOKEN`: (From Upstash dashboard)
- [ ] Run `vercel --prod`.

## 4. Post-Launch
- [ ] Verify handshake flow at `/api/challenge` -> `/api/verify`.
- [ ] Trigger promotion thread on X/Twitter.
- [ ] Release Substack post "The Scent of Humanity".
