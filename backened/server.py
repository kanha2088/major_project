from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Flask Server is Running!"

@app.route('/receive-id', methods=['POST'])
def receive_id():
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "Invalid JSON format"}), 400

    user_id = data.get("id")
    rice_amount = data.get("riceAmount")
    
    if not user_id or not rice_amount:
        return jsonify({"message": "ID or Rice amount missing"}), 400
    
    print(f"✅ Received ID: {user_id}, Rice Amount: {rice_amount} grams")
    
    # Future: update Excel or log dispensing event
    
    return jsonify({
        "message": "ID and rice amount received successfully",
        "id": user_id,
        "riceAmount": rice_amount
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True, use_reloader=False)

