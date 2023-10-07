const { connection } = require('../data/connection_model')
const { format_date_time } = require('./tool_model') // 格式化時間

// 全部歷史訂單資料
async function get_purchase_history() {
    try {
        const query = `
        SELECT ph.id, ud.id AS user_id, ph.recipient_name, ph.recipient_phone, ph.recipient_address, pb.brand_name, pdetail.product_name, ps.us_size AS product_size, pdetail.price, sc.quantity, (pdetail.price * sc.quantity) AS subtotal, ph.sum, ph.purchase_status, DATE_FORMAT(ph.create_time, '%Y-%m-%d %H:%i:%s') AS create_time
        FROM purchase_history ph
        JOIN shopping_car sc ON ph.product_id = sc.id
        JOIN product_detail pdetail ON sc.product_id = pdetail.id 
        JOIN product_data pdata ON sc.product_id = pdata.id
        JOIN product_brand pb ON pdata.brand_id = pb.id
        JOIN user_data ud ON ph.user_id = ud.id
        JOIN product_size ps ON sc.size_id = ps.id
        ORDER BY ph.id ASC;
        `
        const [results] = await connection.query(query)

        const formatted_results = results.map((history) => {
            history.create_time = format_date_time(history.create_time)
            return history
        })
        console.log('所有歷史訂單', formatted_results)
        return formatted_results //jianyu
    } catch (error) {
        console.error('無法獲取所有歷史訂單:', error)
    }
}

// 使用user_id查找歷史訂單資料  (指定對象的訂單)
async function use_user_id_get_history(user_id) {
    try {
        // 檢查使用者存在性
        const check_user_query = `
            SELECT id
            FROM user_data
            WHERE id = ?
        `

        const check_user_values = [user_id]
        const [user_results] = await connection.query(check_user_query, check_user_values)

        if (user_results.length === 0) {
            console.log('無此使用者')
            return false
        }

        // 執行查詢: 獲取歷史訂單
        const query = `
            SELECT ph.id, ud.id AS user_id, ph.recipient_name, ph.recipient_phone, ph.recipient_address, pb.brand_name, pdetail.product_name, pdetail.price, ps.us_size, sc.id AS shopping_cart_id, ph.quantity, (pdetail.price * ph.quantity) AS subtotal, ph.sum, ph.purchase_status, DATE_FORMAT(ph.create_time, '%Y-%m-%d %H:%i:%s') AS create_time
            FROM purchase_history ph
            JOIN user_data ud ON ph.user_id = ud.id
            JOIN shopping_cart sc ON ph.product_id = sc.id
            JOIN product_detail pdetail ON sc.product_id = pdetail.id
            JOIN product_data pdata ON sc.product_id = pdata.id
            JOIN product_brand pb ON pdata.brand_id = pb.id
            JOIN product_size ps ON sc.size_id = ps.id
            WHERE ph.user_id = ?
            ORDER BY ph.id ASC
        `

        const [results] = await connection.query(query, [user_id])

        const formatted_results = results.map((history) => {
            history.create_time = format_date_time(history.create_time)
            return history
        })

        console.log(`使用者 ${user_id} 的歷史訂單`, formatted_results)
        return formatted_results
    } catch (error) {
        console.error(`無法獲取使用者 ${user_id} 的歷史訂單:`, error)
        return false
    }
}

// 使用購物紀錄id查找歷史訂單資料  (指定對象的訂單)
async function get_order_by_id(id) {
    try {
        const query = `
        SELECT id, user_id, recipient_name, recipient_phone, recipient_address, product_id, quantity, subtotal, sum, purchase_status, create_time
        FROM purchase_history
        WHERE id = ?;
      `

        const [results] = await connection.query(query, [id])
        const formatted_results = results.map((history) => {
            history.create_time = format_date_time(history.create_time)
            return history
        })

        // 檢查查詢結果中是否有資料行
        if (results.length > 0) {
            console.log(formatted_results[0])
            return formatted_results[0] // 因為只查找單個訂單，所以只取第一個結果
        } else {
            console.log('找不到該訂單')
            return null
        }
    } catch (error) {
        console.error('無法執行查詢：', error)
        throw error // 將錯誤向上傳遞，讓外部程式碼處理
    }
}

