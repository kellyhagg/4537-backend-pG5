// File made with the assistance of Chat-GPT
$(document).ready(function () {
    // AJAX call for usage-tracking
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

    // AJAX call for method-tracking
    $.ajax({
        url: '/auth/api-stats', // Update with the correct path to your backend endpoint
        type: 'GET',
        success: function (apiStats) {
            let tableRows = '';
            apiStats.forEach(function (stat) {
                tableRows += '<tr>';
                tableRows += '<td>' + stat.method + '</td>';
                tableRows += '<td>' + stat.endpoint + '</td>';
                tableRows += '<td>' + stat.requestCount + '</td>';
                tableRows += '</tr>';
            });
            $('#methodTrackingTable tbody').html(tableRows);
        },
        error: function (error) {
            console.log('Error fetching API stats:', error);
        }
    });
});
