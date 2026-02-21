from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import datetime as dt

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/train', methods=['POST'])
def train():
    data = request.form
    # print(f"data: {data}")
    # print(f"data type: {type(data)}")
    # print(f"data keys: {data.keys()}")
    if "json_file" not in data:
        print("No file uploaded")
        return jsonify({'error': 'No file uploaded'}), 400
    if "json_file_name" not in data:
        print("No file name uploaded")
        return jsonify({'error': 'No file name uploaded'}), 400
    json_file = data.get('json_file')
    json_file_name = data.get('json_file_name')
    print(f"json_file: {json_file}")
    # print(f"json_file type: {type(json_file)}")
    json_file_content = json.loads(json_file)
    print(json_file_content)
    print(f"json_file_content type: {type(json_file_content)}")
    return jsonify({'message': 'File uploaded successfully'}), 200

if __name__ == '__main_'_:
    app.run(debug=True)


# source .venv/bin/activate