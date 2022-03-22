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
    
    return transactionContract;

}
export const TransactionProvider = ({ children }) => {
    
    const [currentAccount, setCurrentAccount ] = useState('');
    const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactioncount] = useState(localStorage.getItem('transactionCount'));

    const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
      };
    

    // kan hente ethereum accounts som er connected i nettleseren via metamask
    const checkIfWalletIsConnected = async () => {

        try {
            
            if(!ethereum) return alert ("Please install metamask");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            console.log(accounts[0])

            if(accounts.length) {
                setCurrentAccount(accounts[0]);
                console.log(accounts[0])
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
            console.log(accounts[0])
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert ("Please install metamask");

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount)

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true); 
            console.log(`Loading -  ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false); 
            console.log(`Success -  ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactioncount(transactionCount.toNumber());
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setformData, handleChange, sendTransaction }}>
            {children}
        </TransactionContext.Provider>
    );
}