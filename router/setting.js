const { Setting, validateSetting } = require("../model/Setting");
const express = require("express");
const formidable = require("formidable");
const settingRouter = express.Router();
const path = require("path");
const fs = require("fs");
// 方法改造
const { promisify } = require('util');
// 删除文件
const unlink = promisify(fs.unlink);
settingRouter.get("/", async(req, res) => {
    let setting = await Setting.findOne();
    res.send(setting);
});
settingRouter.post("/", async(req, res) => {
    let { error } = validateSetting(req.body);
    // 格式不符合要求
    if (error) return res.status(400).send({ message: error.message });
    // 格式符合要求 
    // 清除现有设置
    let settings = await Setting.findOne({});
    // console.log(settings);
    // 如果封面存在
    if (settings) {
        if (settings.logo) {
            // 删除缩略图
            await unlink(path.join(__dirname, '../', 'public', settings.logo));
        }
    }
    await Setting.deleteMany({});
    let setting = new Setting(req.body);
    // console.log(setting);
    await setting.save();
    res.send(setting);
});
//上传网站图标
settingRouter.post("/upload", (req, res) => {
    let form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "../", "public", "uploads", "settings");
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        // console.log(files.attrName.path.split("public")[1]);
        res.send(files.attrName.path.split("public")[1]);
    });
});
module.exports = settingRouter;