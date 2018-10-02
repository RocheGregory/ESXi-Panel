from flask import Flask, render_template
from pyVim import connect
from pyVmomi import vim
import pymysql
import json
import sys

app = Flask(__name__)

@app.route("/")
def main():
    return render_template('index.html')

if __name__ == "__main__":

    # ESXi connection
    try:
        print ('Attempting to connect to host...')
        connection = connect.ConnectNoSSL("192.168.182.132", 443, "root", "toasterddos")
    except:
        print ('Cannot connect to host. Are the credentials correct?')
        exit()

    # MySQL connection
    try:
        print ('Attempting to connect to database...')
        database = pymysql.connect(host='localhost',
                             user='root',
                             password='',
                             db='vms',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)
        cursor = database.cursor(pymysql.cursors.DictCursor)
    except:
        print ('Cannot connect to database. Are the credentials correct?')
        exit()

    content = connection.content
    container = content.viewManager.CreateContainerView(content.rootFolder, [vim.VirtualMachine], True)
    
    print("Initializing VMs. This may take a while.")

    for c in container.view:
        print ('-----------------')
        # Read a single record
        cursor.execute("SELECT * FROM `vms` WHERE `name`='" + c.name + "';")
        print(cursor.fetchall())
        
        data = json.loads(str(cursor.fetchone()).replace('\'', '"'))
        print(data["name"])

        print ('-----------------\n')

    connect.Disconnect(connection)

    #app.run()
