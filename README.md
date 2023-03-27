# Poolify allows DAOs to create single-asset pools for their native token, and reward members of the DAO for acting as watchers by pushing exchange prices on chain

## Built on Mantle Testnet (EthGLobal Sponsor)

Poolify is a contract on mantle that enables non-technical DAOs to create simple, single-asset pools for their native token, while incentivizing members to act as watchers by pushing the latest exchange prices on chain. To join as a watcher, investors or arbitrageurs provide collateral stakes, which also adds to the liquidity of the pool.

## Additional tools

- Web front-end built with Next.js, Chakra-UI, tailwind and ethers.js
- Prices are fetched from redstone finance oracle
- IPFS integration for DAO metadata

## Smart Contract

In the PoolFactory contract, involving arbitrageurs (aka watchers/investors):

- DAOs can register to the contract and create a single-asset-pool against their native token. for example a pool of Ether against the DAO's WBit as demonstrated in the [demo]("https://ethglobal.com/showcase/poolify-sppap)

- Traders and Investors can swap the paired token in the pool against the native token. The exchange price is always balanced against the market prices of each token.

- Arbitrageurs (Watchers) can join any pool index by staking a certain amount of native token of the DAO.

- As a watcher, you can push prices of token on-chain at the point of transaction or at any given time when the market price changes to recieve rewards

- Rewards are distributed to investors from tansaction fees based on their stake in each pool and price-pushing activity.

- The Collateral can be used to as security to ensure that a watcher is punished for pushing any wrong price

## Requirements for testing

- Add Mantle Network to your Metamask
- Create a new DAO and first pool, or swap Tokens from existing DAOs (pools)

To test locally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm devREA
```

