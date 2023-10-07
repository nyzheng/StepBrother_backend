const { connection } = require('../data/connection_model');
const jwt = require('jsonwebtoken'); //JWT模組
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

//! 圖片資料夾生成 -----------------------------

// 存取圖片路徑判定
async function getCurrentFolders(category) {
  const basePath = 'C:/Users/88697/OneDrive/桌面/鞋子專案前端/0828/public/products'; // 設定為你的絕對路徑
  const categoryPaths = {
    1: 'man',
    2: 'woman',
    3: 'kids',
  };

  const categoryPath = categoryPaths[category];

  if (!categoryPath) {
    console.error('無效的參數值');
    return '';
  }

  const targetDir = path.join(basePath, categoryPath);

  try {
    const files = await fs.promises.readdir(targetDir); // 正確使用 fs.promises.readdir
    const folders = [];

    for (const file of files) {
      const stat = await fs.promises.stat(path.join(targetDir, file)); // 正確使用 fs.promises.stat
      if (stat.isDirectory()) {
        folders.push(file);
      }
    }
    return targetDir; // 返回目標目錄的完整路徑
  } catch (error) {
    console.error('獲取資料夾列表時發生錯誤', error);
    return '';
  }
}

// 上傳圖片並創建資料夾
async function handle_upload_images(files, folderName, calss_number) {
  try {
    const storagePath = await getCurrentFolders(calss_number);

    if (!storagePath) {
      console.error('無效的資料夾路徑');
      return false;
    }

    const folderPath = path.join(`${storagePath}`, folderName);

    await fs.promises.mkdir(folderPath, { recursive: true });
    console.log('資料夾創建成功');

    for (const file of files) {
      const filePath = path.join(folderPath, file.originalname);
      console.log('準備寫入檔案，路徑：', filePath);
      await fs.promises.writeFile(filePath, file.buffer);
      console.log('檔案寫入成功');
    }

    console.log('檔案上傳成功');
    return true;
  } catch (error) {
    console.error('檔案上傳失敗:', error);
  }
}

//! token -----------------------------

// 創建token
function make_token(payload, expiresIn) {
  // expiresIn表示Token的有效期，可以是數字（秒數）或字符串（例如："1d", "2h", "7d"等）
  return jwt.sign(payload, 'Bowa-Team-B', { expiresIn });
}

// 驗證 token
function verify_token(token) {
  try {
    const decodedToken = jwt.verify(token, 'Bowa-Team-B');
    return decodedToken;
  } catch (err) {
    console.log('驗證失敗或Token已過期');
    return null;
  }
}

//! 加密與解密 -----------------------------

// 隨機鹽值
function generateSalt() {
  return crypto.randomBytes(12).toString('hex');
}

// 對密碼進行雜湊並加上鹽值
function hashPassword(password, salt) {
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return hash;
}

//! time -----------------------------

// 格式化時間
function format_date_time(dateTime) {
  // 函式用於將日期時間格式化為指定格式
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const formatted_date_time = new Date(dateTime).toLocaleString(
    'zh-TW',
    options
  );
  // 使用指定的區域語言 'zh-TW' 和選項格式化日期時間
  return formatted_date_time;
}

// 格式化時間(無時分秒)
function format_birthday_time(dateTime) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formatted_date_time = new Date(dateTime).toLocaleString(
    'zh-TW',
    options
  );
  // 使用指定的區域語言 'zh-TW' 和選項格式化日期時間
  return formatted_date_time;
}

//! SQL -----------------------------

// 取得指定資料表的資料
async function get_table(table_name) {
  try {
    const query = `SELECT * FROM ${table_name}`;
    const [results] = await connection.query(query);

    if (
      results.length > 0 &&
      'create_time' in results[0] &&
      'update_time' in results[0]
    ) {
      const formatted_results = results.map((row) => {
        row.create_time = format_date_time(row.create_time);
        row.update_time = format_date_time(row.update_time);
        return row;
      });

      console.log(`讀取 ${table_name} 資料表的資料`, formatted_results);
      return formatted_results;
    } else {
      console.log(`讀取 ${table_name} 資料表的資料`, results);
      return results;
    }
  } catch (error) {
    console.error(`無法讀取 ${table_name} 資料表的資料:`, error);
  }
}

