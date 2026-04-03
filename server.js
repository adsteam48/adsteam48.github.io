const express = require('express');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
const { Client } = require('discord.js-selfbot-v13');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const wss = new WebSocketServer({ port: 8080 });

function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify({ type: 'log', message }));
  });
}

let client = null;
let isRunning = false;

// ステータス
app.get('/api/status', (req, res) => {
  const configPath = path.join(__dirname, 'config.json');
  let config = {};
  if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  res.json({ running: isRunning, config });
});

// 起動（Token付き）
app.post('/api/start', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ success: false, message: "Tokenがありません" });

  if (client) {
    client.destroy();
  }

  client = new Client({ checkUpdate: false });

  client.once('ready', () => {
    isRunning = true;
    broadcast(`✅ ログイン成功！ ${client.user.tag} で起動しました`);
  });

  client.on('error', (err) => {
    broadcast(`❌ エラー: ${err.message}`);
  });

  try {
    await client.login(token);
    res.json({ success: true });
  } catch (err) {
    broadcast(`❌ ログイン失敗: ${err.message}`);
    res.json({ success: false, message: err.message });
  }
});

// 停止
app.post('/api/stop', (req, res) => {
  if (client) {
    client.destroy();
    client = null;
  }
  isRunning = false;
  broadcast('🛑 Selfbotを停止しました');
  res.json({ success: true });
});

// config保存
app.post('/api/config', (req, res) => {
  fs.writeFileSync('config.json', JSON.stringify(req.body, null, 2));
  broadcast('📝 config.json 更新');
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🌐 http://localhost:${PORT} でダッシュボードを開いてください`);
});
