function makeRequest() {
    initialize();
    $('#op').button('loading');
    var accessor = {
        consumerKey: document.getElementById('consumer_key').value,
        consumerSecret: document.getElementById('consumer_secret').value,
        token: document.getElementById('access_token').value,
        tokenSecret: document.getElementById('access_token_secret').value
    };
    var message = {
        method: getRadioVal('request_type'),
        action: document.getElementById('request_uri').value
        //, parameters: [['scope', 'http://www.google.com/m8/feeds/']]
    };
    //var requestBody = OAuth.formEncode(message.parameters);
    OAuth.completeRequest(message, accessor);
    var authorizationHeader = OAuth.getAuthorizationHeader('', message.parameters);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function receiveRequestToken() {
        if (xhr.readyState == 4) {
            $('#op').button('reset');
            if (xhr.status == 200) {
                chrome.storage.local.set({
                    'consumerKey': accessor.consumerKey,
                    'consumerSecret': accessor.consumerSecret,
                    'token': accessor.token,
                    'tokenSecret': accessor.tokenSecret,
                    'method': message.method,
                    'action': message.action
                });
            } else {
                document.getElementById('msg').innerText = xhr.status + ' ' + xhr.statusText;
                $('#msg').show();
            }

            document.getElementById('headers_content').innerText = xhr.getAllResponseHeaders();
            if (xhr.responseText && xhr.responseText != ' ') {
                try {
                    var json = JSON.parse(xhr.responseText);
                    document.getElementById('body_content').innerText = JSON.stringify(json, null, 4);
                } catch (e) {
                    document.getElementById('body_content').innerText = xhr.responseText;
                }
            }
        }
    }
    xhr.open(message.method, message.action, true);
    xhr.setRequestHeader('Authorization', authorizationHeader);
    xhr.send();
}

function getRadioVal(radioName) {
    var rads = document.getElementsByName(radioName);

    for (var rad in rads) {
        if (rads[rad].checked)
            return rads[rad].value;
    }

    return null;
}

function initialize() {
    $('#msg').hide();
    document.getElementById('headers_content').innerText = '';
    document.getElementById('body_content').innerText = '';
    document.getElementById('msg').innerText = '';
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(function (items) {
        if (items['consumerKey']) document.getElementById('consumer_key').value = items['consumerKey'];
        if (items['consumerSecret']) document.getElementById('consumer_secret').value = items['consumerSecret'];
        if (items['token']) document.getElementById('access_token').value = items['token'];
        if (items['tokenSecret']) document.getElementById('access_token_secret').value = items['tokenSecret'];
        if (items['action']) document.getElementById('request_uri').value = items['action'];

        if (items['consumerKey'] && items['consumerSecret'] && items['token'] && items['tokenSecret'] && items['action'])
            $('#collapseOne').collapse();
    });

    $('.collapse').on('show', function () {
        $(this).parent().find('.icon-chevron-down').removeClass('icon-chevron-down').addClass('icon-chevron-up');
    }).on('hide', function () {
        $(this).parent().find('.icon-chevron-up').removeClass('icon-chevron-up').addClass('icon-chevron-down');
    });

    $('#target').submit(function () {
        makeRequest();
        return false;
    });
});