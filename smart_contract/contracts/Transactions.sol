//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

//Solidity er statically typed programming language
//transactionCounter holder telling på antall transaksjoner gjennomført i applikasjonen

//Forskjell på event og funksjon i solidity: https://levelup.gitconnected.com/events-vs-functions-in-solidity-3d6e797f349e

//Event Transfer tar inn data og lager et objekt av det ved å sende dataen inn i TransferStruct. Dette objektet blir lagret i en array kalt transactions.
contract Transactions {
    uint256 transactionCount;

    event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);

    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] transactions;

    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public {
        transactionCount += 1;
        // objektet "msg" er noe vi har tilgang til når vi kjører funksjoner i blockchain. Objektet inneholder informasjon om transaksjonen
        // Andre attributter vi har tilgang til gjennom "msg" er: msg.gas, msg.sig, msg.value (https://ethereum.stackexchange.com/questions/6542/what-are-the-attributes-of-the-msg-object-and-how-can-i-list-them)
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));


        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    // https://www.tutorialspoint.com/solidity/solidity_view_functions.htm
    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }

}
