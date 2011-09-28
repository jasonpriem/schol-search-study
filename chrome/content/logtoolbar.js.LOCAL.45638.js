//global variables
var lemurlog_g_enable = true;
var lemurlog_g_recordable = false;

var lemurlog_scrollTop = 0;
var lemurlog_scrollDir = 0;
var lemurlog_prev_scroll_time = 0;
var lemurlog_scrollTimeoutID = null;
var lemurlog_scrollLock = false;

var lemurlog_prev_blur_time = 0;
var lemurlog_prev_show_time = 0;
var lemurlog_prev_hide_time = 0;
var lemurlog_prev_ctrlc_time = 0;

var lemurlog_prev_focus_url = null;
var lemurlog_prev_load_url = null;

var lemurlog_ctrlc_down = false;

var lemurlog_search_urls = new Array();

var lemurlog_upload_service = null;

// support for private browsing
var lemurlogtoolbar_inPrivateBrowseMode=false;
var lemurlogtoolbar_isLoggingInPrivate=true;

///////////////////////////////////////////////////////////////////////
// Handler for writing to the log - checking for auto uploads
///////////////////////////////////////////////////////////////////////
function lemurlog_DoWriteLogFile(fileName, text) {
  lemurlog_WriteLogFile(fileName, text);
  lemurlog_checkAutoUpload();
}

function lemurlog_checkAutoUpload() {
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._isCurrentlyUploading) { return; }
  
  lemurlogtoolbar_LemurLogToolbarConfiguration._isCurrentlyUploading=true;
  
  // see if we are using auto uploads in the configuration
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL!="" && lemurlogtoolbar_LemurLogToolbarConfiguration._serverAllowAutoUploads && lemurlogtoolbar_LemurLogToolbarConfiguration._useAutomaticUploads) {
  
    // get the current unix time
    var currentDate = new Date; // Generic JS date object
    var unixtime_ms = currentDate.getTime(); // Returns milliseconds since the epoch
    
    // see if it's time for an upload
    if (lemurlogtoolbar_LemurLogToolbarConfiguration._nextTimeToAutoUpload < unixtime_ms) {
      // it's time!
      // do we need to ask the user first?
      if (lemurlogtoolbar_LemurLogToolbarConfiguration._askWhenUsingAutoUploads) {
      
        // yes - check and see
        var currentTime=new Date;
        var currentTimeMs=currentTime.getTime();
        var nextTimeToAutoUpload=currentTimeMs + lemurlogtoolbar_LemurLogToolbarConfiguration._autoUploadIntervalTime;
        
        var nextUploadTimeSec=new Date(nextTimeToAutoUpload);
        var nextUploadTimeStr=nextUploadTimeSec.toString();
        
        var userConfirm=window.confirm(
          "An automatic upload of toolbar data is scheduled to run now.\n" + 
          "(If you cancel, the next upload is scheduled for: " + nextUploadTimeStr + "\nProceed?"
        );

        if (userConfirm) {
          lemurlog_DoActualUpload_Log();
        } else {
          // user clicked cancel
          lemurlogtoolbar_LemurLogToolbarConfiguration.setNextAutomaticUploadTime();
          lemurlogtoolbar_LemurLogToolbarConfiguration.saveLocalUserConfiguration();
          lemurlogtoolbar_LemurLogToolbarConfiguration._isCurrentlyUploading=false;
          return;
        }
      } else {
        // no - don't need user input to auto-upload
        lemurlog_DoActualUpload_Log();
      }
    }
  } else {
    lemurlogtoolbar_LemurLogToolbarConfiguration._isCurrentlyUploading=false;
  }
}

///////////////////////////////////////////////////////////////////////
// performs the upload of log files to remote server w/out prompt
///////////////////////////////////////////////////////////////////////
function lemurlog_DoActualUpload_Log()
{
  // before uploading - scrub the log files
  // remember to remove any search results that match
  // a query where any query term is blacklisted...
  
  lemurlog_upload_service = new lemurlog_uploadService();
  window.openDialog("chrome://lemurlogtoolbar/content/upload.xul", "LogTB-Upload", "chrome=yes,modal=no,centerscreen=yes,status=no,height=400,width=600", window);
}


///////////////////////////////////////////////////////////////////////
// Upload log files to remote server
///////////////////////////////////////////////////////////////////////
function lemurlog_Upload_Log(event)
{
  var result = confirm("Would you like to upload log files?");
  if(!result)
  {
    return;
  }
  
  lemurlog_DoActualUpload_Log();
}

