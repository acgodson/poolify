// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
//import "@redstone-finance/evm-connector/contracts/data-services/RapidDemoConsumerBase.sol";
import "@redstone-finance/evm-connector/contracts/data-services/MainDemoConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PoolFactory is MainDemoConsumerBase {
  
    struct SingleAssetPool {
        address creator;
        address token;
        address pair;
        uint256 price;
        uint256 balance;
        bool active;
        uint256 arbitrageurCount;
        uint256 daoIndex;
    }

    struct DAO {
        address dao;
        uint256 numPools;
        string cid; // IPFS content identifier for the DAO
    }

    struct Arbitrageur {
        address addr;
        uint256 bnbStaked;
        uint256 reward;
    }

    uint256 public daoCount;
    uint256 public poolCount;
    mapping(uint256 => DAO) public daos;
    mapping(uint256 => SingleAssetPool) public pools;
    mapping(uint256 => Arbitrageur) public arbitrageurs;

    address[] public arbitrageRewards;
    mapping(address => uint256) public arbitrageCounts;
    event PromptForUpdate(uint256 daoIndex, uint256 poolIndex);
    event PriceUpdate(uint256 daoIndex, uint256 poolIndex, uint256 newprice);
    event Reward(Arbitrageur arbitrageur, uint256 reward);

    function getLatestTokenPrice(bytes32 _data) public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(_data);
    }

    function registerDAO(string memory _cid) public {
        daos[daoCount].dao = msg.sender;
        daos[daoCount].cid = _cid;
        daos[daoCount].numPools = 0; // i
        daoCount++;
    }

    function createSingleAssetPool(
        uint256 _daoIndex,
        address _token,
        address _pair,
        uint256 _price,
        uint256 _balance
    ) public {
        require(_daoIndex < daoCount, "DAO does not exist");

        require(
            ERC20(_token).transferFrom(msg.sender, address(this), _balance),
            "Token transfer failed"
        ); // transfer tokens from owner to contract
        uint256 id = poolCount;

        // create new pool
        pools[id] = SingleAssetPool({
            creator: msg.sender,
            token: _token,
            pair: _pair,
            price: _price,
            balance: _balance,
            arbitrageurCount: 0,
            daoIndex: _daoIndex,
            active: true
        });

        //increment number of pools
        daos[_daoIndex].numPools++;

        //add a newArbitrageur to the new pool
        Arbitrageur memory newArbitrageur = Arbitrageur({
            addr: msg.sender,
            bnbStaked: _balance,
            reward: 0
        });

        // get the count of arbitrageurs in the pool
        uint256 count = pools[poolCount].arbitrageurCount;

        // add the new arbitrageur to the arbitrageurs mapping
        arbitrageurs[count] = newArbitrageur;

        // increment poolCount
        poolCount++;

        // increment arbitrageurCount in the SingleAssetPool struct
        pools[poolCount - 1].arbitrageurCount++;
    }

    function joinPool(uint256 _poolIndex, uint256 _tokenAmount) public payable {
        uint256 id = poolCount;
        require(_poolIndex > id, "Pool does not exist");
        SingleAssetPool storage pool = pools[_poolIndex];

        // Transfer token from the arbitrageur to the contract
        require(msg.value == _tokenAmount, "Incorrect Token amount sent");
        ERC20(pool.token).transferFrom(msg.sender, address(this), _tokenAmount);

        // Increase the staked token for the arbitrageur
        pool.balance += _tokenAmount;
        Arbitrageur memory newArbitrageur = Arbitrageur(
            msg.sender,
            _tokenAmount,
            0
        );

        // get the count of arbitrageurs in the pool
        uint256 count = pools[_poolIndex].arbitrageurCount;

        // add the new arbitrageur to the arbitrageurs mapping
        arbitrageurs[count] = newArbitrageur;

        //Increment the arbitrageCounts mapping
        arbitrageCounts[msg.sender]++;
        // Incement the arbitgrateur count in the struct
        pool.arbitrageurCount++;
    }

    function swap(
        uint256 _daoIndex,
        uint256 _poolIndex,
        uint256 _pairAmount,
        uint256 _currentPrice
    ) public {
        require(_daoIndex < daoCount, "DAO does not exist");

        require(_poolIndex < poolCount, "Pool does not exist");
        SingleAssetPool storage pool = pools[_poolIndex];

        // Check if the current price is within a certain range of the pool price
        uint256 priceDiff = (_currentPrice > pool.price)
            ? _currentPrice - pool.price
            : pool.price - _currentPrice;
        uint256 maxDiff = (pool.price * 3) / 100; //

        if (priceDiff > maxDiff) {
            // Notify arbitrageurs to push new price and prompt the user to update the transaction
            emit PromptForUpdate(_daoIndex, _poolIndex);
            revert("Current price is not reliable, please update transaction");
        } else {
            // Use the current price for the swap
            require(pool.price > 0, "Invalid price");

            // Check the amount that the contract has been approved to spend on behalf of the user
            uint256 allowance = ERC20(pool.pair).allowance(
                msg.sender,
                address(this)
            );

            require(allowance >= _pairAmount, "Insufficient allowance");

            // Convert BIT amount to BNB based on current exchange rate
            // uint256 _tokenAmount = (_pairAmount * pool.price) / 1e18;
            uint256 _tokenAmount = (_pairAmount * 10 ** 18) / pool.price;

            // Calculate transaction fee
            uint256 transactionFee = (_tokenAmount * 2) / 100;

            // Calculate reward amount for arbitrageurs
            uint256 rewardAmount = transactionFee;

            // Transfer the specified amount of bit from the user to the contract.
            require(
                ERC20(pool.pair).transferFrom(
                    msg.sender,
                    address(this),
                    _pairAmount
                ),
                "Transfer failed"
            );

            // Transfer the calculated amount of bnb from the contract to the user.
            require(
                ERC20(pool.token).transfer(msg.sender, _tokenAmount),
                "Transfer failed"
            );

            uint256 transactionValue = _tokenAmount + rewardAmount;

            // Check if the pool balance will become 0 after the swap
            if (transactionValue >= pool.balance) {
                // If the pool balance will become 0, distribute the remaining balance to the liquidity providers
                uint256 pairBalance = ERC20(pool.pair).balanceOf(address(this));
                pool.balance = 0;
                uint256 totalStakedAmount = 0;

                uint256[] memory arbitrageurIndices = new uint256[](
                    pool.arbitrageurCount
                );
                uint256 index = 0;

                // Loop through the arbitrageurs and check if they belong to the current pool
                for (uint256 i = 0; i < pool.arbitrageurCount; i++) {
                    if (arbitrageurs[i].addr == pool.creator) {
                        arbitrageurIndices[index] = i;
                        index++;
                    }
                }

                // Calculate the total amount staked in the pool
                for (uint256 i = 0; i < pool.arbitrageurCount; i++) {
                    totalStakedAmount += arbitrageurs[arbitrageurIndices[i]]
                        .bnbStaked;
                }

                // Distribute the remaining balance to each liquidity provider based on their staked amount
                for (uint256 i = 0; i < pool.arbitrageurCount; i++) {
                    address liquidityProvider = arbitrageurs[
                        arbitrageurIndices[i]
                    ].addr;
                    uint256 liquidityShare = (arbitrageurs[
                        arbitrageurIndices[i]
                    ].bnbStaked * pairBalance) / totalStakedAmount;

                    require(
                        ERC20(pool.pair).transfer(
                            liquidityProvider,
                            liquidityShare
                        ),
                        "Transfer failed"
                    );
                }
            } else {
                // If the pool balance will not become 0, update the pool balance as normal
                pool.balance -= transactionValue;
            }

            // Distribute rewards to arbitrageurs
            distributeRewards(_daoIndex, _poolIndex, rewardAmount);
        }
    }

    function updatePrice(
        uint256 _daoIndex,
        uint256 _poolIndex,
        uint256 _newPrice
    ) public {
        require(_daoIndex < daoCount, "DAO does not exist");
        DAO storage dao = daos[_daoIndex];
        require(_poolIndex < dao.numPools, "Pool does not exist");
        SingleAssetPool storage pool = pools[_poolIndex];
        pool.price = _newPrice;

        // Add user to the map or increase counts
        arbitrageCounts[msg.sender]++;
        // Emit an event to notify arbitrageurs of the updated price
        emit PriceUpdate(_daoIndex, _poolIndex, pool.price);
    }

    function distributeRewards(
        uint256 _daoIndex,
        uint256 _poolIndex,
        uint256 _rewardAmount
    ) public {
        require(_daoIndex < daoCount, "DAO does not exist");
        DAO storage dao = daos[_daoIndex];
        require(_poolIndex < dao.numPools, "Pool does not exist");
        SingleAssetPool storage pool = pools[_poolIndex];

        // Calculate total staked amount in the pool
        uint256 totalStaked = 0;
        uint256 totalCount = 0;

        uint256[] memory arbitrageurIndices = new uint256[](
            pool.arbitrageurCount
        );
        uint256 index = 0;

        // Loop through the arbitrageurs and check if they belong to the current pool
        for (uint256 i = 0; i < pool.arbitrageurCount; i++) {
            if (arbitrageurs[i].addr == pool.creator) {
                arbitrageurIndices[index] = i;
                index++;
            }
        }

        for (uint256 i = 0; i < pool.arbitrageurCount; i++) {
            totalStaked += arbitrageurs[arbitrageurIndices[i]].bnbStaked;
            totalCount += arbitrageCounts[
                arbitrageurs[arbitrageurIndices[i]].addr
            ];
        }

        // Distribute reward based on stake and count
        for (uint256 i = 0; i < pool.arbitrageurCount; i++) {
            Arbitrageur storage currentArbitrager = arbitrageurs[
                arbitrageurIndices[i]
            ];
            uint256 currentArbitragerReward = (_rewardAmount *
                (arbitrageurs[arbitrageurIndices[i]].bnbStaked +
                    (arbitrageurs[arbitrageurIndices[i]].bnbStaked *
                        totalCount))) / totalStaked;
            // arbitrageRewards[i].reward += currentArbitragerReward;
            delete arbitrageCounts[arbitrageurs[arbitrageurIndices[i]].addr];
            emit Reward(currentArbitrager, currentArbitragerReward);
        }
    }
}
