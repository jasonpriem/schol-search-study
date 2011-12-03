<?php

class SerpFactory {
    static function make(ActivityLogEvent $activityLogEvent) {
        $serp = new Serp();
        $serp->setUrl($activityLogEvent->getUrl());
        $serp->setQuery($activityLogEvent->getQuery());
        $serp->setSearchEngineName($activityLogEvent->getSearchEngingName());
        $serp->setTimestamp($activityLogEvent->getTimestamp());
        return $serp;
    }
}
?>
