function pageLoad(sender, args) 
{
    var sm = Sys.WebForms.PageRequestManager.getInstance();
    if (!sm.get_isInAsyncPostBack()) 
    {
        sm.add_beginRequest(onBeginRequest);
        sm.add_endRequest(onRequestDone);
    }
}

function showPopUp() 
{
    $find('PleaseWaitPopup').show();
}

function hidePopUp() 
{
     $find('PleaseWaitPopup').hide();
}

function onBeginRequest(sender, args) 
{
    var send = args.get_postBackElement().value;
    if (displayWait(send) == "yes") 
    {
        showPopUp();
    } 
}

function onRequestDone() 
{
    hidePopUp();
}

function displayWait(send) 
{
    switch (send) {
        default:
            return ("yes");
            break;
    }            
}
