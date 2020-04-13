const mongoose = require("mongoose");
const Joi = require("joi");
const selideSchema = new mongoose.Schema({
    //图片
    images: {
        type: String,
        default: null,
    },
    //链接
    link: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    // 标题
    title: {
        type: String,
        minlength: 2,
        required: true,
    }
});
const Selide = mongoose.model("Selide", selideSchema);
// const selide = new Selide({
//     title: "阿里百秀"
// });
// selide.save();
const validateSelide = selide => {
    let schema = {
        title: Joi.string().min(2).max(30).required().error(new Error("标题长度必须在2到30之间")),
        link: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().error(new Error('链接id格式非法'))
    };
    // 验证
    return Joi.validate(selide, schema, {
        // 检测到所有错误
        abortEarly: false,
        // 允许对象包含被忽略的未知键
        allowUnknown: true
    });
}
module.exports = {
    Selide,
    validateSelide,
}