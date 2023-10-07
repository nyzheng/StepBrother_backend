const administrator = require('../model/administrator_model')
const tools = require('../model/tool_model')

//管理員登入
async function login_admin(req, res) {
    const account = req.body.account
    const password = req.body.password
    const admin = await administrator.verify_login_With_hash(account, password)
    if (!admin) {
        res.json({ login_status: false })
    }
    if (admin) {
        console.log(admin)
        const admin_data = await administrator.get_administrator_data(account)
        const payload = { account: account, id: admin_data.id }
        await administrator.update_login_status(account, 1)
        //登入時間更新
        administrator.update_login_time(account)
        //token憑證效期
        const token = tools.make_token(payload, '7d')
        req.header.Authorization = token
        // 自動登出計時器
        tools.delete_single_administrator_status(admin_data.id, 604800)
        res.json({ login_status: true })
    }
}

// 管理員登出
async function logout_admin(req, res) {
    const id_card = tools.verify_token(req.header.Authorization)
    try {
        if (id_card == null) {
            return res.json({ login_status: false })
        }
        await administrator.update_login_status(id_card.account, 0)
        // 刪除token
        delete req.header['Authorization']
        // 回傳登出狀態
        console.log('登出成功!，更新相關資訊')
        return res.json({ login_status: false })
    } catch (error) {
        console.error('登出時發生錯誤：', error)
        return res.status(500).json({ error: '伺服器錯誤，請稍後再試。' })
    }
}

module.exports = {
    login_admin,
    logout_admin,
}
