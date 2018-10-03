from flask import Flask
from flask_restful import Api, Resource, reqparse
from pyVim import connect
from pyVmomi import vim
import json
import pymysql

apikey = "915ea4c1-bf7e-4038-97f8-047db982153f"

app = Flask(__name__)
api = Api(app)

# MySQL connection
try:
    print ('Attempting to connect to database...')
    database = pymysql.connect(host='localhost',
                        user='root',
                        password='',
                        db='vms',
                        autocommit=True,
                        charset='utf8mb4',
                        cursorclass=pymysql.cursors.DictCursor)
    cursor = database.cursor(pymysql.cursors.DictCursor)
except:
    print ('Cannot connect to database. Are the credentials correct?')
    exit()

# Gets virtual machine from name
def getVM(content, name):
    obj = None
    container = content.viewManager.CreateContainerView(content.rootFolder, [vim.VirtualMachine], True)
    for c in container.view:
        if name:
            if c.name == name:
                obj = c
                break
        else:
            obj = c
            break
    return obj

#cursor.execute("SELECT * FROM `vms`")
#print(json.dumps(cursor.fetchall()))

users = [
    {
        "name": "Nicholas",
        "age": 42,
        "occupation": "Network Engineer"
    },
    {
        "name": "Elvin",
        "age": 32,
        "occupation": "Doctor"
    },
    {
        "name": "Jass",
        "age": 22,
        "occupation": "Web Developer"
    }
]

class User(Resource):
    def get(self, name):
        cursor.execute("SELECT * FROM `vms`")
        vms = cursor.fetchall()
        for vm in vms:
            if(name == vm["name"]):
                return vm, 200
        return "VM not found.", 404

    def post(self, name):
        parser = reqparse.RequestParser()
        parser.add_argument("description", required=True, help="Missing parameter.")
        parser.add_argument("owner", required=True, help="Missing parameter.")
        parser.add_argument("location", required=True, help="Missing parameter.")
        parser.add_argument("OS", required=True, help="Missing parameter.")
        parser.add_argument("api-key", required=True, help="Missing API key.")
        args = parser.parse_args()
        
        global apikey
        if (apikey == args["api-key"]):
            # Add to database
            cursor.execute("INSERT INTO `vms` (`id`, `name`, `description`, `owner`, `location`, `ip`, `boottime`, `OS`) VALUES (NULL, '" + name + "', '" + args["description"] + "', '" + args["owner"] + "', 'off', '', '', '" + args["OS"] + "')")
            
            # Create VM
            #connection = connect.ConnectNoSSL("192.168.182.132", 443, "root", "ddos")

            return "Request accepted.", 201
        return "Bad API key.", 403


    def put(self, id):
        parser = reqparse.RequestParser()
        parser.add_argument("name")
        parser.add_argument("description")
        parser.add_argument("owner")
        parser.add_argument("location")
        parser.add_argument("power")
        parser.add_argument("OS")
        parser.add_argument("api-key", required=True, help="Missing API key.")
        args = parser.parse_args()

        if (args["power"] == "on" and len(args) > 0):
            connection = connect.ConnectNoSSL("192.168.182.132", 443, "root", "toasterddos")
            cursor.execute("SELECT `name` FROM `vms` WHERE `id`='" + str(id) + "'")
            vm = getVM(connection.content, cursor.fetchone()["name"])
            vm.PowerOn()
            connect.Disconnect(connection)
            return "On.", 200
        elif (args["power"] == "off" and len(args) > 0):
            connection = connect.ConnectNoSSL("192.168.182.132", 443, "root", "toasterddos")
            cursor.execute("SELECT `name` FROM `vms` WHERE `id`='" + str(id) + "'")
            vm = getVM(connection.content, cursor.fetchone()["name"])
            vm.PowerOff()
            connect.Disconnect(connection)
            return "Off.", 200

       # global apikey
        #if (apikey == args["api-key"]):
        #    # Add to database
       #     cursor.execute("UPDATE `vms` SET `name`='" + args["name"] + "', `description`='" + args["description"] + "', `owner`='" + args["owner"] + "', `location`='" + args["location"] + "', `OS`='" + args["OS"] + "' WHERE `name`='" + name + "'")
       #     return "Request accepted.", 201
       # return "Bad API key.", 403


    def delete(self, name):
        global users
        users = [user for user in users if user["name"] != name]
        return "{} is deleted.".format(name), 200


api.add_resource(User, "/vm/<int:id>")
app.run(debug=True)