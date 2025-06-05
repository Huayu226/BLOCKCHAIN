import React, { useEffect, useState } from "react";

function GameList({ game }) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const loadGames = async () => {
      const count = await game.totalGames();
      const list = [];
      for (let i = 0; i < count; i++) {
        list.push(i);
      }
      setGames(list);
    };
    loadGames();
  }, [game]);

  return (
    <div>
      <h3>遊戲列表</h3>
      <ul>
        {games.map((id) => (
          <li key={id}>🎲 Game #{id}</li>
        ))}
      </ul>
    </div>
  );
}

export default GameList;