// 查找歷史訂單資料  (取消 or 完成)
async function get_end_history() {
    try {
      // 定義 SQL 查詢，獲取歷史訂單的詳細資訊，僅限 purchase_status 為 3 和 4 的訂單
      const query = `
        SELECT ph.id, ud.id AS user_id, ud.name, ph.recipient_name, ph.recipient_phone, ph.recipient_address, pb.brand_name, pdetail.product_name, ps.us_size AS size, pdetail.price, sc.quantity, (pdetail.price * sc.quantity) AS subtotal, ph.sum, ph.purchase_status, DATE_FORMAT(ph.create_time, '%Y-%m-%d %H:%i:%s') AS create_time
        FROM purchase_history ph
        JOIN shopping_car sc ON ph.product_id = sc.id
        JOIN product_detail pdetail ON sc.product_id = pdetail.id
        JOIN product_data pdata ON sc.product_id = pdata.id
        JOIN product_brand pb ON pdata.brand_id = pb.id
        JOIN product_size ps ON sc.size_id = ps.id
        JOIN user_data ud ON ph.user_id = ud.id
        WHERE ph.purchase_status IN (3, 4)  -- 只選取 purchase_status 為 3 和 4 的訂單
        ORDER BY ph.create_time ASC
      `;
      // 執行 SQL 查詢並獲取結果
      const [results] = await connection.query(query);
  
      // 儲存分組後的歷史訂單資料
      const grouped_data = [];
      let current_group = null;
  
      // 遍歷查詢結果進行分組處理
      results.forEach((item) => {
        const createTime = item.create_time;
        // 如果目前的分組不存在，或者與上一個分組的時間不同，則創建一個新分組
        if (!current_group || current_group.time !== createTime) {
          current_group = {
            id: item.id,
            time: createTime,
            user_id: item.user_id,
            name: item.name,
            recipient_name: item.recipient_name,
            recipient_phone: item.recipient_phone,
            recipient_address: item.recipient_address,
            purchase_status: item.purchase_status,
            sum: item.sum,
          };
          // 將新分組加入 grouped_data 陣列
          grouped_data.push(current_group);
        }
  
        // 計算目前分組的總金額
        current_group.sum += item.sum;
      });
  
      // 返回分組後的歷史訂單資料（不包含 purchases 詳細資料）
      return grouped_data;
    } catch (error) {
      // 如果有錯誤發生，輸出錯誤訊息
      console.error('無法獲取所有歷史訂單:', error);
    }
  }
  
  

// 總訂單量 (purchase_status = 4，回傳數字)
async function get_order_total_number() {
    try {
        const query = `
            SELECT COUNT(*) AS total_orders
            FROM purchase_history
            WHERE purchase_status = 4
        `

        const [results] = await connection.query(query)

        if (results.length > 0) {
            const totalOrders = results[0].total_orders
            console.log(`總訂單數量: ${totalOrders}`)
            return totalOrders
        }

        console.log('找不到符合條件的訂單')
        return 0 // 如果找不到符合條件的訂單，則返回 0
    } catch (error) {
        console.error('獲取訂單數量時出錯:', error)
        return 0 // 如果出現錯誤，則返回 0
    }
}

