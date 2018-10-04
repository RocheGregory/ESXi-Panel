<!DOCTYPE html>
<html>
<head>
    <!-- CSS -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/vm.css">
</head>
<body>
    <?php
        $mysqli = new mysqli("localhost", "root", "", "vms");
        if($mysqli === false){
            die("ERROR: Could not connect. " . $mysqli->connect_error);
        }

        /* Set VM variable */
        $vm = $_GET['vm'];
        $sql = "SELECT * FROM vms";
    ?>

    <div class="container-fluid">
        <div class="sidenav">
            <a><i class="nav-icon material-icons">home</i></a>
        </div>


        <div class="row">
            <div class="left-side">
                <?php
                    echo '<h1 class="title">' . $vm . '</h1>';
                ?>
                <div class="status-row row">
                    <div class="col-6">
                        <p class="ip">97.93.100.53</p>
                    </div>
                    <div class="col-6">
                        <p class="status" style="background-color: #ff6860">Offline</p>
                        <!--<p class="status" style="background-color: #ABF5A8">Online</p>-->
                    </div>
                </div>
            </div>
            
            <div class="right-side">
                <div class="power">
                    <!--    <a href="https://google.com" class="power-button" data-toggle="tooltip" data-placement="bottom" title="Power on">
                                <i class="material-icons">power_settings_new</i>
                            </a> -->
                    <a href="https://google.com" class="power-button" data-toggle="tooltip" data-placement="bottom" title="Power off">
                        <i class="material-icons">power_settings_new</i>
                    </a>
                    <a href="https://google.com" class="restart-button" data-toggle="tooltip" data-placement="bottom" title="Restart">
                        <i class="material-icons">autorenew</i>
                    </a>
                    <a href="https://google.com" class="reset-button" data-toggle="tooltip" data-placement="bottom" title="Reset">
                        <i class="material-icons">settings_backup_restore</i>
                    </a>
                </div>
            </div>
        </div>
        
        <div class="cards-row row">
            <div class="remote-card card">
                <div class="remote-card-body card-body">
                    <h1 class="remote-card-title"><i class="material-icons">airplay</i> Remote Control</h1>
                    <button type="button" onclick="openRemoteDesktop()" class="remote-card-button btn btn-warning">Connect</button>
                    <p class="remote-status" id="remote-status">Requires VMWare Remote Console.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script type="text/javascript" src="js/jquery-3.2.1.slim.min.js"></script>
    <script type="text/javascript" src="js/popper.min.js"></script>
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/vmcontrol.js"></script>
    <script type="text/javascript">
        $(function () {
        $('[data-toggle="tooltip"]').tooltip()
        })
    </script>
    <script>
        function openRemoteDesktop() {
            document.getElementById("remote-status").innerHTML = "Opening VMWare Remote Console.";
            window.open("vmrc://root@192.168.182.132/?moid=1","_self");
        }
    </script>
</body>
</html>
