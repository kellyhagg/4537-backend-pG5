// File made with the assistance of Chat-GPT
function checkApiCallLimit() {
    $.ajax({
        url: '/auth/free-calls',
        type: 'GET',
        success: function (response) {
            let userFreeCalls = 20 - response.apiCallsCount;
            $('#userFreeCalls').text(userFreeCalls);
            if (userFreeCalls <= 0) {
                $("#freeCallsContainer").hide();
                $('#apiCallWarning').show();
            }
        },
        error: function (error) {
            console.log('Error fetching users:', error);
        }
    });
};

$(document).ready(function () {
    // Check API call limit on page load
    checkApiCallLimit();
});
