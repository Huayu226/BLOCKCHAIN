// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDAOGame {
    function createGame(string memory name, uint256 betAmount, uint256 startTime) external;
}

contract EnhancedDAO is Ownable {
    IERC20 public governanceToken;

    enum ProposalType { General, GameProposal }

    struct Proposal {
        string description;
        address proposer;
        uint256 deadline;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        ProposalType proposalType;
        address target;
        bytes callData;
    }

    Proposal[] public proposals;
    mapping(address => bool) public members;
    mapping(uint256 => mapping(address => bool)) public votes;
    mapping(address => bool) public approvedContracts;

    address public gameContract;

    event ProposalCreated(uint256 proposalId, address proposer, string description);
    event Voted(uint256 proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 proposalId);
    event GameCreated(uint256 indexed proposalId);

    modifier onlyMember() {
        require(members[msg.sender], "Not a DAO member");
        _;
    }

    constructor(address _governanceToken, address _gameContract) Ownable(msg.sender) {
        members[msg.sender] = true;
        governanceToken = IERC20(_governanceToken);
        gameContract = _gameContract;
        approvedContracts[_gameContract] = true;
    }

    function addMember(address newMember) external onlyOwner {
        members[newMember] = true;
    }

    function removeMember(address memberToRemove) external onlyOwner {
        members[memberToRemove] = false;
    }

    function createProposal(
        string memory description,
        address target,
        bytes memory callData,
        ProposalType proposalType
    ) external onlyMember {
        require(approvedContracts[target], "Target contract not approved");

        Proposal memory newProposal = Proposal({
            description: description,
            proposer: msg.sender,
            deadline: block.timestamp + 3 days,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            proposalType: proposalType,
            target: target,
            callData: callData
        });

        proposals.push(newProposal);
        emit ProposalCreated(proposals.length - 1, msg.sender, description);
    }

    function vote(uint256 proposalId, bool support) external onlyMember {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp <= proposal.deadline, "Voting period ended");
        require(!votes[proposalId][msg.sender], "Already voted");

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        votes[proposalId][msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external onlyMember {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.deadline, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");

        (bool success, ) = proposal.target.call(proposal.callData);
        require(success, "Proposal execution failed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);

        if (proposal.proposalType == ProposalType.GameProposal) {
            emit GameCreated(proposalId);
        }
    }

    function approveContract(address _contract) external onlyOwner {
        approvedContracts[_contract] = true;
    }

    function revokeContract(address _contract) external onlyOwner {
        approvedContracts[_contract] = false;
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    function getProposal(uint256 proposalId) external view returns (
        string memory,
        address,
        uint256,
        uint256,
        uint256,
        bool,
        ProposalType,
        address,
        bytes memory
    ) {
        Proposal memory p = proposals[proposalId];
        return (
            p.description,
            p.proposer,
            p.deadline,
            p.forVotes,
            p.againstVotes,
            p.executed,
            p.proposalType,
            p.target,
            p.callData
        );
    }
}
