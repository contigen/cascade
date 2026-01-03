import { walletClient } from './viem'

export async function connectWallet() {
  const [address] = await walletClient.requestAddresses()
  const chainId = await walletClient.getChainId()
  return { address, chainId }
}
