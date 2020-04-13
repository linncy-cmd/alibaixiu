const mongoose = require("mongoose");
const Joi = require("joi");
const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "请传入作者"]
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: [true, "请传入评论文章id"]
    },
    content: {
        type: String,
        required: [true, "请传入评论内容"],
        minlength: 1
    },
    //状态：0 未批准 1 批准
    state: {
        type: Number,
        required: true,
        default: 0
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
}, { versionKey: false });
const Comment = mongoose.model("Comment", commentSchema);
// const comment = new Comment({
//     author: "5e7f0aaa538977195095eb04",
//     post: "5e7d6a3aa506291694cbb5e7",
//     content: "这龙真是庞大",
// });
// comment.save();
const valideComment = comment => {
    // _id验证规则
    const objectIdReg = /^[0-9a-fA-F]{24}$/;
    let schema = {
        author: Joi.string().regex(objectIdReg).required().error(new Error('用户ID非法')),
        content: Joi.string().min(1).required().error(new Error('评论不符合格式要求')),
        post: Joi.string().regex(objectIdReg).required().error(new Error('评论文章ID非法')),
        state: Joi.number().valid(0, 1)
    };
    return Joi.validate(comment, schema, {
        // 检测到所有错误
        abortEarly: false,
        // 允许对象包含被忽略的未知键
        allowUnknown: true
    });
}
module.exports = {
    Comment,
    valideComment,
}