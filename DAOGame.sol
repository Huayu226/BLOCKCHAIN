// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DAOGame {
    struct Game {
        string name;
        uint256 betAmount;
        uint256 startTime;
    }

    Game[] public games;

    event GameCreated(string name, uint256 betAmount, uint256 startTime);

    function createGame(string memory name, uint256 betAmount, uint256 startTime) external {
        games.push(Game(name, betAmount, startTime));
        emit GameCreated(name, betAmount, startTime);
    }

    function getGame(uint256 index) external view returns (string memory, uint256, uint256) {
        Game memory g = games[index];
        return (g.name, g.betAmount, g.startTime);
    }
}
