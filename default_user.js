//连接数据库
require("./model/connect");
const { User, vilidateUser } = require("./model/User");
const fs = require("fs");
const path = require("path");
async function origin() {
    let result = await User.findOne({ email: "admin@list.cn" });
    if (!result) {
        let user = new User({
            email: "admin@list.cn",
            nickName: "admin",
            role: "admin",
            password: "12345678"
        });
        user.save();
        // let fileName = path.join(__dirname, public, upload, avatar)
        mkdirsSync(path.join(__dirname, "public", "uploads", "avatar"));
        mkdirsSync(path.join(__dirname, "public", "uploads", "posts"))
        mkdirsSync(path.join(__dirname, "public", "uploads", "selides"));
        mkdirsSync(path.join(__dirname, "public", "uploads", "settings"));
        console.log("初始化管理员成功，你的管理员邮箱为admin@list.cn,密码为12345678");
    } else {
        console.log("初始化管理员成功，你的管理员邮箱为admin@list.cn,密码为12345678")
    }

}

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
origin();
