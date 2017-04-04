function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


var request;
function ajaxPOST(url, data, success)
{
	if(request) request.abort();
	
    // Fire off the request to /form.php
    request = $.ajax({
		type: 'post',
        url: url,
        data: data,
		dataType: 'text',
		success: success
    });
}
