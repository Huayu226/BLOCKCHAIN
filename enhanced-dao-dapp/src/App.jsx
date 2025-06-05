import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import daoAbi from "./abi/EnhancedDAO.json";
import gameAbi from "./abi/DAOGame.json";
import { DAO_ADDRESS, DAOGame_ADDRESS } from "./utils/daoConfig";
import CreateProposal from "./components/CreateProposal";
import ProposalList from "./components/ProposalList";
import JoinGame from "./components/JoinGame";
import RevealResult from "./components/RevealResult";
import GameList from "./components/GameList";

function App() {
  const [account, setAccount] = useState(null);
  const [dao, setDao] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          setError("請先安裝 MetaMask 錢包擴充功能！");
          return;
        }

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const daoContract = new Contract(DAO_ADDRESS, daoAbi, signer);
        const gameContract = new Contract(DAOGame_ADDRESS, gameAbi, signer);

        setAccount(address);
        setDao(daoContract);
        setGame(gameContract);
        console.log("✅ DAO 合約已載入", daoContract);
        console.log("✅ Game 合約已載入", gameContract);
      } catch (err) {
        console.error("❌ 初始化失敗：", err);
        setError("初始化 DApp 時發生錯誤");
      }
    };

    init();
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🧠 Enhanced DAO DApp</h1>
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
      {!account && !error && <p>🔌 等待 MetaMask 連接中...</p>}
      {account && <p>👤 Connected: {account}</p>}
      {dao && (
        <>
          <h2>📤 Create Proposal</h2>
          <CreateProposal dao={dao} />
          <hr />
          <h2>📋 All Proposals</h2>
          <ProposalList dao={dao} />
        </>
      )}
      {game && (
        <>
          <hr />
          <h2>🎲 Game Interaction</h2>
          <JoinGame game={game} account={account} />
          <RevealResult game={game} />
          <GameList game={game} />
        </>
      )}
    </div>
  );
}

export default App;
