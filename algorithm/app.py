from flask import Flask, request, jsonify, send_file
import subprocess
import os
import sys
import tempfile
import shutil
import uuid
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global temp directory for output files (prevents temp files from being deleted)
TEMP_OUTPUT_DIR = os.path.join(tempfile.gettempdir(), "model_generation")
os.makedirs(TEMP_OUTPUT_DIR, exist_ok=True)

@app.route('/')
def index():
    return "3D Model Generation API"

def generate_unique_filename():
    """Generate a unique filename using UUID and timestamp"""
    timestamp = int(time.time())
    unique_id = str(uuid.uuid4())[:8]
    return f"model_{timestamp}_{unique_id}"

@app.route('/generate', methods=['POST'])
def generate_model():
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        # Extract parameters from request
        word1 = data.get('word1')
        word2 = data.get('word2')
        model_type = int(data.get('type_model', 1))
        counts_letters1 = data.get('counts_letters1')
        counts_letters2 = data.get('counts_letters2')
        lengths1 = data.get('lengths1')
        lengths2 = data.get('lengths2')
        type_platform = int(data.get('type_platform', 0))
        offset_platform = float(data.get('offset_platform', 0.15))
        height_platform = float(data.get('height_platform', 0.1))
        expansion = data.get('expansion', 'blend')
        
        # Validate required parameters
        if not word1 or not word2:
            return jsonify({"error": "Missing required parameters: word1 and word2"}), 400
        
        # Generate a unique filename instead of using words
        unique_filename = generate_unique_filename()
        output_filename = os.path.join(TEMP_OUTPUT_DIR, unique_filename)
        
        # Build command line arguments
        cmd = [
            "blender",
            "--background",
            "--python", "main.py",
            "--",
            "--words", word1, word2,
            "--output", output_filename,
            "--expansion", expansion,
            "--type_model", str(model_type),
            "--type_platform", str(type_platform),
            "--offset_platform", str(offset_platform),
            "--height_platform", str(height_platform)
        ]
        
        # Add type-specific parameters
        if model_type == 2 and counts_letters1 and counts_letters2:
            cmd.extend(["--counts_letters", counts_letters1, counts_letters2])
        elif model_type == 3 and lengths1 and lengths2:
            cmd.extend(["--lengths", lengths1, lengths2])
        
        # Execute the command
        print(f"Executing command: {' '.join(cmd)}")
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        stdout_text = stdout.decode('utf-8', errors='ignore')
        stderr_text = stderr.decode('utf-8', errors='ignore')
        print(f"Process stdout: {stdout_text}")
        print(f"Process stderr: {stderr_text}")
        
        if process.returncode != 0:
            return jsonify({
                "error": "Failed to generate model",
                "details": stderr_text
            }), 500
        
        output_file = f"{output_filename}.{expansion}"
        if not os.path.exists(output_file):
            return jsonify({
                "error": "Model file was not created",
                "stdout": stdout_text,
                "stderr": stderr_text
            }), 500
        
        # Add metadata to the response
        metadata = {
            "word1": word1,
            "word2": word2,
            "model_type": model_type,
            "platform_type": type_platform,
            "timestamp": time.time()
        }
        
        # Return file information
        filename = os.path.basename(output_file)
        return jsonify({
            "status": "success",
            "filename": filename,
            "download_url": f"/download/{filename}",
            "metadata": metadata
        })
        
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Exception: {str(e)}")
        print(f"Traceback: {traceback_str}")
        return jsonify({
            "error": str(e),
            "traceback": traceback_str
        }), 500

@app.route('/files', methods=['GET'])
def list_files():
    """List all generated model files"""
    try:
        files = []
        for filename in os.listdir(TEMP_OUTPUT_DIR):
            file_path = os.path.join(TEMP_OUTPUT_DIR, filename)
            if os.path.isfile(file_path):
                stats = os.stat(file_path)
                files.append({
                    "filename": filename,
                    "size": stats.st_size,
                    "created": stats.st_ctime,
                    "download_url": f"/download/{filename}"
                })
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    # Look for the file in our managed temp directory
    file_path = os.path.join(TEMP_OUTPUT_DIR, filename)
    
    if not os.path.exists(file_path):
        return jsonify({"error": f"File not found: {filename}"}), 404
    
    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 