// 处理日期时间格式
function formateDate(date) {
    // 将日期时间字符串转换成日期对象
    date = new Date(date);
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
}

// 从浏览器的地址栏中获取查询参数
function getUrlParams(name) {
    var paramsAry = location.search.substr(1).split('&');
    // 循环数据
    for (var i = 0; i < paramsAry.length; i++) {
        var tmp = paramsAry[i].split('=');
        if (tmp[0] == name) {
            return tmp[1];
        }
    }
    return -1;
}
//向服务器端发送请求 索要文章分类列表数据
$.ajax({
    url: "/categories",
    type: "get",
    success: function(response) {
        let categoryTp1 = `
        {{each data}}
        <li>
            <a href="list.html?categoryId={{$value._id}}">
            <i class="fa {{$value.className}}"></i>{{$value.title}}
            </a>
        </li>
        {{/each}}`;
        if (response.length >= 1) {
            let html = template.render(categoryTp1, {
                data: response,
            });
            $("#navBox").html(html);
            $(".topNav").html(html);
        }
    }
});
//向服务器端发送请求，获取随机推荐数据
$.ajax({
    url: "/posts/random",
    type: "get",
    success: function(response) {
        // console.log(response);
        let randomTp1 = `
        {{each data}}
        <li>
            <a href="detail.html?id={{$value._id}}">
                <p class="title">
                    {{$value.title}}
                </p>
                <p class="reading">阅读(<span>{{$value.meta.views}}</span>)</p>
                <div class="pic">
                    <img src="{{$value.thumbnail}}" alt="">
                </div>
            </a>
        </li>
        {{/each}}`;
        if (response.length >= 1) {
            let html = template.render(randomTp1, {
                data: response,
            });
            $("#randomBox").html(html);
        }

    }
});
//向服务器端发送请求，获取最新评论数据
$.ajax({
    url: "/comments/lasted",
    type: "get",
    success: function(response) {
        // console.log(response);
        let commentTp1 = `
        {{each data}}
        <div class="commons clearfix">
            <div class="avatar">
                <img src="{{$value.author.avatar}}" alt="">
            </div>
            <div class="txt">
                <p><span class="user">{{$value.author.nickName}} </span>{{$imports.formateDate($value.createAt)}}<span>&nbsp;说</p>
                <p>{{$value.content}}</p>
            </div>
        </div>
        {{/each}}`;
        if (response.length >= 1) {
            let html = template.render(commentTp1, {
                data: response,
            });
            $("#commentBox").html(html);
        }
    }
});
//封装获取最新评论
function renderComment() {
    $.ajax({
        url: "/comments/lasted",
        type: "get",
        success: function(response) {
            // console.log(response);
            let commentTp1 = `
            {{each data}}
            <div class="commons clearfix">
                <div class="avatar">
                    <img src="{{$value.author.avatar}}" alt="">
                </div>
                <div class="txt">
                    <p><span class="user">{{$value.author.nickName}} </span>{{$imports.formateDate($value.createAt)}}<span>&nbsp;说</p>
                    <p>{{$value.content}}</p>
                </div>
            </div>
            {{/each}}`;
            if (response.length >= 1) {
                let html = template.render(commentTp1, {
                    data: response,
                });
                $("#commentBox").html(html);
            }
        }
    });
}
//搜素文章功能
$(".search").on("submit", function() {
    let keys = $(".search>input[name=search]").val();
    // alert(keys);
    location.href = "/search.html?keys=" + keys;
    return false;
})