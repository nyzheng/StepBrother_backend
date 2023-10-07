const { connection } = require('../data/connection_model');
const tools = require('./tool_model');

// add_new_administrator('banny1234','12345','ben2002204@gmail.com','0976876123')
// 新增管理員
async function add_new_administrator(account, password, email, phone) {
  try {
    // 檢查是否有重複的 account、email 和 phone
    const duplicateCheckQuery = `
          SELECT * FROM administrator_data
          WHERE account = ? OR email = ? OR phone = ?
        `;

    const duplicateCheckValues = [account, email, phone];

    const duplicateCheckResults = await connection.query(
      duplicateCheckQuery,
      duplicateCheckValues
    );

    if (duplicateCheckResults.length > 0) {
      if (duplicateCheckResults.some((row) => row.account === account)) {
        console.error('帳號重複');
        return; // 提早退出函式
      }
      if (duplicateCheckResults.some((row) => row.email === email)) {
        console.error('信箱重複');
        return; // 提早退出函式
      }
      if (duplicateCheckResults.some((row) => row.phone === phone)) {
        console.error('電話重複');
        return; // 提早退出函式
      }
    }

    const insertQuery = `
          INSERT INTO administrator_data (account, salt, password, email, phone)
          VALUES (?, ?, ?, ?, ?)
        `;

    const salt = tools.generateSalt();
    const hashPasswordpassword = tools.hashPassword(password, salt);
    const insertValues = [account, salt, hashPasswordpassword, email, phone];

    await connection.query(insertQuery, insertValues);

    console.log('新增管理員成功');
    return true;
  } catch (error) {
    console.error('新增管理員失敗', error);
    return false;
  }
}

// 驗證帳號及雜湊
async function verify_login_With_hash(account, password) {
  try {
    // 檢查帳號是否存在
    const userQuery = `
    SELECT * FROM administrator_data
    WHERE account = ?
  `;
    const userResults = await connection.query(userQuery, account);
    if (userResults[0].length === 0) {
      console.error('帳號不存在');
      return false;
    }

    const user = userResults[0];
    const hash = tools.hashPassword(password, user[0].salt);

    if (hash !== user[0].password) {
      console.error('密碼不正確');
      return false;
    }

    console.log('登入成功');
    return true;
  } catch (error) {
    console.error('登入失敗', error);
    return false;
  }
}

// 取得相關資訊
async function get_administrator_data(account) {
  try {
    // 檢查帳號是否存在
    const userQuery = `
    SELECT * FROM administrator_data
    WHERE account = ?
  `;
    const [userResults] = await connection.query(userQuery, account);
    console.log(userResults[0]);
    if (userResults[0].length === 0) {
      console.error('取得資訊失敗，帳號不存在');
      return false;
    }

    const administrator = {
      id: userResults[0].id,
      email: userResults[0].email,
      phone: userResults[0].phone,
    };

    console.log(administrator);
    return administrator;
  } catch (error) {
    console.error('取得資訊失敗', error);
    return false;
  }
}

// 登入狀態異動
async function update_login_status(account, status) {
  try {
    const query =
      'UPDATE administrator_data SET login_status = ? WHERE account = ?';
    const updateResult = await connection.query(query, [status, account]);
    return updateResult.affectedRows; // 回傳影響的行數
  } catch (error) {
    console.error(`無法更新帳號 ${account} 的 login_status 欄位:`, error);
    return 0; // 若發生錯誤，回傳 0 表示更新失敗
  }
}

//登入時間更新
async function update_login_time(account) {
  try {
    const query =
      'UPDATE administrator_data SET login_time = CURRENT_TIMESTAMP WHERE account = ?';
    const [updateResult] = await connection.query(query, account);

    if (updateResult.affectedRows > 0) {
      console.log(`帳號 ${account} 的 login_time 已更新為當前時間`);
    } else {
      console.log(`更新失敗或未找到帳號 ${account}`);
    }

    return updateResult.affectedRows; // 回傳影響的行數
  } catch (error) {
    console.error(`無法更新帳號 ${account} 的 login_time 欄位:`, error);
    return 0; // 若發生錯誤，回傳 0 表示更新失敗
  }
}


module.exports = {
  add_new_administrator,
  verify_login_With_hash,
  update_login_status,
  update_login_time,
  get_administrator_data,
};
