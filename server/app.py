import os
import sys
current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)
from AudioMatch.AudioMatch import AudioMatch
from flask import Flask, request, jsonify, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS

audioMatch = AudioMatch()

UPLOAD_FOLDER = 'server/mp3/toFingerprint'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png',
                      'jpg', 'jpeg', 'gif', 'mp3', 'mp4', 'wav'}

IDENTIFY_FOLDER = 'server/mp3/identify'

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['IDENTIFY_FOLDER'] = IDENTIFY_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# for sending the file


@app.route('/uploadFile', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        print("files", request.files)
        if 'file' not in request.files:
            message = {'text': "Please Select any File"}
            print("1")
            return jsonify(message)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            message = {'text': "Please Select any File"}
            print("2")
            return jsonify(message)
        if file and allowed_file(file.filename):
            print("file found **************", file.filename)

            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            message = {'text': "File Uploaded Successfully"}
            print("3")
            audioMatch.fingerprintOne(app.config['UPLOAD_FOLDER'], filename)
            return jsonify(message)
            # return redirect(url_for('download_file', name=filename))
        return jsonify({'text': "There is some error in uplaoding file"})
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''


@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], name)


@app.route('/uploadRecording', methods=['POST'])
def upload_recorded_file():
    if 'file' not in request.files:
        message = {'text': "Please Record any File"}
        print("1")
        return jsonify(message)
    file = request.files['file']
    if file.filename == '':
        message = {'text': "Please Record any File"}
        print("2")
        return jsonify(message)
    if file and allowed_file(file.filename):
        print("file found **************", file.filename)

        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['IDENTIFY_FOLDER'], filename))
        message = {'text': "File Uploaded Successfully"}
        print("3")
        # audioMatch.identifyWav(app.config['UPLOAD_FOLDER'], filename)
        song = audioMatch.identifyWav(app.config['IDENTIFY_FOLDER']+'/'+filename)
        return jsonify(message)
        # return redirect(url_for('download_file', name=filename))
    return jsonify({'text': "There is some error in uplaoding file"})


if __name__ == '__main__':
    app.secret_key = 'secret'
    app.run(debug=True, host='0.0.0.0')
