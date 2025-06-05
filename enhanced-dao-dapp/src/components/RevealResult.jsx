import React, { useState } from "react";

function RevealResult({ game }) {
  const [gameId, setGameId] = useState(0);
  const [result, setResult] = useState(1);
  const [msg, setMsg] = useState("");

  const handleReveal = async () => {
    try {
      const tx = await game.revealResult(gameId, result);
      await tx.wait();
      setMsg("🎯 結果已公布！");
    } catch (err) {
      setMsg("❌ 公布失敗：" + err.message);
    }
  };

  return (
    <div>
      <h3>公布結果</h3>
      <input type="number" value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="Game ID" />
      <input type="number" value={result} onChange={(e) => setResult(e.target.value)} placeholder="結果點數 1~6" />
      <button onClick={handleReveal}>公布</button>
      <p>{msg}</p>
    </div>
  );
}

export default RevealResult;
