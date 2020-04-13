const mongoose = require('mongoose');
const Joi = require("joi");
const categoriesSchema = new mongoose.Schema({
    //标题
    title: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30,
        unique: true,
    },
    //类名
    className: {
        type: String,
        default: null,
    },
    //创建时间
    createAt: {
        type: Date,
        default: Date.now,
    },
    //禁用生成版本号_v,
}, { versionKey: false });
const Categories = mongoose.model("Categories", categoriesSchema);
const validateCategory = category => {
    let schema = {
        title: Joi.string().min(2).max(30).required().error(new Error('分类名称不符合验证验证规则')),
        createAt: Joi.date().default(Date.now, 'created time'),
        className: Joi.string().required().error(new Error('请填写分类图标类名')),
    };
    return Joi.validate(category, schema, {
        // 检测到所有错误
        abortEarly: false,
        // 允许对象包含被忽略的未知键
        allowUnknown: true
    });
};
// Categories.create({ title: "奇趣事", className: "fa-glass" });
module.exports = {
    Categories,
    validateCategory
}