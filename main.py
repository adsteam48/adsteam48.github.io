from flask import Flask, render_template_string, jsonify, request
from pyngrok import ngrok
import os

app = Flask(__name__)

# HTMLテンプレート
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Server</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #667eea;
            text-align: center;
        }
        .info {
            background: #f0f4ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .btn {
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover {
            background: #5568d3;
        }
        #response {
            margin-top: 20px;
            padding: 15px;
            background: #e8f5e9;
            border-radius: 5px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Flask + ngrok Server</h1>
        
        <div class="info">
            <h3>サーバー情報</h3>
            <p><strong>状態:</strong> 稼働中 ✅</p>
            <p><strong>アクセスURL:</strong> このページのURL</p>
        </div>

        <h3>APIテスト</h3>
        <button class="btn" onclick="testAPI()">APIを呼び出す</button>
        
        <div id="response"></div>

        <div class="info" style="margin-top: 30px;">
            <h3>利用可能なエンドポイント</h3>
            <ul>
                <li><code>GET /</code> - このページ</li>
                <li><code>GET /api/status</code> - サーバーステータス</li>
                <li><code>POST /api/echo</code> - エコーAPI</li>
            </ul>
        </div>
    </div>

    <script>
        async function testAPI() {
            const responseDiv = document.getElementById('response');
            responseDiv.style.display = 'block';
            responseDiv.innerHTML = '読み込み中...';
            
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                responseDiv.innerHTML = `
                    <h4>APIレスポンス:</h4>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                responseDiv.innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
            }
        }
    </script>
</body>
</html>
"""

# ルート定義
@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/status')
def status():
    return jsonify({
        'status': 'running',
        'message': 'Server is working!',
        'endpoints': ['/', '/api/status', '/api/echo']
    })

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    return jsonify({
        'received': data,
        'message': 'Echo successful'
    })

def start_ngrok():
    """ngrokトンネルを開始"""
    # 環境変数からngrok認証トークンを取得(オプション)
    auth_token = os.getenv('NGROK_AUTH_TOKEN')
    if auth_token:
        ngrok.set_auth_token(auth_token)
    
    # HTTPトンネルを開始
    port = 5000
    public_url = ngrok.connect(port)
    print('=' * 50)
    print(f'🌐 ngrok tunnel opened!')
    print(f'📍 Public URL: {public_url}')
    print('=' * 50)
    return public_url

if __name__ == '__main__':
    # ngrokトンネルを開始
    try:
        public_url = start_ngrok()
    except Exception as e:
        print(f'⚠️  ngrok起動エラー: {e}')
        print('ngrokなしでローカルサーバーを起動します...')
    
    # Flaskサーバーを起動
    print('🚀 Starting Flask server...')
    app.run(port=5000, debug=True, use_reloader=False)
