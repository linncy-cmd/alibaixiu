module.exports = async(req, res) => {
    req.session.destroy(err => {
        if (err == null) {
            res.clearCookie('connect-sid');
            //清空userInfo对象
            req.app.locals.userInfo = null;
            res.send(JSON.stringify({ message: '退出成功' }));
        } else {
            res.send(JSON.stringify({ message: '退出失败' }));
        }
    });
};