// 區間訂單量 (purchase_status = 4，回傳數字)
async function get_order_total_number_in_interval(start_date, end_date) {
    try {
        const start_date_time = new Date(start_date + ' 00:00:00')
        const end_date_time = new Date(end_date + ' 23:59:59')

        const query = `
            SELECT COUNT(*) AS total_orders
            FROM purchase_history
            WHERE purchase_status = 4
              AND create_time BETWEEN ? AND ?
        `

        const [results] = await connection.query(query, [start_date_time, end_date_time])

        if (results.length > 0) {
            const totalOrders = results[0].total_orders
            console.log(`從 ${start_date} 到 ${end_date} 的訂單數量: ${totalOrders}`)
            return totalOrders
        }

        console.log('找不到符合條件的訂單')
        return 0 // 如果找不到符合條件的訂單，則返回 0
    } catch (error) {
        console.error('獲取區間訂單數量時出錯:', error)
        return 0 // 如果出現錯誤，則返回 0
    }
}
// get_order_total_number_in_interval('2023-8-1', '2023-8-30')

// 依照狀態取得訂單資料
// 1 = 準備中，2 = 審核中，3 = 已取消，4 = 已出貨 (異動內容，加入不可逆判定，ＪＹ)
async function use_status_get_history_purchase(status_num) {
    try {
        // 使用物件映射狀態編號到對應的條件
        const statusConditions = {
            1: 'purchase_status = 1', // 準備中的狀態
            2: 'purchase_status = 2', // 審核中的狀態
            3: 'purchase_status = 3', // 已取消的狀態
            4: 'purchase_status = 4', // 已出貨的狀態
        }

        // 檢查傳入的狀態編號是否有效
        if (!(status_num in statusConditions)) {
            return [] // 若傳入無效的狀態值，回傳空陣列
        }

        const status_condition = statusConditions[status_num]

        // 構建 SQL 查詢語句
        const query = `
            SELECT id, user_id, recipient_name, recipient_phone, recipient_address, product_id, quantity, subtotal, sum, purchase_status, create_time
            FROM purchase_history
            WHERE ${status_condition};
        `

        // 執行查詢，取得結果
        const [results] = await connection.query(query)

        // 格式化並印出查詢結果
        console.log(`狀態 ${status_num} 的訂單資料：`)
        const formatted_results = results.map((result) => {
            return {
                ...result,
                create_time: format_date_time(result.create_time), // 使用 format_date_time 函式進行格式化
            }
        })
        console.log(formatted_results)

        return formatted_results // 回傳格式化後的結果
    } catch (error) {
        console.error('無法取得訂單資料：', error)
        return [] // 若發生錯誤，回傳空陣列
    }
}

// 全部歷史訂單資料(詳細)
async function get_detailed_purchase_history() {
    try {
        // 定義 SQL 查詢，獲取歷史訂單的詳細資訊
        const query = `
            SELECT ph.id, ud.id AS user_id, ud.name, ph.recipient_name, ph.recipient_phone, ph.recipient_address, pb.brand_name, pdetail.product_name, ps.us_size AS size, pdetail.price, sc.quantity, (pdetail.price * sc.quantity) AS subtotal, ph.sum, ph.purchase_status, DATE_FORMAT(ph.create_time, '%Y-%m-%d %H:%i:%s') AS create_time
            FROM purchase_history ph
            JOIN shopping_car sc ON ph.product_id = sc.id
            JOIN product_detail pdetail ON sc.product_id = pdetail.id
            JOIN product_data pdata ON sc.product_id = pdata.id
            JOIN product_brand pb ON pdata.brand_id = pb.id
            JOIN product_size ps ON sc.size_id = ps.id
            JOIN user_data ud ON ph.user_id = ud.id
            ORDER BY ph.create_time ASC
        `

        // 執行 SQL 查詢並獲取結果
        const [results] = await connection.query(query)

        // 儲存分組後的歷史訂單資料
        const grouped_data = []
        let current_group = null

        // 遍歷查詢結果進行分組處理
        results.forEach((item) => {
            const createTime = item.create_time
            // 如果目前的分組不存在，或者與上一個分組的時間不同，則創建一個新分組
            if (!current_group || current_group.time !== createTime) {
                current_group = {
                    id: item.id,
                    time: createTime,
                    user_id: item.user_id,
                    name: item.name,
                    recipient_name: item.recipient_name,
                    recipient_phone: item.recipient_phone,
                    recipient_address: item.recipient_address,
                    purchases: [],
                    sum: 0,
                }
                // 將新分組加入 grouped_data 陣列
                grouped_data.push(current_group)
            }

            // 將購買項目加入目前的分組中
            current_group.purchases.push({
                brand_name: item.brand_name,
                product_name: item.product_name,
                size: item.size,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
                purchase_status: item.purchase_status,
            })

            // 計算目前分組的總金額
            current_group.sum += item.sum
        })

        // 返回分組後的歷史訂單資料
        return grouped_data
    } catch (error) {
        // 如果有錯誤發生，輸出錯誤訊息並返回空數組
        console.error('無法獲取所有歷史訂單:', error)
        return []
    }
}

