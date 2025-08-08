# Pixels

<p>
    <img align="left" src="./public/pixels/pixels-sample-1.png" width="100" alt="Pixels 1">
    <img align="left" src="./public/pixels/pixels-sample-2.png" width="100" alt="Pixels 2">
    <img align="left" src="./public/pixels/pixels-sample-3.png" width="100" alt="Pixels 3">
<p>

Pixels are an NFT art built from randomness.

Each art is composed of an outer layer of black pixels, forming a 9x9 square, followed by an inner layer of white pixels, forming a 7x7 square.

The randomized section is composed of 25 pixels distributed to form a 5x5 square.

Each pixel has an **equal chance** of being **black** or **white**. However, there is a `1:10,000` chance of a pixel being red.

There are `33,554,432` possible combinations of black and white pixels.

## Service

A Node.js-based Service that handles a Art creation core, API, blockchain integration and a Worker.

- **Art Creation Core**: Set of features to generate arts and graduate its rarity.
- **API**: RESTless API to handle creation and mint request for generated arts.
- **Blockchain Integration**: Set of features to validate transactions, interact with a Contract ERC-721 and push files to IPFS.
- **Worker**: An asynchronous job, outside of main thread, that will create a new art on every timeframe.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/api-node-pixels.git
   cd api-node-pixels
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run build
   npm run dev
   ```

## Usage

### API Endpoints

#### `POST /api/image/pixels`

Request creation of a new art.

- **Request**: JSON object specifying prefix file name
- **Response**: JSON object with image metadata.

### Example Request

````bash
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name":"pixels"}' http://localhost:3000/api/image/pixels
````

````

## Configuration

Create a `.env` file in the root directory to configure environment variables:

```env
NODE_ENV=test

MONGO_URI=mongodb+srv://sample
OUTPUT_DIR=public

PUBLISH_ON_CHAIN=false

# CRON WORKER
CRON_ENABLED=false
CRON_SCHEDULE=*/1 * * * *

# PINATA
PINATA_API_KEY=<PINATA-API-KEY>
PINATA_API_SECRET=<PINATA_API_SECRET>
PINATA_JWT_KEY=<PINATA_JWT_KEY>
PINATA_GATEWAY=<PINATA_GATEWAY>
PINATA_URL=<PINATA_URL>

# ETHERSCAN
ETHERSCAN_API_KEY=<ETHERSCAN_API_KEY>

# POLYGON
POLYGON_RPC_URL=<POLYGON_RPC_URL>
POLYGON_CONTRACT_ADDRESS=<POLYGON_CONTRACT_ADDRESS>

# METAMASK
METAMASK_WALLET_SECRET_KEY=0000000000000000000000000000000000000000000000000000000000000000
METAMASK_WALLET_ADDRESS=0x0000000000000000000000000000000000000000
````

## Dependencies

- [Express](https://expressjs.com/) - Web framework for Node.js.
- [Ethers.js](https://ethers.org/) - A simple, compact and complete JavaScript
  library for all your Ethereum needs.
- [Canvas](https://github.com/Automattic/node-canvas) - node-canvas is a Cairo-backed Canvas implementation for Node.js.
- [Decimal](https://www.npmjs.com/package/decimal.js) - An arbitrary-precision Decimal type for JavaScript.
- [Pino](https://github.com/pinojs/pino) - Pino is a powerful logging framework for Node.js that boasts exceptional speed and comprehensive features.
- [Mongose](https://github.com/Automattic/mongoose) - Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. Mongoose supports Node.js and Deno (alpha).
- [Node-cron](https://github.com/merencia/node-cron) - The node-cron module is tiny task scheduler in pure JavaScript for node.js based on GNU crontab. This module allows you to schedule task in node.js using full crontab syntax.

## Development

### Scripts

- `npm run build`: Build the project for production.
- `npm run dev`: Start the development server.
- `npm test`: Run tests.

### Folder Structure

```
api-node-pixels/
├── public/
├── ├── pixels/
├── src/
│   ├── config/
│   ├── contracts/
│   ├── controllers/
│   ├── helpers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── workers/
└── README.md
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

