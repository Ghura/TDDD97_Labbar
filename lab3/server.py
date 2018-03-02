from flask import Flask, jsonify
from flask import app, request, json, g
from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
import database_helper
import string
import random


webSockets = {}

app = Flask(__name__)
#app.debug = True flyttad langst ner


def token_generator(size=20, chars=string.ascii_uppercase + string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))
#from: https://stackoverflow.com/questions/2257441/random-string-generation-with-upper-case-letters-and-digits-in-python


@app.before_request
def before_request():
    database_helper.connect_db()

@app.teardown_request
def teardown_request(exception):
    database_helper.close_db()


@app.route('/')
@app.route('/static/client.html')
def statisk():
    return app.send_static_file('client.html')


@app.route('/signin', methods=['POST'])
def sign_in():
    # Getting the data and validating it before continue.
    data = request.get_json()
    keys = ["email", "password"]
    if not check_input_data(data, keys):
        return jsonify(success=False, message="Wrong input data.")
    # ------------------------------------------------------------------ #

    if database_helper.check_valid_user(data['email'], data['password']):
        token = token_generator()
        database_helper.add_token_user(data['email'], token)

        if data['email'] in webSockets:
            webSockets[data['email']].send(json.dumps("signOutNow"))
            del webSockets[data['email']]
        return jsonify(success=True, message="Logged in.", data=token)
    else:
        return jsonify(success=False, message="Wrong username or password!")



@app.route('/signup', methods=['POST'])
def sign_up():
    data = request.get_json()
    keys = ["firstname", "familyname", "email", "password", "gender", "city", "country"]
    if not check_input_data(data, keys):
        return jsonify(success=False, message="Wrong input data.")

    if len(data['password']) < 4:
        return jsonify(success=False, message="Password has to be at least four characters!")

    try:
        database_helper.add_user(data['firstname'], data['familyname'], data['email'], data['password'], data['gender'], data['city'], data['country'])
        return jsonify(success=True, message="Signed up!")
    except:
        return jsonify(success=False, message="Could not sign up!")


@app.route('/signout', methods=['POST'])
def sign_out():
    token = request.headers.get("Authorization")

    email = database_helper.get_email_by_token(token)

    if email in webSockets:
        del webSockets[email]

    if email and database_helper.remove_token_user(token):
        return jsonify(success=True, message="Logged out!")
    else:
        return jsonify(success=False, message="Token does not exist/Already signed out?")

@app.route('/changepassword', methods=['POST'])
def change_password():
    token = request.headers.get("Authorization")
    data = request.get_json()
    keys = ["old_password", "new_password"]

    if not check_input_data(data, keys):
        return jsonify(success=False, message="Wrong input data.")

    if not database_helper.check_token(token):
        return jsonify(success=False, message="You must be logged in to change password!")

    email = database_helper.get_email_by_token(token)

    if database_helper.check_valid_user(email, data['old_password']):
        database_helper.update_password(data['new_password'], email)
        return jsonify(success=True, message="Password changed!")
    else:
        return jsonify(success=False, message="Wrong old password!")


@app.route('/get-user-data-by-token/', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get("Authorization")

    if database_helper.get_email_by_token(token):
        email = database_helper.get_email_by_token(token)
        data = database_helper.get_user_data(email)
        return jsonify(success=True, message="User data sent.", data=data)
    else:
        return jsonify(success=False, message="Token does not exist.")

@app.route('/get-user-data-by-email/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get("Authorization")

    if not database_helper.check_token(token):
        return jsonify(success=False, message="Token does not exist.")

    if database_helper.get_user_data(email):
        data = database_helper.get_user_data(email)
        return jsonify(success="True", message="User data sent.", data=data)
    else:
        return jsonify(success=False, message="User does not exist.")


@app.route('/post-message', methods=['POST'])
def post_message():
    token = request.headers.get("Authorization")
    data = request.get_json()
    keys = ["message", "recipient"]

    if not check_input_data(data, keys):
        return jsonify(success=False, message="Wrong input data.")

    if not database_helper.check_token(token):
        return jsonify(success=False, message="Not signed in!")

    if not database_helper.get_user_data(data['recipient']):
        return jsonify(success=False, message="User does not exist.")

    sender = database_helper.get_email_by_token(token)

    try:
        database_helper.add_message(sender, data['message'], data['recipient'])
        return jsonify(success=True, message="Message posted!")
    except:
        return jsonify(success=False, message="Could not send message!")



@app.route('/get-user-messages-by-token/', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get("Authorization")

    if database_helper.check_token(token):
        email = database_helper.get_email_by_token(token)
        if database_helper.get_user_messages(email):
            messages = database_helper.get_user_messages(email)
            return jsonify(success=True, message="Messages recieved!", data=messages)
        else:
            return jsonify(success=False, message="User has no messages yet.")
    else:
        return jsonify(success=False, message="Not logged in.")

@app.route('/get-user-messages-by-email/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get("Authorization")

    if not database_helper.check_token(token):
        return jsonify(success=False, message="Token does not exist.")
    if database_helper.get_user_data(email):
        if database_helper.get_user_messages(email):
            messages = database_helper.get_user_messages(email)
            return jsonify(success=True, message="Messages recieved!", data=messages)
        else:
            return jsonify(success=False, message="User has no messages yet.")
    else:
            return jsonify(success=False, message="User does not exist.")


def check_input_data(data, keys):
    missing = 0
    for i in keys:
        if data.get(i, None) is None:           # check if correct keys
            missing = missing + 1
        elif len(data[i]) < 1:                  # check if keys are empty or not.
            missing = missing + 1
        elif len(data) is not len(keys):        # check if the amount of keys is correct
            missing = missing + 1
        else:
            missing = missing

    if missing > 0:
            return False
    else:
            return True


#socket.route

@app.route('/api')
def api():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while True:
            msg = ws.receive()

            if database_helper.check_token(msg):
                email = database_helper.get_email_by_token(msg)
                webSockets[email] = ws
            else:
                ws.close()
    return "OK"



if __name__ == '__main__':
    app.debug = True
    http_server = WSGIServer(('', 5169), app, handler_class=WebSocketHandler)
    http_server.serve_forever()

