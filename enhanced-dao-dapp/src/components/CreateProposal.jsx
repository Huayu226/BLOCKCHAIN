import React, { useState } from "react";
import { ethers } from "ethers";
import gameAbi from "../abi/DAOGame.json";
import { DAOGame_ADDRESS } from "../utils/daoConfig";

const iface = new ethers.Interface(gameAbi);

const functionList = [
  {
    label: "createGame(string,uint256,uint256)",
    name: "createGame",
    inputs: ["name", "betAmount"]
  },
  {
    label: "closeGame(uint256)",
    name: "closeGame",
    inputs: ["gameId"]
  },
  {
    label: "revealResult(uint256,uint8)",
    name: "revealResult",
    inputs: ["gameId", "dice"]
  }
];

function CreateProposal({ dao }) {
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState(DAOGame_ADDRESS);
  const [selectedFunc, setSelectedFunc] = useState(functionList[0]);
  const [args, setArgs] = useState({});
  const [callData, setCallData] = useState("");
  const [message, setMessage] = useState("");

  const handleArgChange = (key, value) => {
    setArgs((prev) => ({ ...prev, [key]: value }));
  };

  const generateCallData = () => {
    try {
      const inputValues = selectedFunc.inputs.map((key) => {
        if (key === "name") return args[key] || "";
        if (key === "betAmount") return parseInt(args[key] || "0");
        if (key === "gameId") return parseInt(args[key] || "0");
        if (key === "dice") return parseInt(args[key] || "0");
        return args[key];
      });

      // 對 createGame 自動補上七天後的 startTime
      if (selectedFunc.name === "createGame") {
        const sevenDaysLater = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
        inputValues.push(sevenDaysLater);
      }

      const encoded = iface.encodeFunctionData(selectedFunc.name, inputValues);
      setCallData(encoded);
      setMessage("✅ callData 編碼成功");
    } catch (err) {
      setMessage("❌ callData 編碼失敗: " + err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const tx = await dao.createProposal(description, target, callData, 1); // type 1: GameProposal
      await tx.wait();
      setMessage("✅ 提案送出成功！");
    } catch (err) {
      setMessage("❌ 提案送出失敗: " + err.message);
    }
  };

  return (
    <div>
      <h3>📤 創建提案</h3>

      <label>描述：</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>目標合約地址：</label>
      <input value={target} onChange={(e) => setTarget(e.target.value)} />
      <button onClick={() => setTarget(DAOGame_ADDRESS)}>使用遊戲合約</button>

      <label>選擇函式：</label>
      <select
        value={selectedFunc.name}
        onChange={(e) => {
          const func = functionList.find((f) => f.name === e.target.value);
          setSelectedFunc(func);
          setArgs({});
          setCallData("");
          setMessage("");
        }}
      >
        {functionList.map((f) => (
          <option key={f.name} value={f.name}>
            {f.label}
          </option>
        ))}
      </select>

      {selectedFunc.inputs.map((param) => (
        <div key={param}>
          <label>{param}：</label>
          <input
            value={args[param] || ""}
            onChange={(e) => handleArgChange(param, e.target.value)}
          />
        </div>
      ))}

      <button onClick={generateCallData}>🔧 產生 callData</button>
      <p>callData：<code>{callData}</code></p>

      <button onClick={handleSubmit}>📤 提交提案</button>
      <p>{message}</p>
    </div>
  );
}

export default CreateProposal;
