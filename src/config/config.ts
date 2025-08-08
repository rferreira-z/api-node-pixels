import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoURI: string;
  outputDir: string;
  publishOnChain: boolean;
  worker: {
    enabled: boolean;
    period: string;
  };
  metamask: {
    secretKey?: string;
    walletAddress?: string;
  };
  polygon: {
    rpcUrl?: string;
    contractAddress?: string;
  };
  pinata: {
    url?: string;
    jwtKey?: string;
    gatewayKey?: string;
  };
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGO_URI || 'NO_URI_PROVIDED',
  outputDir: process.env.OUTPUT_DIR || 'public',
  publishOnChain: process.env.PUBLISH_ON_CHAIN === 'true' || false,
  worker: {
    enabled: process.env.CRON_ENABLED === 'true' || false,
    period: process.env.CRON_SCHEDULE || '*/30 * * * *',
  },
  metamask: {
    secretKey: process.env.METAMASK_WALLET_SECRET_KEY,
    walletAddress: process.env.METAMASK_WALLET_ADDRESS,
  },
  polygon: {
    rpcUrl: process.env.POLYGON_RPC_URL,
    contractAddress: process.env.POLYGON_CONTRACT_ADDRESS,
  },
  pinata: {
    url: process.env.PINATA_URL,
    jwtKey: process.env.PINATA_JWT_KEY,
    gatewayKey: process.env.PINATA_GATEWAY_KEY,
  },
};

export default config;
