from flask import Flask, jsonify

app = Flask(__name__)

@app.get('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.get('/api/hello')
def hello():
    return jsonify({'message': 'Hello from Python backend!'})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
