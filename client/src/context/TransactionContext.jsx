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
    const [transactions, setTransactions ] = useState([]);
    const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
      };

      const getAllTransactions = async () => {
          try {
            if(!ethereum) return alert ("Please install metamask");
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }))
            
            const newArray = []
            newArray.push(structuredTransactions[1])
            newArray.push(structuredTransactions[2])
            newArray.push(structuredTransactions[13])
            newArray.push(structuredTransactions[14])
            console.log(newArray)
            console.log(structuredTransactions);
            setTransactions(newArray);

          } catch (error) {
              console.log(error)
          }
      }
    

    // kan hente ethereum accounts som er connected i nettleseren via metamask
    const checkIfWalletIsConnected = async () => {

        try {
            
            if(!ethereum) return alert ("Please install metamask");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            console.log(accounts[0])

            if(accounts.length) {
                setCurrentAccount(accounts[0]);
                console.log(accounts[0])
                getAllTransactions();
            } else {
                console.log('No accounts found');
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount)
        } catch (error) {
            throw new Error("No ethereum object.")
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert ("Please install metamask");

            // henter array av accounts som er koblet til metamask
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            // Pleier å kun være en account koblet til metamask, oppdaterer currentAccount til å være lik denne
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
            window.reload();
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setformData, handleChange, sendTransaction, transactions, isLoading }}>
            {children}
        </TransactionContext.Provider>
    );
}