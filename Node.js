// 必要なパッケージをインストール
// npm install discord.js express cors

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Discordクライアントの設定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

const TARGET_USER_ID = '1403167996607725629'; // 監視するユーザーID
let userStatus = {
    username: '',
    discriminator: '',
    avatar: '',
    status: 'offline', // online, idle, dnd, offline
    activities: [],
    voiceState: null
};

// ボットが準備完了
client.once('ready', () => {
    console.log(`✅ ボットがログインしました: ${client.user.tag}`);
    updateUserStatus();
});

// ユーザーステータスを更新
function updateUserStatus() {
    client.guilds.cache.forEach(guild => {
        const member = guild.members.cache.get(TARGET_USER_ID);
        if (member) {
            // 基本情報
            userStatus.username = member.user.username;
            userStatus.discriminator = member.user.discriminator;
            userStatus.avatar = member.user.displayAvatarURL();
            userStatus.status = member.presence?.status || 'offline';
            
            // アクティビティ情報
            userStatus.activities = member.presence?.activities.map(activity => ({
                name: activity.name,
                type: activity.type, // 0: Playing, 1: Streaming, 2: Listening, 3: Watching
                details: activity.details,
                state: activity.state,
                timestamps: activity.timestamps
            })) || [];
            
            // ボイス状態
            if (member.voice.channel) {
                userStatus.voiceState = {
                    channelId: member.voice.channelId,
                    channelName: member.voice.channel.name,
                    serverName: guild.name,
                    serverId: guild.id,
                    participantCount: member.voice.channel.members.size,
                    joinedAt: member.voice.joinedTimestamp,
                    muted: member.voice.selfMute,
                    deafened: member.voice.selfDeaf
                };
            } else {
                userStatus.voiceState = null;
            }
        }
    });
}

// プレゼンス更新時
client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (newPresence.userId === TARGET_USER_ID) {
        console.log('🔄 ステータスが更新されました');
        updateUserStatus();
    }
});

// ボイス状態更新時
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.id === TARGET_USER_ID || oldState.id === TARGET_USER_ID) {
        console.log('🎙️ ボイス状態が更新されました');
        updateUserStatus();
    }
});

// APIエンドポイント
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        data: userStatus,
        timestamp: Date.now()
    });
});

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 APIサーバーが起動しました: http://localhost:${PORT}`);
});

// Discordボットにログイン
client.login('MTQxODM2NTk2MTA0MzQ0Nzg4OQ.GwrRKg.uJtUs4IFBn3oW941qPifj74o-u_apTl3zPfLaA'); // ⚠️ ボットトークンを入力
