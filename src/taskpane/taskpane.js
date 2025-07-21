function log(msg){
  document.getElementById("result").textContent += msg + "\n";
}
Office.onReady(() => {
  log("Office.ready");
  document.getElementById("scan").onclick = async () => {
    log("scan clicked");
    try {
      const body = await Word.run(async ctx => {
        const r = ctx.document.body; r.load("text"); await ctx.sync(); return r.text;
      });
      log("doc len="+body.length);
      const res = await fetch("https://localhost:5001/check", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({doc:body})
      });
      const data = await res.json();
      log("missing: "+data.missing.join(", "));
    } catch(e){ log("ERR "+e); }
  };
});

// --- 損害賠償条項の存在判定処理を追加 ---
function containsDamageClause(text) {
  const pattern = /(損害賠償|賠償責任|損害の補填)/;
  return pattern.test(text);
}

// --- ボタン押下時に本文チェックしてUI更新 ---
document.getElementById("run").addEventListener("click", async () => {
  await Word.run(async (context) => {
    const body = context.document.body;
    body.load("text");
    await context.sync();
    const resultEl = document.getElementById("result");
    if (containsDamageClause(body.text)) {
      resultEl.innerText = "✅ 損害賠償条項：あり";
    } else {
      resultEl.innerText = "⚠️ 損害賠償条項：なし";
    }
  });
});
