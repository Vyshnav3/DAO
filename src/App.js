import './App.css';
import { useState, useEffect } from 'react';
import contractData from './contractData.json'
import { ethers } from 'ethers';

function App() {
  useEffect(() => {
    const storedAddress = localStorage.getItem('connectedAddress');
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []);

  const [address, setAddress] = useState("0x0000000000000000000000000000000000000000");
  const [contribute, setContribute] = useState('');
  const [contribution, setContribution] = useState('');
  const [totalContributions, setTotalContributions] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [proposalAddress, setProposalAddress] = useState('');
  const [proposalAmount, setProposalAmount] = useState('');
  const [isContributor, setIsContributor] = useState(false);
  const [allProposals, setAllProposals] = useState([]);
  const [showMyProposals, setShowMyProposals] = useState(true);


  useEffect(() => {
    getContributions();
    totalContribution();
    checkIsContributor();
  }, [address]);

  useEffect(() => {
    const handleAccountsChanged = (newAccounts) => {
      setAddress(newAccounts[0]);
      localStorage.setItem('connectedAddress', newAccounts[0]);
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const connect = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const connectedAddress = accounts[0];
        setAddress(connectedAddress);
        localStorage.setItem('connectedAddress', connectedAddress);
      } else {
        alert("Please Install METAMASK");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleChange = (e) => {
    setContribute(e.target.value);
  };

  const handleProposeTextChange = (e) => {
    setProposalText(e.target.value);
  };

  const handleProposeAddressChange = (e) => {
    setProposalAddress(e.target.value);
  };

  const handleProposeAmountChange = (e) => {
    setProposalAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractData.address, contractData.abi, signer);
      await contract.addContribution({ value: ethers.parseEther(contribute) });
      setContribute('');
    } catch (e) {
      console.log(e.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractData.address, contractData.abi, signer);
      const proposalAmount1 = ethers.parseEther(proposalAmount);
      await contract.propose(proposalText, proposalAmount1, proposalAddress, { value: ethers.parseEther("1") });
      setProposalAddress('');
      setProposalAmount('');
      setProposalText('');
      fetchAllProposals(); 
    } catch (e) {
      console.log(e.message);
    }
  };

  const getContributions = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractData.address, contractData.abi, provider);
      const yourContribution = await contract.getContribution(address);
      const yourContributionInEther = ethers.formatEther(yourContribution);
      setContribution(yourContributionInEther);
    } catch (e) {
      console.log(e.message);
    }
  };

  const totalContribution = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const totalContribution = await provider.getBalance(contractData.address);
      const totalContributionInEther = ethers.formatEther(totalContribution);
      setTotalContributions(totalContributionInEther);
    } catch (e) {
      console.log(e.message);
    }
  };

  const checkIsContributor = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractData.address, contractData.abi, provider);
      const result = await contract.isContributor(address);
      setIsContributor(result);
    } catch (e) {
      console.log(e.message);
    }
  };

  const fetchAllProposals = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractData.address, contractData.abi, provider);
      const arrayLength = await contract.getArrayLength();
      const proposals = [];

      
      if (showMyProposals) {
        for (let i = 0; i < arrayLength; i++) {
          const proposal = await contract.allProposals(i);
          proposals.push(proposal);
        }
        setAllProposals(proposals);
      } else {
        for (let i = 0; i < arrayLength; i++) {
          const proposal = await contract.allProposals(i);
          if (proposal.feesAddr.toLowerCase() === address.toLowerCase()) {
            proposals.push(proposal);
          }
        }
    
        setAllProposals(proposals);
      }
     
    } catch (e) {
      console.log(e.message);
    }
  };

  const vote = async (index, choice) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractData.address, contractData.abi, signer);
      await contract.vote(index, choice);
      fetchAllProposals(); 
    } catch (e) {
      console.log(e.message);
    }
  };

  const executeProposal = async (index) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractData.address, contractData.abi, signer);
      await contract.execute(index);
      fetchAllProposals();

    } catch (e) {
      console.log(e.message);
    }
  };
 
  
 const toggleProposals = () => {
  setShowMyProposals((prevShowTasks) => !prevShowTasks);
};

useEffect(() => {
  fetchAllProposals();
}, [][showMyProposals]);

  
  const calculateTimeRemaining = (time) => {
  var a = new Date(Number(time) * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time1 = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time1;
}

  return (
    <div>
      <h1 className='App'>DAO</h1>
      <div className='cont'>
        <button className='connectmeta' onClick={connect}>{address ? address : 'Connect Metamask'}</button>
      </div>
      <div className='container'>
        <h4>Contribute</h4>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='contribute'
            value={contribute}
            onChange={handleChange}
            placeholder='Enter your contribution'
          />
          <button type='submit' className='submitbutton'>Submit</button>
        </form>
        <div>
          {isContributor ? (
            <p>You are a member and your contribution is {contribution} Ether</p>
          ) : (
            <p>Your contribution is {contribution} Ether</p>
          )}
        </div>
        <p>Total DAO Balance: {totalContributions} Ether</p>
      </div>
      <hr className='dots' />
      <h4 style={{ display: 'flex', justifyContent: 'center' }}>Propose</h4>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <form onSubmit={submit}>
          <input
            type='text'
            name='contribute1'
            value={proposalText}
            onChange={handleProposeTextChange}
            placeholder='Enter proposal'
            style={{ marginRight: '10px' }}
          />
          <input
            type='text'
            name='contribute2'
            value={proposalAddress}
            onChange={handleProposeAddressChange}
            placeholder='Enter address'
            style={{ marginRight: '10px' }}
          />
          <input
            type='text'
            name='contribute3'
            value={proposalAmount}
            onChange={handleProposeAmountChange}
            placeholder='Enter amount'
            style={{ marginRight: '10px', width: '100px' }}
          />
          <button type='submit' className='submitbutton'>Submit</button>
        </form>
      </div>
      <hr className='dots' />
      <h4 style={{ display: 'flex', justifyContent: 'center' }}>All Proposals</h4>
      <div className='toggle-button'>
      {showMyProposals ? (
        <button onClick={toggleProposals}>Show My Proposals</button>
      ) : (
        <button onClick={toggleProposals}>Show All Proposals</button>
      )}

    </div>
      <div className="proposals-container">
        {allProposals.map((proposal, index) => (
          <div key={index} className="proposal-item">
            <p>Proposal Name: {proposal.proposalName}</p>
            <p>Amount: {ethers.formatEther(proposal.amount)} Ether</p>
            <p>By: {proposal.feesAddr} </p>
            <p>To: {proposal.addr} </p>
            <p>Yes Votes: {Number(proposal.yesVotes)}</p>
            <p>No Votes: {Number(proposal.noVotes)}</p>
            {proposal.time > Date.now() / 1000 ? (
              <>
                {isContributor && !proposal.executed && (
                  <>
                    <button onClick={() => vote(index, 0)}>Vote Yes</button>
                    <button onClick={() => vote(index, 1)}>Vote No</button>
                  </>
                )}
              <p>Ends at: {calculateTimeRemaining(proposal.time)}</p>

              </>
            ) : (
              <>
                {!proposal.executed && isContributor && (
                  <button onClick={() => executeProposal(index)}>Execute</button>
                )}
                {proposal.executed && (
                  <>
                    {proposal.yesVotes > proposal.noVotes ? (
                      <p>Proposal Result: Passed</p>
                    ) : (
                      <p>Proposal Result: Failed</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
}

export default App;
