const { connection } = require('../data/connection_model')

// 讀取全部客服QA
async function get_customer_service_QA() {
    try {
        const query = `
            SELECT *  FROM customer_service_QA
            WHERE exist_status = 1
        `
        const [results] = await connection.query(query)
        console.log('客服問題', results)
        return results
    } catch (error) {
        console.error('無法讀取客服問題:', error)
    }
}

// 新增客服問題
async function create_customer_service_QA(question, answer) {
    try {
        const query = `
      INSERT INTO customer_service_QA (question,answer)
      VALUES (?,?)
    `
        const [results] = await connection.query(query, [question, answer])
        console.log('新增 QA 成功')
        return results
    } catch (error) {
        console.error('無法新增客服問題與答案:', error)
    }
}

// 修改客服問題
async function use_id_update_customer_service_QA(QA_id, new_question, new_answer) {
    try {
        // 定義 SQL 查詢，用於更新問題和答案
        const updateQuery = `
      UPDATE customer_service_QA
      SET question = ?, answer = ?
      WHERE id = ? AND exist_status = 1
    `

        // 執行 SQL 查詢並獲取結果
        const [results] = await connection.query(updateQuery, [new_question, new_answer, QA_id])

        // 檢查是否成功影響了記錄（affectedRows > 0）
        if (results.affectedRows > 0) {
            console.log(`已成功修改問題 (ID: ${QA_id}) 的內容`)
            return true // 修改成功
        }

        console.error(`找不到問題 (ID: ${QA_id}) 或更新失敗`)
        return false // 修改失败
    } catch (error) {
        console.error('無法修改客服問題:', error)
        return false // 修改失败
    }
}

// 客服問題刪除(軟刪除)
async function delete_customer_service_QA(QA_id) {
    try {
        const query = `
            UPDATE customer_service_QA
            SET exist_status = 0
            WHERE id = ?
        `

        const [result] = await connection.query(query, [QA_id])

        if (result.affectedRows === 1) {
            console.log(`成功軟刪除 ID 為 ${QA_id} 的客戶服務 QA 記錄`)
            return true
        } else {
            console.log(`未找到 ID 為 ${QA_id} 的客戶服務 QA 記錄`)
            return false
        }
    } catch (error) {
        console.error('刪除客戶服務 QA 記錄時發生錯誤:', error)
        return false
    }
}

module.exports = {
    get_customer_service_QA,
    create_customer_service_QA,
    use_id_update_customer_service_QA,
    delete_customer_service_QA,
}
