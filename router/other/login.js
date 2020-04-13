const { User, validateLogin } = require("../../model/User");
const _ = require("lodash");
module.exports = async(req, res) => {
    // 数据格式校验
    // const { error } = validateLogin(req.body);
    console.log(req.body);
    // 格式不符合要求
    // if (error) return res.status(400).send({ message: error.message });
    // // 查找用户
    let user = await User.findOne({ email: req.body.email });
    // 如果用户不存在 响应
    // console.log(1)
    if (!user) return res.status(400).send({ message: '邮箱地址错误' });
    if (user.password != req.body.password) return res.status(400).send({ message: '密码错误' });
    // 将用户信息存储在session中
    req.session.userInfo = user;
    let result = _.pick(user, ['nickName', 'email', 'role', 'avatar', '_id', 'status', 'createTime']);
    // console.log(result);
    // 响应
    res.send(JSON.stringify(result));
};