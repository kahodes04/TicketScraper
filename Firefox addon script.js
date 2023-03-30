var table = document.getElementById('ctl00_ContentMiddle_TicketList1_GridView1');
document.getElementById('ctl00_ContentMiddle_TicketList1_labeleventtablehead').scrollIntoView();
rows = table.getElementsByTagName('tr');
var seats = []
var buttons = []

if(rows.length > 1){
    for (i = 1, j = rows.length; i < j; i++) {
        var cells = rows[i].getElementsByTagName('td');

        var spans = cells[0].getElementsByTagName('span');

        buttons[i] = cells[0].getElementsByTagName('a')[0];
        console.log('button[i]: ' + buttons[i]);

        var seatnum = parseInt(spans[4].textContent.trim());
        console.log('seatnum: ' + seatnum);

        seats[i-1] = seatnum;
    }
}
var abort = false;
if (seats.length > 1) {
    console.log('in seats if statement');
    for (s = 0; s < seats.length; s++) {
        for (k = s + 1; k < seats.length; k++) {
            console.log('comparing: ' + seats[s] + '==' + (seats[k]+1) + '||' + seats[s] + '==' + (seats[k]-1))
            if (seats[s] == seats[k]+1 || seats[s] == seats[k]-1) {
                console.log("BUTTONS CLICKED (seats[s] = " + seats[s] + ' seats[k] = ' + seats[k])
                buttons[s].click();
                buttons[k].click();
                abort = true;
                break;
            }
        }
        if(abort){
            break;
        }
    }
}
