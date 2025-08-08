import { ethers } from 'ethers';
import NftService from './NftService';
import config from '../config/config';

const mockWallet = { connect: jest.fn() };
const mockTransaction = { wait: jest.fn(), hash: 'mockHash' };
let mockContract = {
  safeMint: jest.fn().mockResolvedValue(mockTransaction),
};
const mockProvider = {};

jest.mock('ethers', () => {
  const originalModule = jest.requireActual<typeof import('ethers')>('ethers');
  return {
    ...originalModule,
    ethers: {
      ...originalModule.ethers,
      Wallet: jest.fn().mockImplementation(() => mockWallet),
      JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
      Contract: jest.fn().mockImplementation(() => mockContract),
    },
  };
});

jest.mock('pinata');

describe('NftService', () => {
  let nftService: NftService;

  beforeEach(() => {
    jest.clearAllMocks();
    nftService = new NftService();
  });

  describe('mintNFT', () => {
    it('should throw an error if PRIVATE_KEY is not set', async () => {
      const originalPrivateKey = config.metamask.secretKey;
      config.metamask.secretKey = '';

      await expect(nftService.mintNFT('mockTokenURI')).rejects.toThrow(
        'Private key is not set in environment variables',
      );

      config.metamask.secretKey = originalPrivateKey; // Restore original value
    });

    it('should throw an error if RPC_URL is not set', async () => {
      const originalRpcUrl = config.polygon.rpcUrl;
      config.polygon.rpcUrl = '';

      await expect(nftService.mintNFT('mockTokenURI')).rejects.toThrow(
        'Private key is not set in environment variables',
      );

      config.polygon.rpcUrl = originalRpcUrl; // Restore original value
    });

    it('should mint an NFT successfully when PRIVATE_KEY is set', async () => {
      await nftService.mintNFT('mockTokenURI');

      expect((ethers.JsonRpcProvider as jest.Mock)).toHaveBeenCalledWith(
        config.polygon.rpcUrl,
      );

      expect((ethers.Contract as jest.Mock)).toHaveBeenCalledWith(
        config.polygon.contractAddress,
        expect.anything(),
        mockWallet,
      );
      expect(mockContract.safeMint).toHaveBeenCalledWith(
        config.metamask.walletAddress,
        'mockTokenURI',
      );
      expect(mockTransaction.wait).toHaveBeenCalled();
    });

    it('should handle errors during minting', async () => {
      mockContract = {
        safeMint: jest.fn().mockRejectedValue(new Error('Minting failed')),
      };

      console.error = jest.fn(); // Mock console.error

      await nftService.mintNFT('mockTokenURI');

      expect(console.error).toHaveBeenCalledWith(
        'Error minting NFT:',
        expect.any(Error),
      );
    });
  });
});