// 刪除指定table
async function drop_table(table_name) {
  try {
    const dropQuery = `DROP TABLE IF EXISTS \`${table_name}\`;`;
    await connection.query(dropQuery);
    console.log(`資料表 ${table_name} 已成功刪除`);
  } catch (error) {
    console.error(`刪除資料表 ${table_name} 時發生錯誤:`, error);
    throw error;
  }
}

//! search -----------------------------

// 產品模糊搜尋 (品牌名或產品名)
async function vague_search_product_data(product_keyword) {
  // 檢查 product_keyword 是否為空白或未提供值
  if (!product_keyword || product_keyword.trim() === '') {
    console.log('請提供有效的產品關鍵字');
    return false;
  }

  try {
    const query = `
          SELECT pd.id, pb.brand_name, pdd.product_name, pdd.price, pc.class, pd.product_data_status
          FROM product_data pd
          JOIN product_brand pb ON pd.brand_id = pb.id
          JOIN product_detail pdd ON pd.detail_id = pdd.id
          JOIN product_class pc ON pd.class_id = pc.id
          WHERE pb.brand_name LIKE ? OR pdd.product_name LIKE ?
      `;

    const [results] = await connection.query(query, [
      `%${product_keyword}%`,
      `%${product_keyword}%`,
    ]);

    if (results.length === 0) {
      console.log('尚未搜尋到符合的產品資料');
      return false;
    }

    console.log('成功取得符合搜尋的產品資料！');
    console.log(results);
    return results;
  } catch (error) {
    console.error('無法進行模糊搜尋:', error);
    return false;
  }
}

// 訂單區間搜尋
// 1 = 準備中，2 = 審核中，3 = 已取消，4 = 已出貨
async function get_orders_in_interval(start_date, end_date, purchase_status) {
  try {
    const start_date_time = new Date(start_date + ' 00:00:00');
    const end_date_time = new Date(end_date + ' 23:59:59');

    let status_condition = '';
    if (purchase_status !== undefined) {
      status_condition = 'AND purchase_status = ?';
    }

    const query = `
          SELECT id, user_id, recipient_name, recipient_phone, recipient_address, product_id, quantity, subtotal, sum, purchase_status, create_time
          FROM purchase_history
          WHERE create_time BETWEEN ? AND ?
          ${status_condition}
      `;

    const query_params =
      purchase_status !== undefined
        ? [start_date_time, end_date_time, purchase_status]
        : [start_date_time, end_date_time];

    const [results] = await connection.query(query, query_params);

    console.log(`區間 ${start_date} 至 ${end_date} 的訂單資料：`);
    console.log(results);
    return results;
  } catch (error) {
    console.error('取得訂單資料失敗：', error);
    return [];
  }
}

// 全部訂單模糊搜尋(訂單編號 & 訂購人名字)
async function vague_search_order(order_number_or_order_name) {
  // 檢查 order_number_or_order_name 是否為空白或未提供值
  if (!order_number_or_order_name || order_number_or_order_name.trim() === '') {
    console.log('請提供有效的訂單編號或訂單姓名');
    return false;
  }

  try {
    const query = `
      SELECT ph.id, ph.create_time, ud.id AS user_id, ud.name, ph.recipient_name, ph.recipient_phone, ph.recipient_address, pb.brand_name, pdetail.product_name, ps.us_size AS size, pdetail.price, sc.quantity, (pdetail.price * sc.quantity) AS subtotal, ph.sum, ph.purchase_status
      FROM purchase_history ph
      JOIN shopping_car sc ON ph.product_id = sc.id
      JOIN product_detail pdetail ON sc.product_id = pdetail.id 
      JOIN product_data pdata ON sc.product_id = pdata.id
      JOIN product_brand pb ON pdata.brand_id = pb.id
      JOIN user_data ud ON ph.user_id = ud.id
      JOIN product_size ps ON sc.size_id = ps.id
      WHERE (ph.id LIKE ? OR ud.name LIKE ?) 
      ORDER BY ph.id ASC;
    `;

    const [results] = await connection.query(query, [
      `%${order_number_or_order_name}%`,
      `%${order_number_or_order_name}%`,
    ]);

    if (results.length === 0) {
      console.log('尚未搜尋到符合的訂單資料');
      return false;
    }

    const orders = [];
    let currentOrderId = -1;
    let currentOrderIndex = -1;

    results.forEach((result) => {
      if (result.id !== currentOrderId) {
        currentOrderId = result.id;
        currentOrderIndex = orders.length;
        const {
          id,
          create_time,
          user_id,
          name,
          recipient_name,
          recipient_phone,
          recipient_address,
          sum,
        } = result;
        orders.push({
          id,
          time: create_time,
          user_id,
          name,
          recipient_name,
          recipient_phone,
          recipient_address,
          purchases: [],
          sum,
        });
      }

      orders[currentOrderIndex].purchases.push({
        brand_name: result.brand_name,
        product_name: result.product_name,
        size: result.size,
        price: result.price,
        quantity: result.quantity,
        subtotal: result.subtotal,
        purchase_status: result.purchase_status,
      });
    });

    console.log(orders);
    return orders;
  } catch (error) {
    console.error('無法進行模糊搜尋:', error);
    return false;
  }
}

