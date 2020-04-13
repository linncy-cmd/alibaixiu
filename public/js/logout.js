$("#logout").on("click", function() {
    $.ajax({
        url: "/logout",
        type: "post",
        success: function(response) {
            let res = JSON.parse(response);
            if (res.message == "退出成功") {
                location.href = "login.html"
            }
        }
    })
})