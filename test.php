<?php  
    $command = escapeshellcmd('py isOnline.py "Windows Server 2016 Training"');
    $output = shell_exec($command);
    echo $output;
?>