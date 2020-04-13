const express = require("express");
const { Comment, valideComment } = require("../model/Comment");
const { Post } = require("../model/Post");
const pagination = require("mongoose-sex-page");
const commentRouter = express.Router();
const Joi = require("joi");
//查询所有评论
commentRouter.get("/", async(req, res) => {
    // 页码
    let page = req.query.page || 1;
    let comment = await pagination(Comment).find().page(page).size(10).display(3).populate("author").populate("post").exec();
    res.send(comment)
});
//添加评论
commentRouter.post("/", async(req, res) => {
    if (req.session.userInfo) {
        let author = req.session.userInfo._id;
        req.body.author = author;
        console.log(req.body);
        let { error } = valideComment(req.body);
        if (error) return res.status(400).send({ "message": error.message });
        //通过验证

        let comment = new Comment(req.body);
        comment.save();
        // console.log(comment);
        //根据添加的评论id查询文章
        let post = await Post.findOne({ _id: comment.post }).select("meta");
        //对相应文章的评论 +1
        // console.log(post);
        post.meta.comments = post.meta.comments + 1;
        post.save();
        res.send(comment);
    } else {
        res.status(400).send({ message: "请登录" });
    }
});
//统计评论数量
commentRouter.get("/count", async(req, res) => {
    let commentCount = await Comment.countDocuments();
    let draftCount = await Comment.countDocuments({ state: 0 });
    res.send(JSON.stringify({ commentCount: commentCount, draftCount: draftCount }));
});
//获取最新评论信息
commentRouter.get("/lasted", async(req, res) => {
    //联合查询，除去密码字段
    let common = await Comment.find().populate("author", "-password").limit(5).sort("-createAt");
    res.send(common);
});
//修改评论状态
commentRouter.put("/:id", async(req, res) => {
    let id = req.params.id;
    // 定义对象验证规则
    const schema = {
        _id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).error(new Error('用户id非法'))
    };
    const { error } = Joi.validate({ _id: id }, schema);
    if (error) return res.status(400).send({ message: error.message });
    // console.log(req.body);
    let comment = await Comment.findByIdAndUpdate({ _id: id }, req.body, { new: true });
    // console.log(comment)
    res.send(comment);
});
//删除评论
commentRouter.delete("/:id", async(req, res) => {
    let id = req.params.id;
    // 定义对象验证规则
    let schema = {
        _id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).error(new Error('用户id非法'))
    };
    let { error } = Joi.validate({ _id: id }, schema);
    if (error) return res.status(400).send({ message: error.message });
    // console.log(req.body);
    let comment = await Comment.findByIdAndDelete({ _id: id });
    //根据添加的评论id查询文章
    let post = await Post.findOne({ _id: comment.post }).select("meta");
    //对相应文章的评论 +1
    // console.log(post);
    post.meta.comments = post.meta.comments - 1;
    post.save();
    res.send(JSON.stringify(comment));
});

module.exports = commentRouter;