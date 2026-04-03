const express = require('express');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // index.html を配信

const wss = new WebSocketServer({ port: 8080 });

function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'log', message }));
    }
  });
}

let isRunning = false;

// ステータス
app.get('/api/status', (req, res) => {
  const configPath = path.join(__dirname, 'config.json');
  let config = { targetGuildId: "", modes: { useBotMode: false, fullServerCopy: false, autoCreateChannels: true }, channels: [] };
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  res.json({ running: isRunning, config });
});

// 起動
app.post('/api/start', (req, res) => {
  isRunning = true;
  broadcast('🚀 Selfbotを起動しました（実際のselfbotコードはここに後で追加）');
  res.json({ success: true });
});

// 停止
app.post('/api/stop', (req, res) => {
  isRunning = false;
  broadcast('🛑 Selfbotを停止しました');
  res.json({ success: true });
});

// config保存
app.post('/api/config', (req, res) => {
  fs.writeFileSync('config.json', JSON.stringify(req.body, null, 2));
  broadcast('📝 config.jsonを更新しました');
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n🌐 サーバー起動完了！`);
  console.log(`📍 ブラウザで開く → http://localhost:${PORT}`);
  console.log(`📡 WebSocketポート: 8080`);
});
