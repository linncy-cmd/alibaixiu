const { Post, validatePost } = require("../model/Post");
const express = require("express");
//处理复杂表单模块
const formidable = require("formidable");
//获取数据库中随机数据条目模块
require("mongoose-query-random");
// 分页模块
const pagination = require("mongoose-sex-page");
const path = require("path");
const postRouter = express.Router();
const fs = require("fs");
const Joi = require("joi");
// 方法改造
const { promisify } = require('util');
// 删除文件
const unlink = promisify(fs.unlink);
//查询所有文章
postRouter.get("/", async(req, res) => {
    // 页码
    let page = req.query.page || 1;
    // 查询条件
    let condition = {};
    if (req.query.category != undefined) {
        condition.category = req.query.category;
    }
    if (req.query.status != undefined) {
        condition.state = +req.query.status;
    }
    let posts = await pagination(Post).find(condition).page(page).size(7).display(3).populate("author").populate("category").exec();
    // console.log(posts);
    res.send(posts)
});
//添加文章
postRouter.post("/", async(req, res) => {
    let { error } = validatePost(req.body);
    if (error) return res.status(400).send({ "message": error.message });
    // 添加作者
    req.body.author = req.session.userInfo._id;
    // 创建分类
    let post = new Post(req.body);
    // 保存分类
    await post.save();
    // 响应
    res.send(post);
});
//上传文章封面
postRouter.post("/upload", (req, res) => {
    let form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "../", "public", "uploads", "posts");
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        // console.log(files.attrName.path.split("public")[1]);
        res.send(files.attrName.path.split("public")[1]);

    });
});
//统计文章个数条目和草稿个数
postRouter.get("/count", async(req, res) => {
    let postCount = await Post.countDocuments();
    let draftCount = await Post.countDocuments({ state: 0 });
    res.send(JSON.stringify({ postCount: postCount, draftCount: draftCount }));
});
//获取热门推荐(按钮评论数量排序)
postRouter.get("/recommend", async(req, res) => {
    //select("-content"):返回除了content字段的所有内容 
    let posts = await Post.find({ state: 1 }).select('-content').limit(4).sort('-meta.comments')
    res.send(posts);
});
// 获取随机推荐
postRouter.get("/random", async(req, res) => {
    // 判断Post里是否有数据
    let posts = await Post.find();
    if (posts.length > 5) {
        //导入mongoose-query-random模块才能使用random方法
        //参数一表要随机获取的条目
        //参数二表获取的数据是否唯一
        //参数三是回调函数
        Post.find().random(5, true, (err, docs) => {
            //docs表查出来的数据
            if (err) return res.status(400).send({ message: err.message });
            res.send(docs);
        });
    }
    res.send(posts);


});
//获取最新发布
postRouter.get("/lasted", async(req, res) => {
    let posts = await Post.find().populate("author", "-password").populate("category").limit(5).sort("-createAt");
    res.send(posts);
});
//根据分类Id查找文章
postRouter.get("/category/:id", async(req, res) => {
    let id = req.params.id;
    // // 验证id格式
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).send({ message: '文章ID不合法' });
    // // 通过验证
    let post = await Post.find({ category: id }).populate("author", "-password").populate("category");
    // console.log(post);
    res.send(post);
});
//根据关键字搜素内容
postRouter.get("/search/:key", async(req, res) => {
    // 获取用户输入的关键字
    const key = req.params.key;
    // 如果用户输入了搜索关键字
    if (key.trim().length > 0) {
        const regex = new RegExp(escapeRegex(key), 'gi');
        // 根据关键字查询文章
        const posts = await Post.find({ title: regex }).populate('author', '-password').populate('category');
        // 响应
        res.send(posts);
    } else {
        res.status(400).send({ message: '请输入搜索关键字' })
    }
});
//为文章点赞,有点漏洞，点赞初应该存储用户id,防止用户重复点赞
postRouter.put("/fabulous/:id", async(req, res) => {
    let id = req.params.id;
    // 验证id格式
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).send({ message: '文章ID不合法' });
    // 通过验证
    let post = await Post.findOne({ _id: id }).select("meta");
    //对相应文章的点赞数量 +1
    // console.log(post);
    post.meta.likes = post.meta.likes + 1;
    await post.save();
    res.send(post);
});
//修改文章
postRouter.put("/:id", async(req, res) => {
    let id = req.params.id;
    // 验证id格式
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).send({ message: '文章ID不合法' });
    // 通过验证
    //验证要修改数据
    let { error } = validatePost(req.body);
    if (error) return res.status(400).send({ "message": error.message });
    // 通过验证
    let post = await Post.findOne({ _id: id });
    let result = await Post.findOneAndUpdate({ _id: id }, req.body, { new: true });
    if (post.thumbnail != result.thumbnail) {
        // 如果封面存在
        if (post.thumbnail) {
            // 删除缩略图
            await unlink(path.join(__dirname, '../', 'public', post.thumbnail));
        }
    }
    res.send(JSON.stringify(result));
});

//根据id查询文章
postRouter.get("/:id", async(req, res) => {
    // 页码
    let page = req.query.page || 1;
    // 查询条件
    let id = req.params.id;
    // 验证id格式
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).send({ message: '文章ID不合法' });
    // 通过验证
    //page 指定当前页
    //size 指定每页显示的数据条目
    //display 指定客户端要显示的页面数量
    //exec 向数据库发送查询请求
    // console.log(condition);
    let posts = await Post.findOne({ _id: id }).populate("author category");
    // 增加文章阅读数量
    posts.meta.views = posts.meta.views + 1;
    // 保存
    await posts.save();
    res.send(posts)
});
//删除文章
postRouter.delete("/:id", async(req, res) => {
    let id = req.params.id;
    // 验证模型
    let schema = Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).error(new Error('用户id不符合格式'));
    // 单个删除
    // 验证
    let { error } = Joi.validate(id, schema);
    // 数据格式没有通过验证
    if (error) return res.status(400).send({ message: error.message });
    // 通过验证
    // 删除用户
    let post = await Post.findByIdAndDelete(id);
    if (post.thumbnail) {
        // 删除缩略图
        await unlink(path.join(__dirname, '../', 'public', post.thumbnail));
    }
    // 响应
    res.send(JSON.stringify(post));

});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = postRouter;