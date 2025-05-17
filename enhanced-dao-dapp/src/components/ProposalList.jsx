import { useEffect, useState } from "react";

function ProposalList({ dao }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const count = await dao.getProposalCount();
      const result = [];

      for (let i = 0; i < count; i++) {
        const p = await dao.getProposal(i);
        result.push({ id: i, ...p });
      }

      setProposals(result);
    } catch (err) {
      console.error("❌ 提案讀取失敗：", err);
      if (err.message.includes("Not a DAO member")) {
        setError("你不是 DAO 成員，無法讀取提案。請加入成員後重整。");
      } else {
        setError("讀取提案時發生錯誤，請稍後再試。");
      }
    } finally {
      setLoading(false);
    }
  };

  const vote = async (id, support) => {
    try {
      const tx = await dao.vote(id, support);
      await tx.wait();
      alert("投票成功！");
      load(); // 重新載入更新票數
    } catch (err) {
      alert("投票失敗：" + err.message);
    }
  };

  const execute = async (id) => {
    try {
      const tx = await dao.executeProposal(id);
      await tx.wait();
      alert("提案已執行！");
      load(); // 重新載入更新狀態
    } catch (err) {
      alert("執行失敗：" + err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>📋 提案列表</h2>

      {loading && <p>🔄 正在載入提案...</p>}
      {error && (
        <div style={{ color: "red" }}>
          ❌ {error}
          <br />
          <button onClick={load}>🔄 重新嘗試載入</button>
        </div>
      )}

      {!loading && !error && proposals.length === 0 && <p>目前沒有提案。</p>}

      {proposals.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "8px" }}
        >
          <p>📝 描述：{p.description}</p>
          <p>👍 支持：{p.forVotes.toString()} | 👎 反對：{p.againstVotes.toString()}</p>
          <p>✅ 已執行：{p.executed ? "是" : "否"}</p>
          <button onClick={() => vote(p.id, true)}>✅ 支持</button>
          <button onClick={() => vote(p.id, false)} style={{ marginLeft: 8 }}>
            ❌ 反對
          </button>
          {!p.executed && (
            <button onClick={() => execute(p.id)} style={{ marginLeft: 8 }}>
              🚀 執行提案
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProposalList;
