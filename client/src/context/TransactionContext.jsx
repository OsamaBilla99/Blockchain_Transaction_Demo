import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

// objektet finnes i nettleseren via metamask
const { ethereum } = window;

const getEthereumContract = () => {
    // provider lager en connection til ethereum network https://docs.ethers.io/v5/api/providers/
    const provider = new ethers.providers.Web3Provider(ethereum);
    // signer er en bruker i ethereum network
    const signer = provider.getSigner();
    // henter vår smart contract som har blitt lastet opp til ethereum network
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log({
        provider,
        signer,
        transactionContract
    });

}

export const TransactionProvider = ({ children }) => {
    // 
    const [currentAccount, setCurrentAccount ] = useState('');

    // kan hente ethereum accounts som er connected i nettleseren via metamask
    const checkIfWalletIsConnected = async () => {

        try {
            
            if(!ethereum) return alert ("Please install metamask");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if(accounts.length) {
                setCurrentAccount(accounts[0]);

                // getAllTransactions();
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }


    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert ("Please install metamask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount }}>
            {children}
        </TransactionContext.Provider>
    );
}