$(document).ready(function () {
    $.ajax({
        url: '/auth/users',
        type: 'GET',
        success: function (users) {
            // Start with an empty string for the table rows
            var tableRows = '';

            // Loop through each user to build table rows
            users.forEach(function (user) {
                tableRows += '<tr>';
                tableRows += '<td>' + user.firstName + '</td>';
                tableRows += '<td>' + user.email + '</td>';
                tableRows += '<td>' + user.apiCallsCount + '</td>';
                tableRows += '</tr>';
            });

            console.log
            // Append the rows to the table body
            $('#usageTrackingTable tbody').html(tableRows);
        },
        error: function (error) {
            console.log('Error fetching users:', error);
        }
    });
});

