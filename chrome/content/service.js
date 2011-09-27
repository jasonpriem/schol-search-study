// Learned from Firefox extension "Pickup Photo Uploader" and "Imagebot"

/* Constructor
 */
function lemurlog_uploadService()
{

  // Private attributes
  this.cur_file = null;
  this.timestamp = null;
  this.cgi_url = null;
  this._request = null;
  this._finish = false;
  this._userId = "";

  // Public methods
  this.upload = function ()
  {
  
    var button = document.getElementById("LogTB-Clear-Button");
    button.disabled = true;
    button = document.getElementById("LogTB-View-Button");
    button.disabled = true;
    button = document.getElementById("LogTB-Upload-Button");
    button.disabled = true;

    //avoid read/write confliction
    lemurlog_CreateLogFile(lemurlog_LOCK_FILE);

    //get file
    var file = lemurlog_GetLogFile(this.cur_file);

    //set args
    var args= new Object();
    

    args.user_id = this._userId;
    args.timestamp = this.timestamp;
    args.rel_filename = this.cur_file;
    args.file_size = file.fileSize;
    if (this.cur_file== lemurlog_PAGE_FILE) {
      args.ispagefile=true;
    }

    //upload
    this._do_upload_request(this.cgi_url, file, args);
  };

  this.cancelUpload = function()
  {
    if (this._request!=null) {
      this._request.abort();
    }
    //resume logging
    lemurlog_RemoveLogFile(lemurlog_LOCK_FILE);
    //set buttons
    var button = document.getElementById("LogTB-Clear-Button");
    button.disabled = false;
    button = document.getElementById("LogTB-View-Button");
    button.disabled = false;
    button = document.getElementById("LogTB-Upload-Button");
    button.disabled = false;
  }

  // private methods
  this._do_upload_request = function (aCGI_URL, aFile, aArgs)
  {
    const MULTI="@mozilla.org/io/multiplex-input-stream;1";
    const FINPUT = "@mozilla.org/network/file-input-stream;1";
    const STRINGIS="@mozilla.org/io/string-input-stream;1";
    const BUFFERED="@mozilla.org/network/buffered-input-stream;1";

    const nsIMultiplexInputStream=Components.interfaces.nsIMultiplexInputStream;
    const nsIFileInputStream=Components.interfaces.nsIFileInputStream;
    const nsIStringInputStream=Components.interfaces.nsIStringInputStream;
    const nsIBufferedInputStream = Components.interfaces.nsIBufferedInputStream;

    // a random string as http delimiter
    var boundary="---------------------------" + (Math.floor(Math.random() * 1000000000000)); 

    //args stream
    var argStr="";

    for (var i in aArgs)
    {
      argStr += "\r\n"+"--"+boundary+"\r\n";
      argStr += "Content-Disposition: form-data; name=\"" + i + "\"\r\n";
      argStr += "\r\n";
      argStr += aArgs[i];
    }

    var argsis=Components.classes[STRINGIS].createInstance(nsIStringInputStream);
    argsis.setData(argStr, -1);

    //pre file stream
    var hsis=Components.classes[STRINGIS].createInstance(nsIStringInputStream);
    var sheader="\r\n--"+boundary+"\r\n";
    sheader+="Content-Disposition: form-data; name=\"filename\"; filename=\""+aFile.leafName+"\"\r\n";
    sheader+="Content-Type: application/octet-stream\r\n\r\n";
    hsis.setData(sheader, -1);

    //file stream
    var fin=Components.classes[FINPUT].createInstance(nsIFileInputStream);
    fin.init(aFile, 0x01, 0444, Components.interfaces.nsIFileInputStream.CLOSE_ON_EOF); 
    var buf=Components.classes[BUFFERED].createInstance(nsIBufferedInputStream);
    buf.init(fin,4096);

    //end stream
    var endsis=Components.classes[STRINGIS].createInstance(nsIStringInputStream);
    var bs="\r\n--"+boundary+"--\r\n";
    endsis.setData(bs, -1);

    //combined stream
    var mis=Components.classes[MULTI].createInstance(nsIMultiplexInputStream);

    mis.appendStream(argsis);
    mis.appendStream(hsis);
    mis.appendStream(buf);
    mis.appendStream(endsis);
    var service = this;
    service._request = new XMLHttpRequest();
    service._request.service = service;
    //event handlers
    service._request.onload = { handleEvent: service._requestOnLoad };
    service._request.onprogress = { handleEvent: service._requestOnProgress };
    service._request.onreadystatechange = { handleEvent: service._requestOnReadyStateChange };
    service._request.onerror = { handleEvent: service._requestOnError };
    service._request.checkProgress = service._checkProgress;
    //open and send
    service._request.open("POST", aCGI_URL, true);//asynchronous
    service._request.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);//do not set Content-Length
    service._request.send(mis);
  };


  this._requestOnLoad = function(event)
  {

    var request = event.target;
    var service = request.service;
    //check if succeed
    var end_str = request.responseText;
    var upload_succeed;
    if(end_str === lemurlog_UPLOAD_SUCCEED_STR && request.status === 200)
    {
      upload_succeed = true;
    }
    else
    {
      upload_succeed = false;
      if (request.status === 200) {
        alert("Error received while uploading:\n" + request.responseText);
      }
    }
    this._request = null;

    //start uploading the next file
    if(service.cur_file === lemurlog_LOG_FILE)
    {
      if(upload_succeed === true)
      {
        service._setInterUI("LogTB-Up-Desc1");
        service.cur_file = lemurlog_PAGE_FILE;
        service.upload();
      }
      else
      {
        service._onError();
      }
    }
    else if(service.cur_file === lemurlog_PAGE_FILE)
    {
      if(upload_succeed === true)
      {
        service._setInterUI("LogTB-Up-Desc2");
        service._onSuccess();
      }
      else
      {
        service._onError();
      }
    }
    else
    {
      service._onError();
    }
  };

  this._requestOnProgress = function(event)
  {
    //the ratio is about input stream
    /*    var ratio = 100;
        if(event.totalSize > 0)
        {
        ratio = Math.floor(event.position * 100 / event.totalSize);
        }
        if(ratio > 100)
        {
        ratio = 100;
        }
    // Set the meter
    var meter = window.lemurlog_UploadWin.document.getElementById("LogTB-Meter");
    meter.value=ratio;
     */
  };

  this._requestOnReadyStateChange = function(event)
  {
  };

  this._requestOnError = function(event)
  {
    var service = event.target.service;
    service._onError();
  };

  this._onSuccess = function()
  {
    this._request = null;
    //remove uploaded log files
    lemurlog_RemoveLogFile(lemurlog_LOG_FILE);
    lemurlog_RemoveLogFile(lemurlog_PAGE_FILE);
    //resume logging
    lemurlog_RemoveLogFile(lemurlog_LOCK_FILE);
    //change UI status
    this._setFinalUI("Uploaded successfully!");
    
    // reset the next auto-upload time
    var autoIntervalTime=lemurlogtoolbar_LemurLogToolbarConfiguration._autoUploadIntervalTime;
    var currentDate = new Date; // Generic JS date object
    var unixtime_ms = currentDate.getTime(); // Returns milliseconds since the epoch
    
    lemurlogtoolbar_LemurLogToolbarConfiguration._nextTimeToAutoUpload=unixtime_ms+autoIntervalTime;
    lemurlogtoolbar_LemurLogToolbarConfiguration.saveLocalUserConfiguration();
    lemurlogtoolbar_LemurLogToolbarConfiguration._isCurrentlyUploading=false;
  };

  this._onError = function()
  {
    //resume logging
    lemurlog_RemoveLogFile(lemurlog_LOCK_FILE);
    //change UI status
    this._setFinalUI("Cannot upload right now, please try later.");
    lemurlogtoolbar_LemurLogToolbarConfiguration._isCurrentlyUploading=false;
  };

  this._setFinalUI = function(text)
  {
    var button = document.getElementById("LogTB-Clear-Button");
    button.disabled = false;
    button = document.getElementById("LogTB-View-Button");
    button.disabled = false;
    button = document.getElementById("LogTB-Upload-Button");
    button.disabled = false;


    var doc = window.lemurlog_UploadWin.document;
    var item;
    item =doc.getElementById("LogTB-Meter");
    item.collapsed=true;

    var item = doc.getElementById("LogTB-Up-Result");
    item.setAttribute("value", text);

    item = doc.documentElement.getButton("accept");
    item.collapsed = false;
    item = doc.documentElement.getButton("cancel");
    item.collapsed = true;
    window.lemurlog_UploadWin.focus();
  };

  this._setInterUI = function(id)
  {
    var doc = window.lemurlog_UploadWin.document;
    var item = doc.getElementById(id);
    var value = item.getAttribute("value");
    item.setAttribute("value", value+" - done")
  };
}
