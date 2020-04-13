const mongoose = require("mongoose");
const Joi = require("joi");
const UserSchema = new mongoose.Schema({
    // 头像
    avatar: {
        type: String,
        default: null,
    },
    //邮箱
    email: {
        type: String,
        // 必须
        required: true,
        //唯一
        unique: true,
    },
    //昵称
    nickName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    //状态
    status: {
        type: Number,
        required: true,
        // 0代表禁用，1表启用
        default: 1,
        enum: [0, 1],
    },
    role: {
        type: String,
        default: "normal",
        enum: {
            values: ["normal", "admin"],
            message: "角色类型在一定范围内"
        }
    },
    createTime: {
        type: Date,
        default: Date.now,

    }

});
const User = mongoose.model("User", UserSchema);
const vilidateUser = user => {
        let schema = {
            nickName: Joi.string().min(2).max(30).required().error(new Error('用户名不符合验证规则')),
            email: Joi.string().regex(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/).required().error(new Error('邮箱不符合验证规则')),
            role: Joi.string().valid("admin", "normal"),
            status: Joi.number().valid(0, 1),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).error(new Error('密码不符合验证规则')),
        };
        // 验证
        return Joi.validate(user, schema, {
            // 检测到所有错误
            abortEarly: false,
            // 允许对象包含被忽略的未知键
            allowUnknown: true
        });

    }
    // 登录数据格式校验 
const validateLogin = user => {
        // 定义对象验证规则
        let schema = {
            email: Joi.string().regex(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/).required().error(new Error('邮箱错误1')),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).error(new Error('密码错误2'))
        };
        // 验证
        return Joi.validate(user, schema, {
            // 检测到错误立即返回
            abortEarly: true
        });
    }
    // User.create({
    //     email: "linncy@qq.com",
    //     nickName: "linncy",
    //     password: "linncy"

// });
// 导出对象
module.exports = {
    User,
    vilidateUser,
    validateLogin
};