// 部分訂單模糊搜尋 (訂單編號 & 訂購人名字，僅搜尋取消3 & 完成4)
async function vague_search_order_only_cancel_or_finish(
  order_number_or_order_name
) {
  if (!order_number_or_order_name || order_number_or_order_name.trim() === '') {
    console.log('請提供有效的訂單編號或訂單姓名');
    return false;
  }
  try {
    const query = `
          SELECT ph.id, u.name, ph.recipient_name, ph.recipient_phone, ph.recipient_address, ph.product_id, ph.quantity, ph.subtotal, ph.sum, ph.purchase_status, ph.create_time
          FROM purchase_history ph
          JOIN user_data u ON ph.user_id = u.id
          WHERE (ph.id LIKE ? OR u.name LIKE ?) AND (ph.purchase_status = 3 OR ph.purchase_status = 4)
      `;

    const [results] = await connection.query(query, [
      `%${order_number_or_order_name}%`,
      `%${order_number_or_order_name}%`,
    ]);

    if (results.length === 0) {
      console.log('尚未搜尋到符合的訂單資料');
      return false;
    }

    console.log('成功取得符合搜尋的訂單資料！');

    const formattedResults = results.map((result) => {
      return {
        ...result,
        create_time: format_date_time(result.create_time),
      };
    });

    console.log(formattedResults);
    return formattedResults;
  } catch (error) {
    console.error('無法進行模糊搜尋:', error);
    return false;
  }
}

//! administrator  -----------------------------

// 取得該業主的等級
async function get_administrator_grade(administrator_id) {
  try {
    // 查詢使用者等級
    const query_grade = `
            SELECT grade
            FROM user_data
            WHERE id = ?
        `;
    const [results_grade] = await connection.query(query_grade, [
      administrator_id,
    ]);

    if (results_grade.length === 0) {
      console.log(`找不到業主 id ${administrator_id} 的等級`);
      return false;
    }

    const administrator_grade = results_grade[0].grade || 1; // 若 administrator_grade 為 null，則預設為 1

    console.log(`業主 id ${administrator_id} 的等級為: ${administrator_grade}`);

    return administrator_grade;
  } catch (error) {
    console.error(`無法取得使用者 id ${administrator_id} 的等級:`, error);
    return false; // 錯誤時回傳 false
  }
}

// 檢查業主是否存在
async function check_administrator_existence(administrator_id) {
  try {
    const check_administrator_query = `
      SELECT id
      FROM user_data
      WHERE id = ?
    `;
    const check_administrator_values = [administrator_id];
    const [administrator_results] = await connection.query(
      check_administrator_query,
      check_administrator_values
    );

    if (administrator_results.length === 0) {
      console.error('無此業主的資料');
      return false;
    }

    return true; // 使用者存在
  } catch (error) {
    console.error('檢查使用者存在性時發生錯誤:', error);
    return false;
  }
}

// 清除所有業主登入狀態 (將所有使用者 login_status 改成 0)
async function delete_all_administrator_status() {
  try {
    const update_query = 'UPDATE administrator_data SET login_status = 0;';
    await connection.query(update_query);
    console.log('所有業主的登入狀態已清除');
    return true;
  } catch (error) {
    console.error('清除使用者登入狀態時發生錯誤:', error);
    return false;
  }
}