function lemurlog_showsettings(event) {
  window.openDialog('chrome://lemurlogtoolbar/content/settings.xul', 'Log Toolbar Settings', 'chrome=yes,modal=yes,status=no', lemurlogtoolbar_LemurLogToolbarConfiguration);
}


///////////////////////////////////////////////////////////////////////
// display help page
///////////////////////////////////////////////////////////////////////
function lemurlog_Help(event)
{
  lemurlog_LoadURL("http://www.lemurproject.org/querylogtoolbar/docs/client/");
}

///////////////////////////////////////////////////////////////////////
// upvote handler
// added by Jason Priem, 27 Sept. 2011
///////////////////////////////////////////////////////////////////////
function lemurlog_Upvote(event) {
    var button = document.getElementById("LogTB-Upvote-Button");
    button.className = "clicked";
    button.label = "Saved.";
    
    // log the event in the log file.
    lemurlog_DoWriteLogFile(lemurlog_LOG_FILE, "upvote\t" + new Date().getTime());
    
    setTimeout("b=document.getElementById('LogTB-Upvote-Button');\nb.className='';\nb.label=''", 750)
}

///////////////////////////////////////////////////////////////////////
// 'keyup' event handler
///////////////////////////////////////////////////////////////////////
function lemurlog_OnKeyUp(event)
{

  if(!lemurlog_g_enable || !lemurlog_g_recordable || event.keyCode !== 67 || !lemurlog_ctrlc_down)
  {
    return;
  }
  var time = new Date().getTime();
  if(time - lemurlog_prev_ctrlc_time > 1000)
  {
    return;
  }
  lemurlog_ctrlc_down = false;//reset

  //The clipboard is (usually) ready when 'keyup', it's not ready when 'keydown' or 'keypress'

  var clipboard = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
  if (!clipboard) 
  {
    return;
  } 
  var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable); 
  if (!trans) 
  {
    return;
  }
  trans.addDataFlavor("text/unicode"); 
  clipboard.getData(trans, clipboard.kGlobalClipboard); 
  var str = new Object(); 
  var strLength = new Object(); 
  trans.getTransferData("text/unicode", str,strLength); 
  if (str)
  {
    str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
  }
  var text="";
  if (str) 
  {
    // text = str.data.substring(0,strLength.value / 2); 
    text = str.data.substring(0); 
  }
  //remove repeated spaces
  text = lemurlogtoolbar_washAndRinse(lemurlog_TrimString(text));

  lemurlog_DoWriteLogFile(lemurlog_LOG_FILE, "CtrlC\t" + time +"\t"+ text.length +"\t" + text +"\n");
} 



///////////////////////////////////////////////////////////////////////
// 'keydown' event handler
// event.keyCode for keydown and keyup (case insensitive)
// event.charCode for keypress (case sensitive)
// event.which for all
// keyCode of C = 67, charCode of C = 67, charCode of c = 99
///////////////////////////////////////////////////////////////////////
function lemurlog_OnKeyDown(event)
{

  if(!lemurlog_g_enable || !lemurlog_g_recordable)
  {
    return;
  }
  if(!event.ctrlKey || event.keyCode !== 67)
  {
    return;
  }
  var time = new Date().getTime();
  if(time - lemurlog_prev_ctrlc_time < lemurlog_MIN_INTERVAL)
  {
    lemurlog_prev_ctrlc_time = time;
    return;
  }
  lemurlog_prev_ctrlc_time = time;
  lemurlog_ctrlc_down = true;
}

