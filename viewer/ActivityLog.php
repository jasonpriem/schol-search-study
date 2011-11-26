<?php
class ActivityLog extends Log {

    public function getPageClicks(){
        $pageClicks = array();
        $lines = parent::getLinesArray();
        foreach ($lines as $k => $line) {
            $fields = explode("\t", $line);
            if ($fields[0] == "Show") {
                $myUrl = $fields[3];
                if (!isset($pageClicks[$myUrl])){
                    $pageClicks[$myUrl] = array();
                } 
            }
        }
        
        return $pageClicks;
    }

}
?>
