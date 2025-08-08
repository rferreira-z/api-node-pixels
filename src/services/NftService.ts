import { PinataSDK } from 'pinata';
import config from '../config/config';
import contractABI from '../contracts/pixels-sepholia-abi';
import { ethers } from 'ethers';

export type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: NFTMetadataAttribute[];
};

export type NFTMetadataAttribute = {
  trait_type: string;
  value: string | number;
};

class NftService {
  private pinata: PinataSDK;
  /**
   * Initializes the NftService with Pinata SDK.
   * Requires PINATA_JWT and PINATA_GATEWAY to be set in environment variables.
   */
  constructor() {
    this.pinata = new PinataSDK({
      pinataJwt: config.pinata.jwtKey,
      pinataGateway: config.pinata.gatewayKey,
    });
  }

  async sendFileToPinata(file: File): Promise<string> {
    try {
      const upload = await this.pinata.upload.public.file(file);
      console.log(upload);
      return upload.cid;
    } catch (error) {
      console.log(error);
    }
    return '';
  }

  /**
   * Mint an NFT with the given token URI.
   * @param tokenURI - The URI pointing to the NFT metadata.
   */

  async mintNFT(tokenURI: string) {
    if (!config.metamask.secretKey || !config.polygon.contractAddress || !config.polygon.rpcUrl) {
      throw new Error('Private key is not set in environment variables');
    }
    try {
      const provider = new ethers.JsonRpcProvider(config.polygon.rpcUrl);

      const wallet = new ethers.Wallet(config.metamask.secretKey, provider);
      const contract = new ethers.Contract(
        config.polygon.contractAddress,
        contractABI,
        wallet,
      );

      const recipientAddress = config.metamask.walletAddress; // Address to mint the NFT to

      const transaction = await contract.safeMint(recipientAddress, tokenURI);
      await transaction.wait();

      console.log(
        'NFT minted successfully! Transaction hash:',
        transaction.hash,
      );
    } catch (error) {
      console.error('Error minting NFT:', error);
    }
  }
}

export default NftService;
