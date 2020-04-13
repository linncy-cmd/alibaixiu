const express = require("express");
const userRouter = express.Router();
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const _ = require("lodash");
const { User, vilidateUser } = require("../model/User");
const Joi = require("joi");
// 方法改造
const { promisify } = require('util');
// 删除文件
const unlink = promisify(fs.unlink);
// 分页模块
const pagination = require("mongoose-sex-page");
//查询所有用户
userRouter.get("/", async(req, res) => {
    let page = req.query.page || 1;
    let user = await pagination(User).find().page(page).size(7).display(3).exec();
    res.send(user);
});
//添加用户
userRouter.post("/", async(req, res) => {
    let user = req.body;
    // 数据格式校验
    const { error } = vilidateUser(req.body);
    // console.log(vilidateUser(req.body));
    // 格式不符合要求
    if (error) return res.status(400).send({ message: error.message });
    // 格式符合要求 继续向下执行
    let use = await User.findOne({ email: req.body.email });
    if (use) return res.status(400).send({ message: '邮箱已经被注册' });
    // 用户不存在 可以正常执行注册流程
    let result = await User.create(user);
    // console.log(result);
    res.send(JSON.stringify(result));


});
//头像上传
userRouter.post("/upload", (req, res) => {
    let form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "../", "public", "uploads", "avatar");
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        // console.log(files.attrName.path.split("public")[1]);
        res.send(files.attrName.path.split("public")[1]);

    });

});
//修改密码
userRouter.put("/password", async(req, res) => {
    let { userPass, newPass, confirmPass } = req.body;
    //判断用户是否登录
    if (req.session.userInfo) {
        //原始密码
        let password = req.session.userInfo.password;
        let id = req.session.userInfo._id;
        //如果用户输入的密码和原始密码一致
        if (password == userPass) {
            // 定义密码验证规则
            const schema = {
                newPass: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).error(new Error('新密码不符合验证规则')),
            };
            // 验证yong
            const { error } = Joi.validate(req.body, schema, {
                // 允许对象包含被忽略的未知键
                allowUnknown: true
            });
            // 数据格式没有通过验证
            if (error) return res.status(400).send({ message: error.message });
            // 通过验证
            //两次密码配对
            if (newPass == confirmPass) {
                let result = await User.findByIdAndUpdate({ _id: id }, { password: newPass }, { new: true });
                req.session.userInfo = null;
                res.send({ message: '密码修改成功' });
            } else {
                res.status(400).send({ message: "新密码两次匹配失败" });
            }
        } else {
            res.status(400).send({ message: '原始密码输入错误' })
        }
    } else {
        res.status(400).send({ message: '请登录' });
    }
});
//查询特定用户
userRouter.get("/:id", async(req, res) => {
    let id = req.params.id;
    // 验证模型
    let schema = Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).error(new Error('用户id不符合格式'));
    let user = await User.findOne({ _id: id });
    res.send(JSON.stringify(user));
});
//修改用户
userRouter.put("/:id", async(req, res) => {
    let id = req.params.id;
    // 将密码、邮箱字段抛除
    // console.log(req.body);
    let user = _.pick(req.body, ['nickName', 'role', 'avatar', 'status']);
    // 定义对象验证规则
    const schema = {
        _id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).error(new Error('用户id非法'))
    };
    // 验证yong
    req.body._id = id;
    // console.log(req.body);
    const { error } = Joi.validate(req.body, schema, {
        // 允许对象包含被忽略的未知键
        allowUnknown: true
    });
    // 数据格式没有通过验证
    if (error) return res.status(400).send({ message: error.message });
    // 通过验证
    // 更新用户信息
    // new: true 返回修改后的文档 默认值为false 返回原始文档
    // fields: '-password'} 从返回值中抛除密码字段
    let result = await User.findOneAndUpdate({ _id: id }, user, { new: true });
    res.send(JSON.stringify(result));
});
//删除用户
userRouter.delete("/:id", async(req, res) => {
    let id = req.params.id;
    // 验证模型
    let schema = Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).error(new Error('用户id不符合格式'));

    if (id.indexOf("-") != -1) {
        //多个删除
        // 将字符串id分割为数组
        let ids = id.split("-");
        let result = [];
        // 验证
        for (const item of ids) {
            // 验证
            let { error } = Joi.validate(item, schema);
            // 数据格式没有通过验证
            if (error) return res.status(400).send({ message: error.message });
        }
        // 通过验证
        for (const item of ids) {
            // 删除用户
            let user = await User.findByIdAndDelete(item);
            // 将删除的用户存储在数组中
            result.push(user);
            // 如果缩略图存在
            if (user.avatar) {
                // 删除缩略图
                await unlink(path.join(__dirname, '../', 'public', user.avatar));

            }
        }
        res.send(result);
    } else {
        // 单个删除
        // 验证
        let { error } = Joi.validate(id, schema);
        // 数据格式没有通过验证
        if (error) return res.status(400).send({ message: error.message });
        // 通过验证
        // 删除用户
        let user = await User.findByIdAndDelete(id);
        // 如果缩略图存在
        if (user.avatar) {
            // 删除缩略图
            await unlink(path.join(__dirname, '../', 'public', user.avatar));
        }
        // 响应
        res.send(JSON.stringify(user));
    }
});

module.exports = userRouter;