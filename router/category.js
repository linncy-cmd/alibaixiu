const express = require("express");
const categoryRouter = express.Router();
const Joi = require("joi");
const { Categories, validateCategory } = require("../model/Categories");
//查询所有分类功能
categoryRouter.get("/", async(req, res) => {
    let category = await Categories.find();
    res.send(category);
});
//添加分类功能
categoryRouter.post("/", async(req, res) => {
    let { title, className } = req.body;
    // 数据格式校验
    let { error } = validateCategory(req.body);
    if (error) return res.status(400).send({ message: error.message });
    // 查询分类
    let category = await Categories.findOne({ title: req.body.title });
    // 分类已存在
    if (category) return res.status(400).send({ message: '分类已经存在，添加失败' });
    //通过验证
    let result = await Categories.create(req.body);
    res.send(JSON.stringify(result));
});
//统计分类数量
categoryRouter.get("/count", async(req, res) => {
    let categoryCount = await Categories.countDocuments();
    res.send(JSON.stringify({ categoryCount: categoryCount }));
});
//查询特定分类功能
categoryRouter.get("/:id", async(req, res) => {
    // 查询条件
    let id = req.params.id;
    // 验证id格式
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).send({ message: '文章ID不合法' });
    // 通过验证
    let category = await Categories.findOne({ _id: id });
    res.send(category);

});
//修改特定分类功能
categoryRouter.put("/:id", async(req, res) => {
    let id = req.params.id;
    let { error } = validateCategory(req.body);
    if (error) return res.status(400).send({ message: error.message });
    // 查询分类
    let category = await Categories.findOne({ title: req.body.title });
    // 分类已存在
    if (category) return res.status(400).send({ message: '分类名已经存在，修改失败' });
    //通过验证
    let result = await Categories.findOneAndUpdate({ _id: id }, req.body, { new: true });
    res.send(JSON.stringify(result));
});
//删除特定分类功能
categoryRouter.delete("/:id", async(req, res) => {
    let ids = req.params.id;
    // 验证模型
    let schema = Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).error(new Error('用户id不符合格式'));

    if (ids.indexOf("-") != -1) {
        let category = ids.split("-");
        console.log(category);
        let result = [];
        // 验证
        for (const item of category) {
            // 验证
            let { error } = Joi.validate(item, schema);
            // 数据格式没有通过验证
            if (error) return res.status(400).send({ message: error.message });
        }
        // 通过验证
        for (const item of category) {
            // 删除用户
            let user = await Categories.findByIdAndDelete(item);
            // 将删除的用户存储在数组中
            result.push(user);
        }
        res.send(result);
    } else {
        // 验证
        let { error } = Joi.validate(ids, schema);
        // 数据格式没有通过验证
        if (error) return res.status(400).send({ message: error.message });
        let result = await Categories.findByIdAndDelete({ _id: ids });
        res.send(JSON.stringify(result));
    }
});

module.exports = categoryRouter;