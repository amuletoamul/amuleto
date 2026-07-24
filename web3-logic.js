// TARGET MANAGEMENT WALLET FOR RECEIVING ALL FUNDS
const managementWallet = "0x2fFd166DbA77123A7a149A50F9C7D4f28581438B"; 
// OFFICIAL BEP-20 USDT CONTRACT ON BNB CHAIN
const usdtContractAddress = "0x55d398326f99059fF775485246999027B3197955"; 
const usdtAbi = ["function transfer(address to, uint256 value) external returns (bool)"];

let provider;
let signer;
let userAddress;
let selectedCurrency = 'BNB';

function selectCurrency(currency) {
    selectedCurrency = currency;
    if(currency === 'BNB') {
        document.getElementById('bnbTierBtn').classList.add('active');
        document.getElementById('usdtTierBtn').classList.remove('active');
        document.getElementById('inputLabel').innerText = "Amount in BNB (Min: 0.01 / Max: 5)";
        document.getElementById('cryptoInput').placeholder = "0.1";
        document.getElementById('cryptoInput').step = "0.01";
    } else {
        document.getElementById('bnbTierBtn').classList.remove('active');
        document.getElementById('usdtTierBtn').classList.add('active');
        document.getElementById('inputLabel').innerText = "Amount in USDT (Min: 50 / Max: 3000)";
        document.getElementById('cryptoInput').placeholder = "100";
        document.getElementById('cryptoInput').step = "10";
    }
}

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            
            const network = await provider.getNetwork();
            if(network.chainId !== 56) {
                alert("Please switch your wallet network to BNB Smart Chain!");
                return;
            }

            document.getElementById('connectBtn').innerText = "Connected: " + userAddress.substring(0,6) + "..." + userAddress.substring(38);
            document.getElementById('connectBtn').style.background = "#00ff88";
            document.getElementById('buyBtn').style.display = "block";
        } catch (error) {
            console.error(error);
            alert("Wallet connection failed.");
        }
    } else {
        alert("MetaMask or Trust Wallet not found. Please install extension!");
    }
}

async function executePurchase() {
    const amount = document.getElementById('cryptoInput').value;
    
    if(selectedCurrency === 'BNB') {
        if(!amount || amount < 0.01 || amount > 5) {
            alert("Please enter a valid BNB amount between 0.01 and 5 BNB.");
            return;
        }
        try {
            const tx = await signer.sendTransaction({
                to: managementWallet,
                value: ethers.utils.parseEther(amount)
            });
            alert("Transaction submitted! Hash: " + tx.hash + "\nYour $AMUL tokens will be delivered within 24 hours after verification.");
        } catch (error) {
            alert("Transaction failed.");
        }
    } else {
        if(!amount || amount < 50 || amount > 3000) {
            alert("Please enter a valid USDT amount between 50 and 3000 USDT.");
            return;
        }
        try {
            const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, signer);
            const parsedAmount = ethers.utils.parseUnits(amount, 18); 
            
            const tx = await usdtContract.transfer(managementWallet, parsedAmount);
            alert("USDT Transaction submitted! Hash: " + tx.hash + "\nYour $AMUL tokens will be delivered within 24 hours after verification.");
        } catch (error) {
            console.error(error);
            alert("USDT Transaction failed. Make sure you have enough USDT and small BNB for gas.");
        }
    }
}

function copyContract() {
    var addressText = document.getElementById('tokenContract').innerText;
    navigator.clipboard.writeText(addressText).then(function() {
        alert('AMULETO Contract Address Copied!');
    }).catch(function(err) {
        alert('Copy failed.');
    });
}