///////////////////////////////////////////////////////////////////////
// 'mousedown' event handler
// record mousedown(left/middle/right) on a hyperlink
///////////////////////////////////////////////////////////////////////
function lemurlog_OnMouseDown(event)
{

  if(lemurlog_g_enable === false)
  {
    return;
  }
  var url = this.href;
  if(!lemurlog_IsRecordableURL(url))
  {
    return;
  }
  var time = new Date().getTime();
  url = lemurlogtoolbar_washAndRinse(lemurlog_TrimString(url));

  while (Application.storage.get("lemurlog_clickLock", false))
  {
	//sleep(1);
    setTimeout( "lemurlog_OnMouseDown(event)", 1000 );
    return;
  }
  Application.storage.set("lemurlog_clickLock", true);
  
  var clickInfos = JSON.parse(Application.storage.get("lemurlog_clickInfo", JSON.stringify(new Array())));
  
  var lemurlogtoolbar_clickInfo = {};
  lemurlogtoolbar_clickInfo["url"] = url;
  var id = gBrowser.selectedTab.linkedBrowser.parentNode.id;
  lemurlogtoolbar_clickInfo["srcID"] = id;
  var lemurlogtoolbar_srcURL = window.content.location.href;
  lemurlogtoolbar_clickInfo["lemurlogtoolbar_srcURL"] = lemurlogtoolbar_srcURL;
  
  switch(event.button)
  {
    case 0:
      lemurlog_DoWriteLogFile(lemurlog_LOG_FILE, "LClick\t" + time +"\t"+ url +"\n");
	  lemurlogtoolbar_clickInfo["time"] = time;
	  clickInfos.push(lemurlogtoolbar_clickInfo);
      break;
    case 1:
      lemurlog_DoWriteLogFile(lemurlog_LOG_FILE, "MClick\t" + time +"\t"+ url +"\n");
	  lemurlogtoolbar_clickInfo["time"] = time;
	  clickInfos.push(lemurlogtoolbar_clickInfo);	  
      break;
    case 2:
      lemurlog_DoWriteLogFile(lemurlog_LOG_FILE, "RClick\t" + time +"\t"+ url +"\n");
	  lemurlogtoolbar_clickInfo["time"] = time;
	  clickInfos.push(lemurlogtoolbar_clickInfo);	  
      break;
    default:
  }
  
  Application.storage.set("lemurlog_clickInfo", JSON.stringify(clickInfos));
  Application.storage.set("lemurlog_clickLock", false);
}

///////////////////////////////////////////////////////////////////////
// 'scroll' event handler
///////////////////////////////////////////////////////////////////////
function lemurlog_OnScroll(event)
{
    if(lemurlog_g_enable === false || lemurlog_g_recordable === false)
        {
            return;
        }

    var time = new Date().getTime();

    // Lock the scroll.
    while( lemurlog_scrollLock )
        {
            sleep(1);
        }

    lemurlog_scrollLock = true;


    var scrollTop = window.content.document.documentElement.scrollTop;
	var id = gBrowser.selectedBrowser.parentNode.id;
    var recordNewScroll		 = true;

    var curDirection = scrollTop - lemurlog_scrollTop;

    // Could this scroll event be part of a larger srcoll action?
    if( ( time - lemurlog_prev_scroll_time) < lemurlog_MIN_INTERVAL	 )
        {
            // Regardless of the direction of the scroll, remove the
            // timeout to record the previous scroll event.
            clearTimeout( lemurlog_scrollTimeoutID );


            // Did the user switch direction?
            if( ( curDirection < 0 && lemurlog_scrollDir >	 0 ) ||
                ( curDirection > 0 && lemurlog_scrollDir <	 0 ) )												 
                {

                    // Record the end of the previous scroll action.
                    lemurlog_WriteLogFile(lemurlog_LOG_FILE, "ScrollEnd\t" + time +
                                          "\t" + scrollTop + "\n");

                }
            // Is the user still in a uni-directional scroll?
            else
                {
                    // Add a new timer to log this asthe end of scroll event if another 
                    // scroll event fails to come in.
                    lemurlog_prev_scroll_time =time;
                    lemurlog_scrollTop = scrollTop;
                    lemurlog_scrollTimeoutID = setTimeout("lemurlog_recordScroll()",
                                                          lemurlog_MIN_INTERVAL-1 );

                    // Make sure that we don't log a new scroll event below.
                    recordNewScroll = false;

                    // Update the direction of the scroll.
                    lemurlog_scrollDir = curDirection;
                }
        }

    // Is this the start of a new scroll?
    if( recordNewScroll )
        {
            // Record a new scroll event and add a timer to log this as
            // the end of scroll event if another scroll event fails to come in.
            lemurlog_WriteLogFile(lemurlog_LOG_FILE, "ScrollBegin\t" + time + "\t" +
                                  id + "\t" + scrollTop + "\n");

            lemurlog_prev_scroll_time = time;
            lemurlog_scrollTop = scrollTop;
            lemurlog_scrollTimeoutID = setTimeout("lemurlog_recordScroll()",
                                                  lemurlog_MIN_INTERVAL-1 );



            lemurlog_scrollDir = 0;
        }


    lemurlog_scrollLock = false;
}


function lemurlog_recordScroll(pageHeight, scrollCount)
{
    while( lemurlog_scrollLock )
        {
            sleep(1);
        }

    lemurlog_scrollLock = true;
    lemurlog_WriteLogFile(lemurlog_LOG_FILE, "ScrollEnd\t" +
                          lemurlog_prev_scroll_time	 + "\t" +
                          lemurlog_scrollTop + "\n");
    lemurlog_scrollLock = false;

}

