This is a fork of the [Lemur Query Log Toolbar](http://www.lemurproject.org/querylogtoolbar/)

To install, click the "Downloads" button above, download `lemurlogtoolbar.xpi`, and then drag it into Firefox.

main modifications
------------------

* removes toolbar and user access to options other than viewing logs
* removes logging for actions except click and scroll.
* only records clicks on SERP links
* adds an "upvote" button in the url bar that users can click to indicate a page is relevant; this is added as a new action type in the log.

known issues
------------
* can’t work for new Google interface b/c ajax-y interface doesn’t load new pages.
* if users upvote a page that was located via search results, but it doesn’t have url that’s in the SERP, we can’t relate the two.