// 單筆顧客訂單訂單資料(詳細)
async function get_user_only_purchase_history(user_id, time) {
    try {
        // 定義 SQL 查詢，獲取指定使用者在特定時間的歷史訂單的詳細資訊
        const query = `
            SELECT ph.id, ud.id AS user_id, ud.name, ph.recipient_name, ph.recipient_phone, ph.recipient_address, pb.brand_name, pdetail.product_name, ps.us_size AS size, pdetail.price, sc.quantity, (pdetail.price * sc.quantity) AS subtotal, ph.sum, ph.purchase_status, DATE_FORMAT(ph.create_time, '%Y-%m-%d %H:%i:%s') AS create_time
            FROM purchase_history ph
            JOIN shopping_car sc ON ph.product_id = sc.id
            JOIN product_detail pdetail ON sc.product_id = pdetail.id
            JOIN product_data pdata ON sc.product_id = pdata.id
            JOIN product_brand pb ON pdata.brand_id = pb.id
            JOIN product_size ps ON sc.size_id = ps.id
            JOIN user_data ud ON ph.user_id = ud.id
            WHERE ph.user_id = ? AND ph.create_time = ?
            ORDER BY ph.create_time ASC
        `

        // 執行 SQL 查詢並獲取結果
        const [results] = await connection.query(query, [user_id, time])

        // 儲存分組後的歷史訂單資料
        const grouped_data = []
        let current_group = null

        // 遍歷查詢結果進行分組處理
        results.forEach((item) => {
            const createTime = item.create_time
            // 如果目前的分組不存在，或者與上一個分組的時間不同，則創建一個新分組
            if (!current_group || current_group.time !== createTime) {
                current_group = {
                    id: item.id,
                    time: createTime,
                    user_id: item.user_id,
                    name: item.name,
                    recipient_name: item.recipient_name,
                    recipient_phone: item.recipient_phone,
                    recipient_address: item.recipient_address,
                    purchases: [],
                    sum: 0,
                }
                // 將新分組加入 grouped_data 陣列
                grouped_data.push(current_group)
            }

            // 將購買項目加入目前的分組中
            current_group.purchases.push({
                brand_name: item.brand_name,
                product_name: item.product_name,
                size: item.size,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
                purchase_status: item.purchase_status,
            })

            // 計算目前分組的總金額
            current_group.sum += item.sum
        })

        // 返回分組後的歷史訂單資料
        return grouped_data
    } catch (error) {
        // 如果有錯誤發生，輸出錯誤訊息並返回空數組
        console.error('無法獲取指定使用者的歷史訂單:', error)
        return []
    }
}

