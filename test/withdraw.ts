import "@typus/typus-sdk/dist/src/utils/load_env";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { TypusConfig } from "@typus/typus-sdk/dist/src/utils";
import mne from "../mnemonic.json";
(async () => {
  let keypair = Ed25519Keypair.deriveKeypair(String(mne.W));
  let config = await TypusConfig.default("MAINNET", null);
  let provider = new SuiClient({ url: config.rpcEndpoint });

  let senderAddress = keypair.toSuiAddress();
  console.log(senderAddress);

  let apiUrl = "http://localhost:8080/v1/withdraw";
  let requestData = {
    positionId: "0",
    senderAddress: senderAddress,
    principal: {
      coinType: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      amount: "1000000000",
    },
    mode: "as-is",
  };
  let jsonData = JSON.stringify(requestData);

  let response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: jsonData,
  });

  let data = await response.json();
  console.log(data);

  let tx = Uint8Array.from(data.bytes);
  console.log(tx);

  let res = await provider.signAndExecuteTransaction({ signer: keypair, transaction: tx });
  console.log(res);
})();
