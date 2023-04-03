var table = document.getElementById('ctl00_ContentMiddle_TicketList1_GridView1');
document.getElementById('ctl00_ContentMiddle_TicketList1_labeleventtablehead').scrollIntoView();
rows = table.getElementsByTagName('tr');

if (rows.length > 1) {
    for (i = 1, j = rows.length; i < j; i++) {
        var cells = rows[i].getElementsByTagName('td');

        var spans = cells[0].getElementsByTagName('span');

        var seatnum = parseInt(spans[4].textContent.trim());
        console.log('seatnum: ' + seatnum);

        console.log('row: ' + spans[2].textContent.trim())
        console.log('block: ' + spans[0].textContent.trim())

        var block = spans[0].textContent.trim();

        if (block == 104 || block == 105 || block == 103) {
            cells[0].getElementsByTagName('a')[0].click();

        }

        // if (block == 104 || block == 105 || block == 103) {
        //     if (row == 2) {
        //         if (seatnum > 20 && seatnum < 35) {
        //             cells[0].getElementsByTagName('a')[0].click();
        //         }
        //     }
        // }
    }
}