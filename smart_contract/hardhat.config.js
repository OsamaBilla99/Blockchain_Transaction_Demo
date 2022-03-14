// https://eth-ropsten.alchemyapi.io/v2/cQtd4TpaZ2yD02SC1VQh5vcpKb9kpBeq

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/cQtd4TpaZ2yD02SC1VQh5vcpKb9kpBeq',
      accounts: ['8c5ed7a3cc8c2c8496b9fad21a1d3c3b9a735aa4d40b99705e229f8e7d59160e']
    }
  }
}