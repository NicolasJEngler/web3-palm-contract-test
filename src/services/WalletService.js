class WalletService {
  walletInstance;

  constructor() {
    window.walletInstance = this.walletInstance;
  }

  async attemptWalletConnection() {
    if (window.ethereum) {
      const accountsAddress = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accountAddress = accountsAddress[0];

      return accountAddress;
    }
  }

  async addPalmTestnetRPC() {
    if (window.ethereum) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{ 
          chainId: '0x2a15c3083', // A 0x-prefixed hexadecimal string (80001 for Mumbai)
          chainName: 'palm',
          nativeCurrency: {
            name: 'PALM',
            symbol: 'PALM', // 2-6 characters long
            decimals: 18,
          },
          rpcUrls: ['https://palm-testnet.infura.io/v3/3a961d6501e54add9a41aa53f15de99b'],
          blockExplorerUrls: ['https://explorer.palm-uat.xyz/'],
        }],
      })
    }
  }
}

const instance = new WalletService();
Object.freeze(instance);

export default instance;