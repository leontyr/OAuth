function newXMLHttpRequest() {
    try {
        return new XMLHttpRequest();
    } catch (e) {
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                alert("Sorry, your browser doesn't support AJAX.");
                throw e;
            }
        }
    }
}

function makeRequest() {
    document.getElementById("result").innerHTML = "";
    document.getElementById("msg").innerHTML = "";

    var accessor = {
        consumerKey: document.getElementById("consumer_key").value
, consumerSecret: document.getElementById("consumer_secret").value
, token: document.getElementById("access_token").value
                    , tokenSecret: document.getElementById("access_token_secret").value
    };
    var message = {
        method: getRadioVal("request_type"), action: document.getElementById("request_uri").value
      //, parameters: [["scope", "http://www.google.com/m8/feeds/"]]
    };
    //var requestBody = OAuth.formEncode(message.parameters);
    OAuth.completeRequest(message, accessor);
    var authorizationHeader = OAuth.getAuthorizationHeader("", message.parameters);
    var requestToken = newXMLHttpRequest();
    requestToken.onreadystatechange = function receiveRequestToken() {
        if (requestToken.readyState == 4 && requestToken.status == 200) {
            document.getElementById("result").innerHTML = JSON.stringify(JSON.parse(requestToken.responseText), null, 4);

            chrome.storage.local.set({ 'consumerKey': accessor.consumerKey, 'consumerSecret': accessor.consumerSecret, 'token': accessor.token, 'tokenSecret': accessor.tokenSecret, 'method': message.method, 'action': message.action });
        }
        else if (requestToken.status != 200) {
            document.getElementById("msg").innerHTML = (requestToken.status + " " + requestToken.statusText
                  + "\n" + requestToken.getAllResponseHeaders()
                  + "\n" + requestToken.responseText);
        }
    }
    requestToken.open(message.method, message.action, true);
    requestToken.setRequestHeader("Authorization", authorizationHeader);
    //requestToken.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    requestToken.send();
}

function getRadioVal(radioName) {
    var rads = document.getElementsByName(radioName);

    for (var rad in rads) {
        if (rads[rad].checked)
            return rads[rad].value;
    }

    return null;
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(function (items) {
        if (items['consumerKey']) document.getElementById("consumer_key").value = items['consumerKey'];
        if (items['consumerSecret']) document.getElementById("consumer_secret").value = items['consumerSecret'];
        if (items['token']) document.getElementById("access_token").value = items['token'];
        if (items['tokenSecret']) document.getElementById("access_token_secret").value = items['tokenSecret'];
        if (items['action']) document.getElementById("request_uri").value = items['action'];

        if (items['consumerKey'] && items['consumerSecret'] && items['token'] && items['tokenSecret'] && items['action'])
            $("#collapseOne").collapse();
    });

    var link = document.getElementById('op');
    link.addEventListener('click', function () {
        makeRequest();
    });
});