const express = require("express");
const formidable = require("formidable");
const path = require("path");
const selideRouter = express.Router();
const { Selide, validateSelide } = require("../model/Selide");
//导入分页模块
const pagination = require("mongoose-sex-page");
const fs = require("fs");
// 方法改造
const { promisify } = require('util');
// 删除文件
const unlink = promisify(fs.unlink);
//查询所有轮播图
selideRouter.get("/", async(req, res) => {
    // 页码
    let page = req.query.page || 1;
    let selide = await pagination(Selide).find({}).size(7).display(3).page(page).exec();
    res.send(selide);
});
//添加轮播图
selideRouter.post("/", async(req, res) => {
    let { error } = validateSelide(req.body);
    // 格式不符合要求
    if (error) return res.status(400).send({ message: error.message });
    // 格式符合要求 

    let selide = new Selide(req.body);
    // console.log(setting);
    await selide.save();
    res.send(selide);
});
//上传轮播图片
selideRouter.post("/upload", (req, res) => {
    let form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "../", "public", "uploads", "selides");
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        // console.log(files.attrName.path.split("public")[1]);
        res.send(files.attrName.path.split("public")[1]);
    });
});
//根据id查询轮播图
selideRouter.get("/:id", async(req, res) => {
    // 查询条件
    let id = req.params.id;
    // 验证id格式
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).send({ message: '文章ID不合法' });
    // 通过验证
    let selide = await Selide.findOne({ _id: id });
    res.send(selide);
});
//修改轮播图
selideRouter.put("/:id", async(req, res) => {
    let id = req.params.id;
    // 验证id格式
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).send({ message: '文章ID不合法' });
    // 通过验证
    //验证要修改数据
    let { error } = validateSelide(req.body);
    if (error) return res.status(400).send({ "message": error.message });
    // 通过验证
    let selide = await Selide.findOne({ _id: id });
    let result = await Selide.findOneAndUpdate({ _id: id }, req.body, { new: true });
    if (selide.images != result.images) {
        // 如果封面存在
        if (selide.images) {
            // 删除缩略图
            await unlink(path.join(__dirname, '../', 'public', selide.images));
        }
    }
    res.send(JSON.stringify(result));
});
//根据id删除轮播图
selideRouter.delete("/:id", async(req, res) => {
    let id = req.params.id;
    // 验证id格式
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).send({ message: '文章ID不合法' });
    // 通过验证
    // 删除用户
    let selide = await Selide.findByIdAndDelete(id);
    if (selide.images) {
        // 删除缩略图
        await unlink(path.join(__dirname, '../', 'public', selide.images));
    }
    // 响应
    res.send(JSON.stringify(selide));

});
module.exports = selideRouter;