// 已結束訂單資料(詳細)
async function get_detailed_end_history() {
    try {
        // 定義 SQL 查詢，獲取歷史訂單的詳細資訊，僅包含 purchase_status 為 3 或 4 的訂單
        const query = `
        SELECT ph.id, ud.id AS user_id, ud.name, ph.recipient_name, ph.recipient_phone, ph.recipient_address, pb.brand_name, pdetail.product_name, ps.us_size AS size, pdetail.price, sc.quantity, (pdetail.price * sc.quantity) AS subtotal, ph.sum, ph.purchase_status, DATE_FORMAT(ph.create_time, '%Y-%m-%d %H:%i:%s') AS create_time
        FROM purchase_history ph
        JOIN shopping_car sc ON ph.product_id = sc.id
        JOIN product_detail pdetail ON sc.product_id = pdetail.id
        JOIN product_data pdata ON sc.product_id = pdata.id
        JOIN product_brand pb ON pdata.brand_id = pb.id
        JOIN product_size ps ON sc.size_id = ps.id
        JOIN user_data ud ON ph.user_id = ud.id
        WHERE ph.purchase_status = 3 OR ph.purchase_status = 4
        ORDER BY ph.create_time ASC
      `
        // 執行 SQL 查詢並獲取結果
        const [results] = await connection.query(query)

        // 儲存分組後的歷史訂單資料
        const grouped_data = []
        let current_group = null

        // 遍歷查詢結果進行分組處理
        results.forEach((item) => {
            const createTime = item.create_time
            // 如果目前的分組不存在，或者與上一個分組的時間不同，則創建一個新分組
            if (!current_group || current_group.time !== createTime) {
                current_group = {
                    id: item.id,
                    time: createTime,
                    user_id: item.user_id,
                    name: item.name,
                    recipient_name: item.recipient_name,
                    recipient_phone: item.recipient_phone,
                    recipient_address: item.recipient_address,
                    purchases: [],
                    sum: 0,
                }
                // 將新分組加入 grouped_data 陣列
                grouped_data.push(current_group)
            }

            // 將購買項目加入目前的分組中
            current_group.purchases.push({
                brand_name: item.brand_name,
                product_name: item.product_name,
                size: item.size,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
                purchase_status: item.purchase_status,
            })

            // 計算目前分組的總金額
            current_group.sum += item.sum
        })

        // 返回分組後的歷史訂單資料
        return grouped_data
    } catch (error) {
        // 如果有錯誤發生，輸出錯誤訊息
        console.error('無法獲取所有歷史訂單:', error)
    }
}

//! 修改、取消訂單用 ----------------------------------------------------------------

// 修改指定 user_id & time 的歷史訂單的 purchase_status
// 1 = 準備中，2 = 審核中，3 = 已取消，4 = 已出貨
async function update_purchase_status(user_id, time, new_status) {
    try {
        // 先檢查使用者是否存在
        const check_user_query = `
        SELECT id
        FROM user_data
        WHERE id = ?
      `
        const [user_results] = await connection.query(check_user_query, [user_id])

        if (user_results.length === 0) {
            console.log(`使用者 ID ${user_id} 不存在`)
            return false // 回傳 false 表示使用者不存在
        }

        // 檢查該筆時間的訂單是否存在
        const check_order_query = `
        SELECT id
        FROM purchase_history
        WHERE user_id = ? AND create_time = ?
      `
        const [order_results] = await connection.query(check_order_query, [user_id, time])

        if (order_results.length === 0) {
            console.log(`使用者 ID ${user_id} 在 ${time} 沒有訂單`)
            return false // 回傳 false 表示該筆時間的訂單不存在
        }

        // 獲取訂單的當前狀態
        const status_query = `
        SELECT purchase_status
        FROM purchase_history
        WHERE user_id = ? AND create_time = ?
      `

        // 執行查詢
        const [order_status] = await connection.execute(status_query, [user_id, time])
        const purchase_status = order_status[0].purchase_status

        // 檢查訂單狀態是否為不允許更新的狀態 (3 或 4)
        if (purchase_status === 3 || purchase_status === 4) {
            console.log(`訂單狀態為 ${purchase_status}，不允許更新`)
            return false
        }

        // 更新訂單狀態
        const update_query = `
        UPDATE purchase_history ph
        JOIN user_data ud ON ph.user_id = ud.id
        SET ph.purchase_status = ?
        WHERE ud.id = ? AND ph.create_time = ?
      `
        await connection.query(update_query, [new_status, user_id, time])

        // 回傳成功訊息或其他適當的回饋
        console.log('成功更新訂單狀態')
        return true
    } catch (error) {
        // 如果有錯誤發生，回傳錯誤訊息
        console.error('無法更新訂單狀態:', error)
        throw error
    }
}

