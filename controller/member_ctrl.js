const members = require('../model/user_model');
const tools = require('../model/tool_model');

//全部會員資料(不含密碼)
async function get_all_users(req, res) {
  const id_card = tools.verify_token(req.header.Authorization);
  console.log('目前會員頁資料使用憑證為：' + id_card);
  try {
    if (id_card) {
      const all_user_data = await members.get_no_password_user_data();
      res.json(all_user_data);
    } else {
      res.json({ login_status: false });
    }
  } catch (error) {
    console.error('處理請求時發生錯誤：', error);
    res.status(500).json({ error: '獲取購會員資料時發生錯誤' });
  }
}

//模糊搜尋帳號電話電郵

module.exports = {
  get_all_users,
};
