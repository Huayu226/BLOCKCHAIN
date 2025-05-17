import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import daoAbi from "./abi/EnhancedDAO.json";
import { DAO_ADDRESS } from "./utils/daoConfig";
import CreateProposal from "./components/CreateProposal";
import ProposalList from "./components/ProposalList";

function App() {
  const [account, setAccount] = useState(null);
  const [dao, setDao] = useState(null);
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

        setAccount(address);
        setDao(daoContract);
        console.log("✅ DAO 合約已載入", daoContract);
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
    </div>
  );
}

export default App;