//(取消訂單) 更新使用者購買總額 (SQL Table user_data.purchase_CA = purchase_CA - sum)
async function update_user_CA(user_id, sum) {
    try {
        // 先檢查使用者是否存在
        const check_user_query = `
          SELECT id, purchase_CA
          FROM user_data
          WHERE id = ?
        `

        const [user_results] = await connection.query(check_user_query, [user_id])

        if (user_results.length === 0) {
            console.log(`使用者 ID ${user_id} 不存在`)
            return false // 回傳 false 表示使用者不存在
        }

        // 取得當前的購買總額
        const currentPurchaseCA = user_results[0].purchase_CA

        // 檢查是否有足夠的購買總額可以減去 sum
        if (currentPurchaseCA < sum) {
            console.log(`使用者 ID ${user_id} 的購買總額不足以減去 ${sum}`)
            return false // 回傳 false 表示購買總額不足
        }

        // 更新購買總額 (purchase_CA = purchase_CA - sum)
        const update_query = `
          UPDATE user_data
          SET purchase_CA = purchase_CA - ?
          WHERE id = ?
        `

        await connection.query(update_query, [sum, user_id])

        // 回傳成功訊息或其他適當的回饋
        console.log(`成功更新使用者 ID ${user_id} 的購買總額`)
        return true
    } catch (error) {
        // 如果有錯誤發生，回傳錯誤訊息
        console.error('無法更新使用者購買總額:', error)
        throw error
    }
}

// (訂單發貨)更新使用者購買總額
async function create_user_CA(user_id, sum) {
    try {
      // 更新使用者的 purchase_CA
      const update_query = `
              UPDATE user_data
              SET purchase_CA = purchase_CA + ?
              WHERE id = ?
          `;
      const update_values = [sum, user_id];
      await connection.query(update_query, update_values);
  
      console.log('使用者的累積消費總額更新成功');
      return true;
    } catch (error) {
      console.error('無法更新使用者的 purchase_CA:', error);
    }
  }

// 更新使用者等級 (抓取該使用者的消費總額來決定等級)
async function update_user_grade(user_id) {
    try {
        // 查詢使用者的累積消費總額和等級
        const query = `
        SELECT purchase_CA, grade
        FROM user_data
        WHERE id = ?
    `
        const [results] = await connection.query(query, [user_id])
        const user = results[0]

        // 獲取目前的累積消費總額和等級
        const { purchase_CA, grade } = user

        // 更新等級
        let new_grade = grade
        if (purchase_CA > 10000) {
            new_grade = Math.min(3, grade + 2)
        } else if (purchase_CA > 5000) {
            new_grade = Math.min(3, grade + 1)
        }

        if (new_grade !== grade) {
            // 如果等級有更新，則執行 SQL 更新等級
            const update_query = `
            UPDATE user_data
            SET grade = ?
            WHERE id = ?
        `
            const update_values = [new_grade, user_id]
            await connection.query(update_query, update_values)
            console.log('使用者等級更新成功')
            return true
        } else {
            console.log('使用者等級未變更')
            return false
        }
    } catch (error) {
        console.error('無法更新使用者等級:', error)
    }
}

module.exports = {
    get_purchase_history,
    use_user_id_get_history,
    get_order_by_id,
    get_end_history,
    get_order_total_number,
    get_order_total_number_in_interval,
    use_status_get_history_purchase,
    get_detailed_purchase_history,
    update_purchase_status,
    get_user_only_purchase_history,
    get_detailed_end_history,
    update_user_grade,
    update_user_CA,
    create_user_CA
}
