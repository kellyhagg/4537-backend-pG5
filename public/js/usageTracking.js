// File made with the assistance of Chat-GPT
$(document).ready(function () {
    // AJAX call for usage-tracking
    $.ajax({
        url: 'https://chiseled-recondite-brisket.glitch.me/auth/user-api-calls',
        type: 'GET',
        success: function (usersWithApiCalls) {
            let tableRows = '';
            usersWithApiCalls.forEach(function (user) {
                tableRows += '<tr>';
                tableRows += '<td>' + user.firstName + '</td>';
                tableRows += '<td>' + user.email + '</td>';
                // Access the apiCallsCount from the user object
                tableRows += '<td>' + (user.apiCallsCount || 0) + '</td>'; // Fallback to 0 if undefined
                tableRows += '<td><button class="btn btn-primary" onclick="resetApiCallCount(\'' + user._id + '\')">Reset Count</button></td>';
                tableRows += '<td><button class="btn btn-danger" onclick="deleteUser(\'' + user._id + '\')">Delete</button></td>';
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
        url: 'https://chiseled-recondite-brisket.glitch.me/auth/api-stats', // Update with the correct path to your backend endpoint
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

function resetApiCallCount(userId) {
    $.ajax({
        url: 'https://chiseled-recondite-brisket.glitch.me/auth/reset-api-calls/' + userId,
        type: 'PUT',
        success: function (response) {
            // Reload the page after the reset
            location.reload();
        },
        error: function (error) {
            console.log('Error resetting API call count:', error);
        }
    });
}

function deleteUser(userId) {
    $.ajax({
        url: 'https://chiseled-recondite-brisket.glitch.me/auth/delete-user/' + userId,
        type: 'DELETE',
        success: function (response) {
            // Reload the page after the delete
            location.reload();
        },
        error: function (error) {
            console.log('Error deleting user:', error);
        }
    });
}
