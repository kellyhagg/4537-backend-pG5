// File made with the assistance of Chat-GPT
$(document).ready(function () {
    $.ajax({
        url: '/auth/user-api-calls',
        type: 'GET',
        success: function (usersWithApiCalls) {
            let tableRows = '';
            usersWithApiCalls.forEach(function (user) {
                tableRows += '<tr>';
                tableRows += '<td>' + user.firstName + '</td>';
                tableRows += '<td>' + user.email + '</td>';
                // Access the apiCallsCount from the user object
                tableRows += '<td>' + (user.apiCallsCount || 0) + '</td>'; // Fallback to 0 if undefined
                tableRows += '</tr>';
            });
            $('#usageTrackingTable tbody').html(tableRows);
        },
        error: function (error) {
            console.log('Error fetching user API calls:', error);
        }
    });
});
