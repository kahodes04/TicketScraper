jQuery(document).ready(function ($) {

    document.getElementById('NavIconStep1').classList.remove("iconactive");
    document.getElementById('NavIconStep2').classList.remove("iconactive");
    document.getElementById('NavIconStep3').classList.remove("iconactive");
    document.getElementById('NavIconStep4').classList.remove("iconactive");
    document.getElementById('NavIconStep5').classList.remove("iconactive");
    document.getElementById('NavIconStep1').classList.add("iconinactive");
    document.getElementById('NavIconStep2').classList.add("iconinactive");
    document.getElementById('NavIconStep3').classList.add("iconinactive");
    document.getElementById('NavIconStep4').classList.add("iconinactive");
    document.getElementById('NavIconStep5').classList.add("icondisabled");
    var sitename = window.location.pathname.toLowerCase();
    if (sitename.includes('eventlist.aspx') || sitename.includes('inquirycartchoice')) {
        document.getElementById('NavIconStep1').classList.remove("iconinactive");
        document.getElementById('NavIconStep1').classList.add("iconactive");
    }
    else if (sitename.includes('selectticketmarkettickets.aspx') || sitename.includes('selectblock.aspx') || sitename.includes('selectseat.aspx')) {
        document.getElementById('NavIconStep2').classList.remove("iconinactive");
        document.getElementById('NavIconStep2').classList.add("iconactive");
    }
    else if (sitename.includes('showcart.aspx') || sitename.includes('editcart.aspx')) {
        document.getElementById('NavIconStep3').classList.remove("iconinactive");
        document.getElementById('NavIconStep3').classList.add("iconactive");
    }
    else if (sitename.includes('checkout.aspx') || sitename.includes('checkoutoverview.aspx')) {
        document.getElementById('NavIconStep4').classList.remove("iconinactive");
        document.getElementById('NavIconStep4').classList.add("iconactive");
    }
    else if (sitename.includes('checkoutresult.aspx')) {
        document.getElementById('NavIconStep5').classList.remove("icondisabled");
        document.getElementById('NavIconStep5').classList.add("iconactive");
    }
   
});

