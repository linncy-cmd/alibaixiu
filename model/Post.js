const mongoose = require("mongoose");
const Joi = require("joi");
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "请传入标题"],
        minlength: [2, '标题长度不能小于2'],
    },
    //作者
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    //文章状态，0 表草稿，1表发布
    state: {
        type: Number,
        default: 0,
        // enum: {
        //     values: [0, 1],
        //     message: '状态值只能传入0或者1'
        // },
    },
    //文章内容
    content: {
        type: String,
        required: [true, "请传入内容"]
    },
    //分类名称
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: [true, "请传入分类"],
    },
    //文章缩略图
    thumbnail: {
        type: String,
        default: null,
    },
    //文章创建时间
    createAt: {
        type: Date,
        default: Date.now,

    },
    // 修改时间
    updateAt: {
        type: Date,
        default: Date.now
    },
    meta: {
        // 看过数量
        views: { type: Number, default: 0 },
        // 喜欢数量
        likes: { type: Number, default: 0 },
        // 评论数量
        comments: { type: Number, default: 0 }
    }
}, { versionKey: false });

// 时间更新
postSchema.pre('findOneAndUpdate', function(next) {
    this.findOneAndUpdate({}, { updateAt: Date.now() })
    next();
});

const Post = mongoose.model("Post", postSchema);
// Post.create({
//     title: "海贼王",
//     state: 1,
//     author: "5e73544a8b3ec7229cc0ff41",
//     content: "我是要成为海贼王的男人",
//     category: "5e7ad0b1bff3bc22f8833eb8",
// });
const validatePost = post => {
    // 定义对象验证规则
    const schema = {
        title: Joi.string().min(2).max(100).required().error(new Error('文章标题不符合验证验证规则')),
        state: Joi.number().valid([0, 1]).default(0, 'draft').error(new Error('文章状态值非法')),
        thumbnail: Joi.any().empty(),
        content: Joi.string().error(new Error("内容不能为空")),
        category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().error(new Error('分类id格式非法'))
    };
    // 验证
    return Joi.validate(post, schema, {
        // 检测到所有错误
        abortEarly: false,
        // 允许对象包含被忽略的未知键
        allowUnknown: true
    });
}
module.exports = {
    Post,
    validatePost,
}