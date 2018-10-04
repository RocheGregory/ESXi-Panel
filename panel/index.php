<!DOCTYPE html>
<html>
<head>
    <!-- CSS -->
    <link rel="stylesheet" href="../css/bootstrap.min.css">
    <link rel="stylesheet" href="../css/panel.css">
</head>
<body>

    <div class="container-fluid">
        <div class="sidenav">
            <a><i class="nav-icon material-icons">home</i></a>
        </div>


        <div class="row">
            <div class="left-side">
               <h1 class="title">Virtual Machines</h1>
            </div>
            
            <div class="right-side">
                <a class="btn btn-info new-vm-btn">Deploy a new machine</a>
            </div>
        </div>
        
        <div class="cards-row row">

                <?php
                    /* Attempt MySQL server connection. Assuming you are running MySQL
                    server with default setting (user 'root' with no password) */
                    $mysqli = new mysqli("localhost", "root", "", "vms");
                    
                    // Check connection
                    if($mysqli === false){
                        die("ERROR: Could not connect. " . $mysqli->connect_error);
                    }
                    
                    // Attempt select query execution
                    $sql = "SELECT * FROM vms";
                    if($result = $mysqli->query($sql)){
                        if($result->num_rows > 0){
                            while($row = $result->fetch_array()){

                                // Get power status
                                $json = file_get_contents('http://127.0.0.1:5000/vm/' . $row["id"]); // this WILL do an http request for you
                                $data = json_decode($json);

                                echo '
                                <div class="vm-card card">
                                <div class="vm-card-body card-body">
                                    <div class="os-icon-div">
                                        <img src="../graphics/icons/windows.svg" height="100" width="70">
                                    </div>
                                    <div class="vm-info">
                                        <h1 class="vm-card-title">' . $row["name"] . '</h1>
                                        <div class="status-row row">
                                            <div class="col-6">
                                                <p class="ip">97.93.100.53</p>
                                            </div>
                                            <div class="col-6">';

                                            if ($data->{'power'} == "poweredOff") {
                                                echo '<p class="status" style="background-color: #ff6860">Offline</p>';
                                            }
                                            else if ($data->{'power'} == "poweredOn") {
                                                echo '<p class="status" style="background-color: #ABF5A8">Online</p>';
                                            }

                                            echo '
                                            </div>
                                        </div>
                                    </div>
                                    <div class="right-side">
                                        <div class="power">';
                                            if ($data->{'power'} == "poweredOff") {
                                                echo ' <a href="https://google.com" class="power-button" data-toggle="tooltip" data-placement="bottom" title="Power off">
                                                <i class="material-icons">power_settings_new</i>
                                                </a>
                                                <a href="https://google.com" class="reset-button" data-toggle="tooltip" data-placement="bottom" title="Reset">
                                                    <i class="material-icons">settings_backup_restore</i>
                                                </a>';
                                            }
                                            else if ($data->{'power'} == "poweredOn") {
                                                echo ' <a href="https://google.com" class="power-button" data-toggle="tooltip" data-placement="bottom" title="Power off">
                                                <i class="material-icons">power_settings_new</i>
                                                </a>
                                                <a href="https://google.com" class="restart-button" data-toggle="tooltip" data-placement="bottom" title="Restart">
                                                <i class="material-icons">autorenew</i>
                                                </a>
                                                <a href="https://google.com" class="reset-button" data-toggle="tooltip" data-placement="bottom" title="Reset">
                                                    <i class="material-icons">settings_backup_restore</i>
                                                </a>';
                                            }
                                            echo '
                                        </div>
                                    </div>
                                </div>
                            </div>';

                            }
                            // Free result set
                            $result->free();
                        } else{
                            echo "No records matching your query were found.";
                        }
                    } else{
                        echo "ERROR: Could not able to execute $sql. " . $mysqli->error;
                    }
                    
                    // Close connection
                    $mysqli->close();
                ?>
        </div>
    </div>

    <!-- JavaScript -->
    <script type="text/javascript" src="../js/jquery-3.2.1.slim.min.js"></script>
    <script type="text/javascript" src="../js/popper.min.js"></script>
    <script type="text/javascript" src="../js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../js/vmcontrol.js"></script>
    <script type="text/javascript">
        $(function () {
        $('[data-toggle="tooltip"]').tooltip()
        })
    </script>
</body>
</html>
