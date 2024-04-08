// File made with the assistance of Chat-GPT
// When the translate button is clicked
$('#translateButton').click(function () {
    // Get the values from your form
    let sourceText = $('#sourceText').val();
    let sourceLang = $('#sourceLanguage').val();
    let targetLang = $('#targetLanguage').val();

    // Prepare the data for the API call
    let requestData = {
        text: sourceText,
        source_language: sourceLang,
        target_language: targetLang
    };

    // Make the API call to your server-side endpoint
    $.ajax({
        url: 'https://chiseled-recondite-brisket.glitch.me/auth/translate',
        type: 'POST',
        xhrFields: {
            withCredentials: true
        },
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        success: function (response) {
            // Assuming the server returns a JSON object with the translation in a field called 'translation'
            $('#translatedText').val(response.translation);
            checkApiCallLimit();
        },
        error: function (xhr, status, error) {
            // Handle any errors here
            console.error("Translation API error:", status, error);
        }
    });
});
