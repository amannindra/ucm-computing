from flask import Flask, request, jsonify
from flask_cors import CORS
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
    print(data)
    timestamp = dt.datetime.now().strftime("%Y%m%d%H%M%S")
    file_path = os.path.join(UPLOAD_FOLDER, f"{timestamp}.png")
    print(file_path)
    file = data
    print(f"file: {file}")
    # file.save(file_path)
    x = dt.datetime.now()

    return {
        'Name':"geek", 
        "Age":"22",
        "Date":x, 
        "programming":"python"
        }

if __name__ == '__main__':
    app.run(debug=True)


# source .venv/bin/activate