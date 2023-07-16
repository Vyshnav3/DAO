// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DAO{

    mapping (address=>uint) contribution;
    address[] public contributors;
    struct Proposal {
        string proposalName;
        uint amount;
        uint time;
        address feesAddr;
        address addr;
        uint yesVotes;
        uint noVotes;
        bool executed;
        
    }
    enum Vote {yes,no}
    Proposal[] public allProposals;
    mapping(uint => mapping(address => bool)) public hasVoted;
     

     modifier onlyContributor(){
         require(contribution[msg.sender] >= 100^18,"You are not a contributer to DAO");
         _;
     }
  
   mapping(address => bool) public isContributor;

function addContribution() public payable {
    require(msg.value >= 10000000000000000000, "Sorry, you need to contribute more than 10Ether");
    contribution[msg.sender] += msg.value;
    if (!isContributor[msg.sender]) {
        isContributor[msg.sender] = true;
        contributors.push(msg.sender);
    }
}
    function getContribution(address _addr) public view returns(uint){
        return contribution[_addr];
    }


function propose(string memory _proposalName,uint _amount, address _address) public payable {

require(msg.value==1000000000000000000,"For proposing u need to add 1Ether to DAO");

allProposals.push((Proposal({proposalName:_proposalName, 
           amount:_amount,
                  time:block.timestamp+2 minutes, 
            feesAddr:msg.sender,
            addr:_address,
            yesVotes: 0,    
            noVotes: 0,
            executed: false
            })));


}
    function vote(uint _index, Vote _vote) public onlyContributor{
   require(!allProposals[_index].executed,"Ended Sorry");
    require(allProposals[_index].time>block.timestamp,"The time got over");
    require(!hasVoted[_index][msg.sender], "Already voted for this proposal");

        Proposal storage proposal = allProposals[_index];
          
           if (_vote == Vote.yes){
              proposal.yesVotes++;
          }
          else if(_vote == Vote.no){
              proposal.noVotes++;
          }
          hasVoted[_index][msg.sender]=true;
    }

    function execute(uint _index) public payable onlyContributor{
        require(!allProposals[_index].executed,"Already executed BRO");
        require(allProposals[_index].time<block.timestamp,"Wait, The time should get over right");
        Proposal storage proposal = allProposals[_index];
        if (proposal.yesVotes > proposal.noVotes){
     
        (bool success, ) =proposal.addr.call{value: proposal.amount}("");
            require(success,"Not success");
       (bool success1, ) =proposal.feesAddr.call{value: 1000000000000000000}("");
            require(success1,"Not success");
            proposal.executed=true;
        }
        else {
            proposal.executed=true;
        }
        
    }

    function getArrayLength() public view returns(uint){ 
        return allProposals.length;
    } 
    receive() external payable{}
    fallback() external payable{}
}