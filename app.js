const express = require("express");
//创建web服务器
const app = express();
//连接数据库
require("./model/connect");
const bodyParser = require("body-parser");
const path = require("path");
//导入session 模块，用于记录cookie
const session = require("express-session");
//开放静态资源
app.use(express.static(path.join(__dirname, "public")));
//拦截和处理post参数
app.use(bodyParser.json());
const { Selide } = require("./model/Selide");

//记录用户是否登录,saveUninitialized:false 代表在没用session 对象时，不主动生成一个空的session 对象
app.use(session({ secret: "secret key", resave: false, saveUninitialized: false }));
//---------------------------------------------------------------------------------------------------------------------------
//以下是发送ajax请求路由
//导入用户路由
const userRouter = require("./router/user");
app.use("/users", userRouter);
//导入分类路由
const categoryRouter = require("./router/category");
app.use("/categories", categoryRouter);
//导入文章路由
const postRouter = require("./router/post");
app.use("/posts", postRouter);
//导入评论路由
const commentRouter = require("./router/comment");
app.use("/comments", commentRouter);
//导入网站设置路由
const settingRouter = require("./router/setting");
app.use("/settings", settingRouter);
//导入轮播图路由
const selideRouter = require("./router/selide");
app.use("/selides", selideRouter);
// 用户登录
app.post('/login', require('./router/other/login'));
// 用户退出
app.post('/logout', require('./router/other/logout'));
// 判断用户是否登录
app.get('/login/status', require('./router/other/loginStatus'));
app.get("/", (req, res) => {
    res.send("你好");
});
//监听3000端口
app.listen("3000");
console.log("服务器启动成功")