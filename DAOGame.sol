// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOGame is Ownable {
    enum GameStatus { Pending, Open, Closed, Settled }

    struct Game {
        string name;
        uint256 betAmount;
        uint256 startTime;
        GameStatus status;
        address[] players;
        mapping(address => uint8) guesses;
        mapping(address => bool) hasJoined;
        uint256 totalPot;
        uint8 finalResult;
        bool resultRevealed;
    }

    IERC20 public token;
    address public daoAddress;

    Game[] private gameStorage;
    mapping(uint256 => Game) private gameData;

    event GameCreated(uint256 indexed gameId, string name, uint256 betAmount, uint256 startTime);
    event PlayerJoined(uint256 indexed gameId, address indexed player, uint8 guess);
    event GameClosed(uint256 indexed gameId);
    event GameSettled(uint256 indexed gameId, uint8 result, address[] winners, uint256 rewardEach);

    modifier onlyDAO() {
        require(msg.sender == daoAddress, "Only DAO can call this");
        _;
    }

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function setDAOAddress(address _dao) external onlyOwner {
        daoAddress = _dao;
    }

    function createGame(string memory name, uint256 betAmount, uint256 startTime) external /*onlyDAO*/ {
        uint256 gameId = gameStorage.length;
        Game storage g = gameData[gameId];
        g.name = name;
        g.betAmount = betAmount;
        g.startTime = startTime;
        g.status = GameStatus.Open;
        gameStorage.push();

        emit GameCreated(gameId, name, betAmount, startTime);
    }

    function joinGame(uint256 gameId, uint8 guess) external {
        require(guess >= 1 && guess <= 6, "Guess must be 1-6");
        Game storage g = gameData[gameId];
        require(g.status == GameStatus.Open, "Game is not open");
        require(!g.hasJoined[msg.sender], "Already joined");

        require(token.transferFrom(msg.sender, address(this), g.betAmount), "Transfer failed");
        g.players.push(msg.sender);
        g.guesses[msg.sender] = guess;
        g.hasJoined[msg.sender] = true;
        g.totalPot += g.betAmount;

        emit PlayerJoined(gameId, msg.sender, guess);
    }

    function closeGame(uint256 gameId) external onlyDAO {
        Game storage g = gameData[gameId];
        require(g.status == GameStatus.Open, "Game not open");
        g.status = GameStatus.Closed;
        emit GameClosed(gameId);
    }

    function revealResult(uint256 gameId, uint8 result) external onlyDAO {
        Game storage g = gameData[gameId];
        require(g.status == GameStatus.Closed, "Game must be closed");
        require(!g.resultRevealed, "Already revealed");

        g.finalResult = result;
        g.resultRevealed = true;
        g.status = GameStatus.Settled;

        address[] memory winners = new address[](g.players.length);
        uint256 count = 0;

        for (uint256 i = 0; i < g.players.length; i++) {
            address p = g.players[i];
            if (g.guesses[p] == result) {
                winners[count] = p;
                count++;
            }
        }

        uint256 rewardEach = count > 0 ? g.totalPot / count : 0;
        for (uint256 i = 0; i < count; i++) {
            require(token.transfer(winners[i], rewardEach), "Transfer failed");
        }

        address[] memory finalWinners = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            finalWinners[i] = winners[i];
        }

        emit GameSettled(gameId, result, finalWinners, rewardEach);
    }

    function totalGames() external view returns (uint256) {
        return gameStorage.length;
    }
}