///////////////////////////////////////////////////////////////////////
// Turn on/off logging by switching the value of lemurlog_g_enable 
///////////////////////////////////////////////////////////////////////
function lemurlog_Switch(event, mode)
{
  // don't allow switch if we're in private browse mode!
  if (!lemurlogtoolbar_inPrivateBrowseMode) {
    var time = new Date().getTime();
    
    lemurlog_g_enable = mode;
    if(mode === true)
    {
      lemurlog_DoWriteLogFile(lemurlog_LOG_FILE, "StartLogging\t" + time + "\n");
    }
    else
    {
      lemurlog_DoWriteLogFile(lemurlog_LOG_FILE, "PauseLogging\t" + time + "\n");
    }
    lemurlog_SetButtons();
  }
}



///////////////////////////////////////////////////////////////////////
// View the log file with the browser
///////////////////////////////////////////////////////////////////////
function lemurlog_View_Log(event, log_id)
{
  var file;
  if(log_id == 0)
  {
    file = lemurlog_GetLogFile(lemurlog_LOG_FILE);
  }
  else if(log_id == 1)
  {
    file = lemurlog_GetLogFile(lemurlog_PAGE_FILE);
  }
  if(!file.exists())
  {
    file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE , 0644);
  }
  lemurlog_LoadURL("file:///" + file.path);
}

///////////////////////////////////////////////////////////////////////
// Remove all log files
///////////////////////////////////////////////////////////////////////
function lemurlog_Clear_Log(event)
{
  var result = confirm("Clear all log files?");
  if(!result)
  {
    return;
  }
  lemurlog_RemoveLogFile(lemurlog_LOG_FILE);
  lemurlog_RemoveLogFile(lemurlog_PAGE_FILE);
  // clear the search URLs
  lemurlog_search_urls=[];
}


// add support for private browsing - do not allow logging!

var lemurlogtoolbar_privateBrowserListener = new lemurlogtoolbar_PrivateBrowsingListener();  
lemurlogtoolbar_privateBrowserListener.watcher = {  
  onEnterPrivateBrowsing : function() {  
    // we have just entered private browsing mode!
    lemurlogtoolbar_isLoggingInPrivate=lemurlog_g_enable;
    lemurlog_Switch(null, false);
    
    // disable any buttons
    var button = document.getElementById("LogTB-Pause-Button");
    if (button) { button.disabled = true; }
    button = document.getElementById("LogTB-Pause-Button-Gray");
    if (button) { button.disabled = true; }
    button = document.getElementById("LogTB-Start-Button");
    if (button) { button.disabled = true; }
    button = document.getElementById("LogTB-Start-Button-Gray");
    if (button) { button.disabled = true; }
    
    lemurlogtoolbar_inPrivateBrowseMode=true;
  },  
   
  onExitPrivateBrowsing : function() {  
    // we have just left private browsing mode!  
    lemurlogtoolbar_inPrivateBrowseMode=false;
    lemurlog_Switch(null, lemurlogtoolbar_isLoggingInPrivate);
  }  
};


// see if we started in private browse mode

function lemurlogtoolbar_CheckForPrivateBrowsing() {
    try {
      var pbs = Components.classes["@mozilla.org/privatebrowsing;1"].getService(Components.interfaces.nsIPrivateBrowsingService);
      var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  
    
      if (inPrivateBrowsingMode) {  
        // we are in private browsing mode!
        lemurlogtoolbar_isLoggingInPrivate=lemurlog_g_enable;
        lemurlog_Switch(null, false);
        
        // disable any buttons
        var button = document.getElementById("LogTB-Pause-Button");
        if (button) { button.disabled = true; }
        button = document.getElementById("LogTB-Pause-Button-Gray");
        if (button) { button.disabled = true; }
        button = document.getElementById("LogTB-Start-Button");
        if (button) { button.disabled = true; }
        button = document.getElementById("LogTB-Start-Button-Gray");
        if (button) { button.disabled = true; }
        
        lemurlogtoolbar_inPrivateBrowseMode=true;
      }  
    } catch (ex) {
     // ignore exception for older versions
     alert("Exception (Private Browse): " + ex.description);
    }
}

lemurlogtoolbar_CheckForPrivateBrowsing();

//add listeners
// window.addEventListener('load', lemurlog_OnLoad_Cap, true);//if false, sometimes isn't triggerred
document.addEventListener('load', lemurlog_OnLoad_Cap, true);//if false, will fire just for the document - no frames
window.addEventListener('load', lemurlog_OnLoad_Bub, false);//if true, gBrowser is not ready yet

window.addEventListener('pageshow', lemurlog_OnShow, false);
window.addEventListener('pagehide', lemurlog_OnHide, false);

