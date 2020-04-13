const mongoose = require("mongoose");
const Joi = require("joi");
const settingSchema = new mongoose.Schema({
    // 网站图标
    logo: {
        type: String,
        default: null,
    },
    // 站点名称
    title: {
        type: String,
        required: [true, "请传入标题"],
        minlength: [2, "站点名称s最小长度为2"],
    },
    //站点描述
    descript: {
        type: String,
        default: null,
    },
    //站点关键字
    keys: {
        type: String,
        default: null,
    },
    //是否开启评论功能
    comment: {
        type: Boolean,
        required: false,
        default: true,
    },
    //评论必须经过人工审核
    review: {
        type: Boolean,
        required: false,
        default: true,
    },

});
const Setting = mongoose.model("Setting", settingSchema);
// const setting = new Setting({
//     title: "远古时代",
//     comment: true,
//     review: true,
// });
// setting.save();
const validateSetting = setting => {
    let schema = {
        title: Joi.string().min(2).max(30).required().error(new Error("网站标题长度只能在2到30之间")),

    };
    // 验证
    return Joi.validate(setting, schema, {
        // 检测到所有错误
        abortEarly: false,
        // 允许对象包含被忽略的未知键
        allowUnknown: true
    });
}
module.exports = {
    Setting,
    validateSetting
}