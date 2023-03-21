const noop = () => { };
const NO_PARAMS = {};
const No_HEADERS = {};
const OK_200 = [200];

function request({
    method = 'GET',
    url,
    params = NO_PARAMS,
    headers = No_HEADERS,
    body,
    responseType = 'json',
    requestType = 'json',
    okResponses = OK_200,
    checkStatusInResponse = false,
    onSuccess = noop,
    onError = noop,
}) {
    const req = new XMLHttpRequest;

    const urlParams = new URLSearchParams(params);
    const queryString = urlParams.toString();

    req.open(method, url + (queryString ? `?${queryString}` : ''));

    Object.keys(headers).forEach((key) => {
        req.setRequestHeader(key, headers[key]);
    })
    req.responseType = responseType;

    req.onload = function (event) {
        const target = event.target;

        if (!okResponses.includes(target.status)) {
            onError(target.statusText);

            return;
        }

        if (checkStatusInResponse && target.response.status !== 'OK') {
            onError(target.statusText);

            return;
        }

        onSuccess(target.response);
    }

    req.onerror = function () {
        onError();
    }

    let dataBody = body;

    if (requestType === 'urlencoded') {
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        const bodyParams = new URLSearchParams(body);

        dataBody = bodyParams.toString();
    }

    if (requestType === 'json') {
        req.setRequestHeader('Content-type', 'application/json');

        dataBody = JSON.stringify(body);
    }

    req.send(dataBody);
}