window.addEventListener('focus', lemurlog_OnFocus, true);//not bubbling
window.addEventListener('blur', lemurlog_OnBlur, true);//not bubbling

window.addEventListener('scroll', lemurlog_OnScroll, false);

window.addEventListener('keydown', lemurlog_OnKeyDown, false);
window.addEventListener('keyup', lemurlog_OnKeyUp, false);

// add tab listener
const lemurlog_appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
const lemurlog_versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
lemurlog_WriteLogFile(lemurlog_LOG_FILE, "FirefoxVersion\t" + lemurlog_appInfo.version + "\n");

var lemurlogtoolbar_curtime = new Date().getTime();
var lemurlog_tabId = gBrowser.selectedTab.linkedBrowser.parentNode.id;

// In the event that his window was generated by a click (i.e., "open
// in new window"), this tracks the click.
// Get the URL that was clicked to make this happen (assums all
// MClicks and tabAdded events occur in the same order).
function lemurlogtoolbar_waitForClickLockToRelease( count ) {

    // If this function has been called more than 10 times in a row,
    // assume the lock is bad.
    if( count > 10 ){
        return;
    }

    if( Application.storage.get("lemurlog_clickLock", false) ) {
        //sleep(1);
        count++;
        setTimeout( "lemurlogtoolbar_waitForClickLockToRelease("+count+")", 1000 );
    }
    return;
}

lemurlogtoolbar_waitForClickLockToRelease(0);

Application.storage.set("lemurlog_clickLock", true) ;

var lemurlogtoolbar_clickInfo = JSON.parse(
    Application.storage.get("lemurlog_clickInfo",
        JSON.stringify( new Array()) ));

var lemurlogtoolbar_srcURL = "undefined"
if( lemurlogtoolbar_clickInfo.length > 0 )
{
    while( lemurlogtoolbar_clickInfo.length > 1 &&
           //time - lemurlogtoolbar_clickInfo[0]["time"] > 100 ) //lemurlog_MIN_INTERVAL )
           lemurlogtoolbar_curtime - lemurlogtoolbar_clickInfo[0]["time"] > 100 ) //lemurlog_MIN_INTERVAL )
    {
        lemurlogtoolbar_clickInfo.splice(0,1);
    }
    lemurlogtoolbar_srcURL = lemurlogtoolbar_clickInfo[0]["url"];
    lemurlogtoolbar_clickInfo.splice(0,1);
}
else
{
    lemurlogtoolbar_srcURL = "undefined";
}

Application.storage.set("lemurlog_clickInfo",
    JSON.stringify(lemurlogtoolbar_clickInfo));

Application.storage.set("lemurlog_clickLock", false);

lemurlog_WriteLogFile(lemurlog_LOG_FILE, "NewWindow\t" + lemurlogtoolbar_curtime + 
    "\t" + lemurlog_tabId + "\t" + lemurlogtoolbar_srcURL + "\n");

window.setTimeout("lemurlog_AddTabEventListener();", 5000);

function lemurlog_AddTabEventListener()
{
  var lemurlog_tabContainer = null;
  if(lemurlog_versionChecker.compare(lemurlog_appInfo.version, "1.5") >= 0 && lemurlog_versionChecker.compare(lemurlog_appInfo.version, "2.0") < 0 ) {
    //initialize for tab listeners
    lemurlog_tabContainer = gBrowser.mPanelContainer;
    lemurlog_tabContainer.addEventListener("DOMNodeInserted", lemurlog_OnTabAdded_15, false);
    lemurlog_tabContainer.addEventListener("DOMNodeRemoved", lemurlog_OnTabRemoved_15, false);
    lemurlog_tabContainer.addEventListener("select", lemurlog_OnTabSelected_15, false);
  }
  else if(lemurlog_versionChecker.compare(lemurlog_appInfo.version, "2.0") >= 0)
  {
    lemurlog_tabContainer = gBrowser.tabContainer;
    lemurlog_tabContainer.addEventListener("TabOpen", lemurlog_OnTabAdded_20, false);
    lemurlog_tabContainer.addEventListener("TabClose", lemurlog_OnTabRemoved_20, false);
    lemurlog_tabContainer.addEventListener("TabSelect", lemurlog_OnTabSelected_20, false);
  }
}


///////////////////////////////////////////////////////////
// Supported log records:
///////////////////////////////////////////////////////////
// LoadCap
// LoadBub

// Show
// Hide

// Focus
// Blur

// AddTab
// SelTab
// RmTab

// LClick: left click 
// MClick: wheel click
// RClick: right click

// Scroll
// Ctrol-C

// Search
// 
