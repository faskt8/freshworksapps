function handleError(client, type, msg) {
    client.interface.trigger("showNotify", {
        type: type,
        message: msg
    });
}
//close modal
function closeModal(client) {
    setTimeout(function () {
        client.instance.close();
    }, 500);
}
//for XSS
function xssTest(name) {
    return $("<span></span>").text(name);
}