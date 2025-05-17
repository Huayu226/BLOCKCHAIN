import { useState } from "react";

function CreateProposal({ dao }) {
  const [desc, setDesc] = useState("");
  const [target, setTarget] = useState("");
  const [callData, setCallData] = useState("");

  const submitProposal = async () => {
    const tx = await dao.createProposal(desc, target, callData, 1);
    await tx.wait();
    alert("已送出提案！");
  };

  return (
    <div>
      <h2>創建提案</h2>
      <input placeholder="描述" value={desc} onChange={e => setDesc(e.target.value)} />
      <input placeholder="目標合約" value={target} onChange={e => setTarget(e.target.value)} />
      <input placeholder="callData(hex)" value={callData} onChange={e => setCallData(e.target.value)} />
      <button onClick={submitProposal}>送出</button>
    </div>
  );
}

export default CreateProposal;
