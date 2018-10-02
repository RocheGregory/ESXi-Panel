from pyVim import connect
from pyVmomi import vim
import sys

# Gets virtual machine from name
def getVM(content, name):
    obj = None
    container = content.viewManager.CreateContainerView(
        content.rootFolder, [vim.VirtualMachine], True)
    for c in container.view:
        if name:
            if c.name == name:
                obj = c
                break
        else:
            obj = c
            break
    return obj

# Connect to ESXi
connection = connect.ConnectNoSSL("192.168.182.132", 443, "root", "ddos")

def isOnline(vmName):
    vm = getVM(connection.content, vmName)

    # If VM doesn't exist
    if (vm == None):
        print ("404", flush = True)
        return False

    if (vm.runtime.powerState == "poweredOff"):
        print ("Off", flush = True)
        return False
    else:
        print("On", flush = True)
        return True


# Run function
isOnline(sys.argv[1])

# Disconnect from ESXi
connect.Disconnect(connection)