// 時間到清除單一使用者登入狀態(將單一使用者 login_status 改成 0)
// 刪除單一使用者的登入狀態，將其在指定時間後改為未登入狀態
async function delete_single_administrator_status(id, time_in_seconds) {
  try {
    console.log(`業主 ${id} 的登入狀態在 ${time_in_seconds} 秒後改成 0`);

    // 建立一個等待函式，讓後續的程式暫停指定秒數
    const sleep = (seconds) =>
      new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    // 等待指定時間
    await sleep(time_in_seconds);

    // 執行更新查詢，將指定使用者的登入狀態改為未登入
    const update_query = `UPDATE administrator_data SET login_status = 0 WHERE id = ?;`;
    await connection.query(update_query, [id]);
    console.log(`業主 ${id} 的登入狀態已設定為 0`);
    return true; // 回傳 true 表示更新成功
  } catch (error) {
    // 如果有錯誤，捕獲錯誤並顯示錯誤訊息
    console.error(`修改使用者 ${id} 登入狀態時發生錯誤:`, error);
    return false; // 回傳 false 表示更新失敗
  }
}

//! Revenue --------------------------------

// 取得商店全部營收 (取 status = 4 ，已出貨)
async function get_store_revenue() {
  try {
    const query =
      'SELECT IFNULL(SUM(sum), 0) AS total_revenue FROM purchase_history WHERE purchase_status = 4';
    const [results] = await connection.query(query);

    const total_revenue = results[0].total_revenue;
    console.log(`總收入 ${total_revenue} 元`);
    return total_revenue;
  } catch (error) {
    console.error('取得收入資料失敗：', error);
    return 0;
  }
}

// 取得區間營收 (取 status = 4 ，已出貨)
async function get_store_interval_revenue(start_date, end_date) {
  try {
    const start_date_time = new Date(start_date + ' 00:00:00');
    const end_date_time = new Date(end_date + ' 23:59:59');

    const query = `
            SELECT IFNULL(SUM(sum), 0) AS total_revenue
            FROM purchase_history
            WHERE purchase_status = 4
              AND create_time BETWEEN ? AND ?
        `;
    const [results] = await connection.query(query, [
      start_date_time,
      end_date_time,
    ]);

    const total_revenue = results[0].total_revenue;
    console.log(
      `${start_date} 至 ${end_date} 期間，總收入為 ${total_revenue} 元`
    );
    return total_revenue;
  } catch (error) {
    console.error('取得收入資料失敗：', error);
    return 0;
  }
}

//! 報表 -------------------------------- ＪＹ

function switch_order_status_to_chinese(order_status) {
  if (order_status == 1) {
    return '準備中';
  }
  if (order_status == 2) {
    return '審核中';
  }
  if (order_status == 3) {
    return '已取消';
  }
  if (order_status == 4) {
    return '完成出貨';
  }
}

function createExcelReport(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  // 添加報表標頭行，包含新增的欄位 '折扣後金額'
  const headerRow = worksheet.addRow([
    '訂單編號',
    '訂單時間',
    '使用者ID',
    '使用者名稱',
    '收件人名稱',
    '收件人電話',
    '收件地址',
    '品牌名稱',
    '產品名稱',
    '尺寸',
    '價格',
    '數量',
    '小計',
    '訂單狀態',
    '折扣後金額',
  ]);

  // 設定標頭行的字型加粗
  headerRow.font = { bold: true };

  // 添加資料行
  data.forEach((order) => {
    const {
      id,
      time,
      user_id,
      name,
      recipient_name,
      recipient_phone,
      recipient_address,
      purchases,
      sum, // 訂單的折扣後金額
    } = order;

    purchases.forEach((purchase) => {
      worksheet.addRow([
        id,
        time,
        user_id,
        name,
        recipient_name,
        recipient_phone,
        recipient_address,
        purchase.brand_name,
        purchase.product_name,
        purchase.size,
        purchase.price,
        purchase.quantity,
        purchase.subtotal,
        switch_order_status_to_chinese(purchase.purchase_status),
        sum, // 填入折扣後金額
      ]);
    });
  });

  // 設定每個欄的寬度
  const columnWidths = [
    10, 20, 10, 15, 20, 15, 30, 15, 25, 10, 10, 8, 12, 12, 12,
  ]; // 增加了一個欄位，因此調整了寬度
  worksheet.columns.forEach((column, index) => {
    column.width = columnWidths[index];
  });

  return workbook;
}

module.exports = {
  handle_upload_images,
  make_token,
  verify_token,
  format_date_time,
  format_birthday_time,
  get_table,
  get_administrator_grade,
  check_administrator_existence,
  drop_table,
  vague_search_product_data,
  get_orders_in_interval,
  vague_search_order,
  vague_search_order_only_cancel_or_finish,
  delete_all_administrator_status,
  delete_single_administrator_status,
  generateSalt,
  hashPassword,
  createExcelReport,
};
