import React, { useState } from "react";

function JoinGame({ game, account }) {
  const [gameId, setGameId] = useState(0);
  const [guess, setGuess] = useState(1);
  const [msg, setMsg] = useState("");

  const handleJoin = async () => {
    try {
      const tx = await game.joinGame(gameId, guess);
      await tx.wait();
      setMsg("✅ 成功加入遊戲！");
    } catch (err) {
      setMsg("❌ 加入失敗：" + err.message);
    }
  };

  return (
    <div>
      <h3>加入遊戲</h3>
      <input type="number" value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="Game ID" />
      <input type="number" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="猜的點數 1~6" />
      <button onClick={handleJoin}>加入</button>
      <p>{msg}</p>
    </div>
  );
}

export default JoinGame;
