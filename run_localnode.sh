#!/bin/bash

RPC_URL="http://192.168.1.104:10005"
DELAY_BLOCK_NUM=5

response=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id":0}' $RPC_URL)
hex_value=$(echo $response | awk -F'"' '{for (i=1; i<=NF; i++) if ($i == "result") {print $(i+2); exit}}')
current_block=$(( $hex_value ))
fork_block_num=$(( $current_block - $DELAY_BLOCK_NUM ))
echo -e "\033[33mCurrent block number is: $current_block\033[0m"
echo -e "\033[33mFork    block number is: $fork_block_num\033[0m"

npx hardhat node --fork $RPC_URL --hostname 0.0.0.0 --port 9545 --fork-block-number $fork_block_num  --network hardhat
# anvil --fork-url $RPC_URL  --fork-block-number $fork_block_num 
 