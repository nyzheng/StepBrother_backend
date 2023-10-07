const { connection } = require('../data/connection_model')

//! product_brand ----------------------------------------------------------------

// 取得產品品牌資料
async function get_product_brand() {
    try {
        const query = 'SELECT * FROM product_brand'
        const [results] = await connection.query(query)
        console.log('品牌資料', results)
        return results // 回傳品牌資料
    } catch (error) {
        console.error('無法獲取品牌資料:', error)
        return [] // 回傳空陣列表示發生錯誤或沒有品牌資料
    }
}

// 新增品牌
async function create_product_brand(brand_name) {
    try {
        const brandExists = await check_brand_exists(brand_name)
        if (brandExists) {
            console.log('相同品牌已存在，無法新增')
            return false // 回傳 false 代表品牌已存在
        }

        const insert_query = `INSERT INTO product_brand (brand_name) VALUES (?)`
        await connection.query(insert_query, [brand_name])
        console.log('品牌已新增')

        // 如果需要在成功新增品牌後取得最新品牌資料，請將以下行解除註釋
        // const brandData = await get_product_brand();

        return true // 回傳 true 代表品牌新增成功
    } catch (error) {
        console.error('無法新增品牌:', error)
        throw new Error('無法新增品牌') // 拋出自訂錯誤
    }
}

// 檢查品牌是否已存在
async function check_brand_exists(brand_name) {
    try {
        const check_query = `
          SELECT COUNT(*) as count
          FROM product_brand
          WHERE brand_name = ?
      `
        const [checkResults] = await connection.query(check_query, [brand_name])
        const count = checkResults[0].count
        return count > 0
    } catch (error) {
        console.error('檢查品牌是否已存在時發生錯誤:', error)
        throw new Error('無法檢查品牌是否已存在') // 拋出自訂錯誤
    }
}

// 檢查品牌存在性 (上傳產品用)
async function check_brand_existence(brand_id) {
    try {
        const query = 'SELECT id FROM product_brand WHERE id = ?'
        const [results] = await connection.query(query, [brand_id])

        const brandExists = results.length > 0
        console.log(`品牌 ID ${brand_id} ${brandExists ? '存在' : '不存在'}`)
        return brandExists
    } catch (error) {
        console.error('無法檢查品牌存在性:', error)
        throw new Error('無法檢查品牌存在性') // 拋出自訂錯誤
    }
}

// 修改品牌資料(用品牌資料的Id查詢，brand_name 為要修改的名字)
async function update_product_brand(id, brand_name) {
    try {
        const update_query = `UPDATE product_brand SET brand_name = ? WHERE id = ?`
        const update_values = [brand_name, id]
        await connection.query(update_query, update_values)
        console.log('資料更新成功')

        // 如果需要在成功更新後取得最新品牌資料，請將以下行解除註釋
        // get_product_brand();
    } catch (error) {
        console.error('無法更新資料:', error)
        throw new Error('無法更新資料') // 拋出自訂錯誤
    }
}

// 用品牌名稱取得id (不分大小寫)
async function use_brand_name_get_brand_data(brand_name) {
    try {
        // 將品牌名稱轉換成不分大小寫的形式，以進行比對
        const lowercaseBrandName = brand_name.toLowerCase()

        // 定義 SQL 查詢，使用 LIKE 子句進行模糊比對，並使用 LOWER 函數進行不分大小寫比對
        const query = `
        SELECT *
        FROM product_brand
        WHERE LOWER(brand_name) LIKE ?
      `

        // 執行 SQL 查詢，將資料庫中符合條件的品牌資料取出
        const [results] = await connection.query(query, [`%${lowercaseBrandName}%`])
        console.log(`名稱包含 "${brand_name}" 的品牌資料`, results)
        return results // 回傳符合條件的品牌資料
    } catch (error) {
        console.error('無法獲取品牌資料:', error)
        throw new Error('無法獲取品牌資料') // 拋出自訂錯誤
    }
}

//! product_detail ----------------------------------------------------------------

// 建立產品細節資料
async function create_detail(product_name, price) {
    try {
        const query = 'INSERT INTO product_detail (product_name, price) VALUES (?, ?)'
        const values = [product_name, price]
        const [result] = await connection.query(query, values)
        if (result.affectedRows === 1) {
            console.log('細節資料已新增')
            use_product_name_get_detail_data(product_name)
            return true // 回傳 true 代表細節資料新增成功
        } else {
            console.log('細節資料新增失敗')
            return false // 回傳 false 代表細節資料新增失敗
        }
    } catch (error) {
        console.error('無法新增細節資料:', error)
        return false // 回傳 false 代表細節資料新增失敗
    }
}

// 用產品名稱取得單筆產品細節資料
async function use_product_name_get_detail_data(product_name) {
    try {
        const query = `
            SELECT *
            FROM product_detail
            WHERE product_name = ?
        `
        const [results] = await connection.query(query, [product_name])

        if (results.length === 0) {
            return null // 返回 null 表示找不到對應的資料
        }

        console.log(results[0])
        return results[0]
    } catch (error) {
        console.error('無法獲取商品細節資料:', error)
        throw error
    }
}

// 取得產品細節資料
async function get_product_detail() {
    try {
        const query = 'SELECT * FROM product_detail'
        const [results] = await connection.query(query)
        console.log('細節資料', results)
        return results
    } catch (error) {
        console.error('無法獲取細節資料:', error)
    }
}

// 修改產品細節名稱
async function update_product_name(product_id, newProductName) {
    try {
        const update_query = `
    UPDATE product_detail
    SET product_name = ?
    WHERE id = ?
  `
        const update_values = [newProductName, product_id]

        // 執行 SQL 更新語句
        const [update_result] = await connection.query(update_query, update_values)

        if (update_result.affectedRows > 0) {
            console.log(`商品編號 ${product_id} 的商品名稱已更新為 "${newProductName}"`)
            return true
        } else {
            console.log(`找不到商品編號為 ${product_id} 的記錄，無法更新商品名稱`)
            return false
        }
    } catch (error) {
        console.error('更新商品名稱時發生錯誤:', error)
        return false
    }
}

// 更新商品價格JY
async function update_product_price(product_id, new_price) {
    try {
        const query = `
        UPDATE product_detail
        SET price = ?
        WHERE id = ?;
      `

        const [updateResult] = await connection.query(query, [new_price, product_id])

        if (updateResult.affectedRows > 0) {
            console.log('成功更新價格！')
            return true
        } else {
            console.log('找不到符合條件的商品資料')
            return false
        }
    } catch (error) {
        console.error('無法更新商品價格:', error)
        return false
    }
}

//! product_size ----------------------------------------------------------------

// 建立產品尺寸資料
async function create_product_size(us_size) {
    try {
        const insert_query = `INSERT INTO product_size (us_size) VALUES (?);`
        const [insert_result] = await connection.query(insert_query, [us_size])

        if (insert_result.affectedRows > 0) {
            console.log(`成功新增 us_size: ${us_size}`)
            get_product_size()
            return true // 回傳 true 代表尺寸資料新增成功
        } else {
            console.log('新增失敗')
            return false // 回傳 false 代表尺寸資料新增失敗
        }
    } catch (error) {
        console.error('新增 us_size 時發生錯誤:', error)
        return false // 回傳 false 代表尺寸資料新增失敗
    }
}

// 取得產品尺寸資料
async function get_product_size() {
    try {
        const query = 'SELECT * FROM product_size'
        const [results] = await connection.query(query)
        console.log('尺寸資料', results)
        return results // 回傳尺寸資料
    } catch (error) {
        console.error('無法獲取尺寸資料:', error)
        return [] // 回傳空陣列表示發生錯誤或沒有尺寸資料
    }
}

//! product_stock ----------------------------------------------------------------

// 讀取全部商品的庫存量
async function get_product_stock_quantity() {
    try {
        const query = `
          SELECT pd.id AS product_id, pb.brand_name, pdd.product_name, ps.size_id, ps.stock_quantity
          FROM product_data pd
          JOIN product_brand pb ON pd.brand_id = pb.id
          JOIN product_detail pdd ON pd.detail_id = pdd.id
          JOIN product_stock ps ON pd.id = ps.product_data_id
      `

        const [results] = await connection.query(query)
        console.log(results)
        return results
    } catch (error) {
        console.error('無法讀取商品庫存量:', error)
        return []
    }
}

// 取得單筆商品全尺寸庫存量
async function get_single_product_stock_quantity(product_id) {
    try {
        const query = `
        SELECT pd.id AS product_id, pb.brand_name, pdd.product_name, ps.size_id, ps.stock_quantity
        FROM product_stock ps
        JOIN product_data pd ON ps.product_data_id = pd.id
        JOIN product_detail pdd ON pd.detail_id = pdd.id
        JOIN product_brand pb ON pd.brand_id = pb.id
        WHERE ps.product_data_id = ?
    `

        const [results] = await connection.query(query, [product_id])
        console.log(`取得商品 ID ${product_id} 的庫存量與產品資訊:`, results)
        return results
    } catch (error) {
        console.error('無法取得單筆商品庫存量:', error)
        return []
    }
}

// 取得單筆商品單尺寸庫存量
async function get_single_product_single_size_stock_quantity(product_id, size_id) {
    try {
        const query = `
        SELECT pd.id AS product_id, pb.brand_name, pdd.product_name, ps.size_id, ps.stock_quantity
        FROM product_stock ps
        JOIN product_data pd ON ps.product_data_id = pd.id
        JOIN product_detail pdd ON pd.detail_id = pdd.id
        JOIN product_brand pb ON pd.brand_id = pb.id
        WHERE ps.product_data_id = ? AND ps.size_id = ?
    `

        const [results] = await connection.query(query, [product_id, size_id])
        // console.log(
        //   `取得商品 ID ${product_id} 在尺寸 ${size_id} 的庫存量與產品資訊:`,
        //   results
        // );
        return results
    } catch (error) {
        console.error('無法取得單筆商品單尺寸庫存量:', error)
        return []
    }
}

// 新增庫存數量 (quantity 為 指定數字，帶多少庫存更新為多少)
async function create_product_stock_quantity(product_id, size_id, quantity) {
    try {
        // 將數量限制在 0 到 99 之間
        quantity = Math.min(99, Math.max(0, quantity))

        const update_stock_query = `
          UPDATE product_stock
          SET stock_quantity = ?
          WHERE product_data_id = ? AND size_id = ?
      `

        await connection.query(update_stock_query, [quantity, product_id, size_id])

        console.log(`商品 ID ${product_id} 尺寸 ${size_id} 的庫存數量已更新為 ${quantity}`)
        await get_single_product_single_size_stock_quantity(product_id, size_id)
        return true
    } catch (error) {
        console.error('無法新增庫存數量:', error)
        return false
    }
}

// 取得單筆商品全尺寸庫存量 JY
async function get_single_product_stock(product_id) {
    try {
        const query = `
            SELECT size_id, stock_quantity
            FROM product_stock
            WHERE product_data_id = ?    
        `

        const [stock_data] = await connection.query(query, [product_id])
        const result = stock_data.map((item) => ({
            size: item.size_id,
            stock: item.stock_quantity,
        }))
        console.log('成功取得商品單尺寸庫存量！')
        console.log(result)
        return result
    } catch (error) {
        console.error('無法取得商品單尺寸庫存量:', error)
        return []
    }
}

// 更新單筆商品上架狀態 (可以改成指定狀態，0 = 下架， 1 = 上架)
async function update_product_data_status(product_id, new_status) {
    try {
        const updateProductDataQuery = `
        UPDATE product_data
        SET product_data_status = ?
        WHERE id = ?;
      `

        // 更新 product_data 表格中的狀態
        const [updateStatusResult] = await connection.query(updateProductDataQuery, [new_status, product_id])

        // 檢查更新操作的結果
        if (updateStatusResult.affectedRows > 0) {
            console.log('成功更新上架商品狀態！')
            return true
        } else {
            console.log('找不到符合條件的商品資料')
            return false
        }
    } catch (error) {
        console.error('無法更新上架商品狀態:', error)
        return false
    }
}

// 商品價格、狀態及庫存異動
async function update_product_status_and_stock(product_id, product_status, size_stock, price) {
    try {
        await update_product_data_status(product_id, product_status)
        await update_product_price(product_id, price)

        for (let i = 0; i < size_stock.length; i++) {
            const size = size_stock[i].size
            const stock = size_stock[i].stock
            await create_product_stock_quantity(product_id, size, stock)
        }

        return true // 所有操作成功完成
    } catch (error) {
        console.error('無法更新商品狀態或庫存:', error)
        return false // 操作失敗
    }
}

//! product_class ----------------------------------------------------------------

// 取得產品類別資料
async function get_product_class() {
    try {
        const query = 'SELECT * FROM product_class'
        const [results] = await connection.query(query)
        console.log('類別資料', results)
        return results // 回傳類別資料
    } catch (error) {
        console.error('無法獲取類別資料:', error)
        return [] // 回傳空陣列表示發生錯誤或沒有類別資料
    }
}

// 檢查類別存在性的函式 (上傳產品用)
async function check_class_existence(class_id) {
    try {
        const query = 'SELECT id FROM product_class WHERE id = ?'
        const [results] = await connection.query(query, [class_id])

        if (results.length > 0) {
            return true // 若有結果則代表類別存在
        } else {
            return false // 若無結果則代表類別不存在
        }
    } catch (error) {
        console.error('無法檢查類別存在性:', error)
        return false // 回傳 false 代表檢查失敗
    }
}

//! product_data ----------------------------------------------------------------

// 取得全部商品資料 － return 陣列
async function get_product_data() {
    try {
        const query = `
      SELECT pd.id, pb.brand_name, pdd.product_name, pdd.price, pc.class, pd.product_data_status
      FROM product_data pd
      JOIN product_brand pb ON pd.brand_id = pb.id
      JOIN product_detail pdd ON pd.detail_id = pdd.id
      JOIN product_class pc ON pd.class_id = pc.id
    `
        const [results] = await connection.query(query)
        console.log('已取得全部產品資料')
        return results
    } catch (error) {
        console.error('無法獲取產品資料:', error)
    }
}

// 使用類別 id 篩選產品 (man = 1 ， woman = 2 ， kids = 3)
async function use_class_id_get_product(id) {
    try {
        const query = `
          SELECT pd.id, pb.brand_name, pdd.product_name, pdd.price, pc.class, pd.product_data_status
          FROM product_data pd
          JOIN product_brand pb ON pd.brand_id = pb.id
          JOIN product_detail pdd ON pd.detail_id = pdd.id
          JOIN product_class pc ON pd.class_id = pc.id
          WHERE pd.class_id = ?
      `
        const values = [id]
        const [results] = await connection.query(query, values)
        console.log(`類別 ID 為 ${id} 的產品資料`, results)
        return results
    } catch (error) {
        console.error('無法獲取產品資料:', error)
    }
}

// product id 篩選商品  (1~45筆資料)
async function use_product_id_get_product(product_id) {
    try {
        // 定義 SQL 查詢
        const query = `
          SELECT pd.id, pb.brand_name, pdd.product_name, pdd.price, pc.class, pd.product_data_status
          FROM product_data pd
          JOIN product_brand pb ON pd.brand_id = pb.id
          JOIN product_detail pdd ON pd.detail_id = pdd.id
          JOIN product_class pc ON pd.class_id = pc.id
          WHERE pd.id = ?
      `

        const [results] = await connection.query(query, [product_id])

        // 如果查詢結果為空（即沒有找到對應的商品），返回 false
        if (results.length === 0) {
            console.log(`找不到 ID 為 ${product_id} 的商品資料`)
            return false
        }

        console.log(`ID 為 ${product_id} 的商品資料`, results)
        return results
    } catch (error) {
        console.error('無法獲取商品資料:', error)
        throw new Error('無法獲取商品資料') // 拋出自訂錯誤
    }
}

// 上傳產品
async function create_detail_and_product_data(brand_id, product_name, price, class_id) {
    const conn = await connection.getConnection() // 獲取數據庫連接

    try {
        await conn.beginTransaction() // 開始事務

        const existing_detail = await use_product_name_get_detail_data(product_name)

        if (existing_detail) {
            console.log(`產品名稱 ${product_name} 已經存在`)
            return false // 如果產品名稱已存在，返回 false
        }

        const existing_brand = await check_brand_existence(brand_id)

        if (!existing_brand) {
            console.log(`品牌 ID ${brand_id} 不存在`)
            return false // 如果品牌不存在，返回 false
        }

        const existing_class = await check_class_existence(class_id)

        if (!existing_class) {
            console.log(`類別 ID ${class_id} 不存在`)
            return false // 如果類別不存在，返回 false
        }

        const detail_query = 'INSERT INTO product_detail (product_name, price) VALUES (?, ?)'
        const detail_values = [product_name, price]
        const [detail_result] = await conn.query(detail_query, detail_values)

        if (detail_result.affectedRows !== 1) {
            console.log('細節資料新增失敗')
            await conn.rollback() // 回滾事務
            return false // 如果細節資料新增失敗，返回 false
        }

        console.log('細節資料已新增')
        const detail_id = detail_result.insertId

        const product_data_query = 'INSERT INTO product_data (brand_id, detail_id, class_id) VALUES (?, ?, ?)'
        const product_data_values = [brand_id, detail_id, class_id]
        const [product_data_result] = await conn.query(product_data_query, product_data_values)

        if (product_data_result.affectedRows !== 1) {
            console.log('product_data 資料新增失敗')
            await conn.rollback() // 回滾事務
            return false // 如果product_data 資料新增失敗，返回 false
        }

        console.log('product_data 資料已新增')
        const product_data_id = product_data_result.insertId

        const size_query = 'SELECT id FROM product_size'
        const [size_results] = await conn.query(size_query)
        const size_ids = size_results.map((result) => result.id)

        const stock_query = 'INSERT INTO product_stock (product_data_id, size_id) VALUES (?, ?)'
        const stock_values = size_ids.map((size_id) => [product_data_id, size_id])

        for (const stock_value of stock_values) {
            await conn.query(stock_query, stock_value)
        }

        console.log('product_stock 資料已新增')

        await conn.commit() // 提交事務

        return true // 如果所有操作成功，返回 true
    } catch (error) {
        console.error('無法新增資料:', error)

        // 可以將錯誤信息記錄到日誌或進一步處理錯誤
        // logErrorToLogFile(error);

        await conn.rollback() // 回滾事務
        return false // 如果發生錯誤，返回 false
    } finally {
        conn.release() // 釋放數據庫連接
    }
}

//! 取消訂單用 ----------------------------------------------------------------

//回補商品
async function return_quantity(product_id, size_id, quantity) {
    try {
        const currentStockQuery = `
          SELECT stock_quantity
          FROM product_stock
          WHERE product_data_id = ? AND size_id = ?
      `

        // 執行查詢，獲取當前庫存數量
        const [stockResults] = await connection.query(currentStockQuery, [product_id, size_id])
        const currentQuantity = stockResults.length > 0 ? stockResults[0].stock_quantity : 0

        const newQuantity = currentQuantity + quantity

        const updateStockQuery = `
          UPDATE product_stock
          SET stock_quantity = ?
          WHERE product_data_id = ? AND size_id = ?
      `

        // 更新庫存數量
        await connection.query(updateStockQuery, [newQuantity, product_id, size_id])

        console.log(`商品 ID ${product_id} 尺寸 ${size_id} 的庫存數量已更新為 ${newQuantity}`)

        // 返回更新後的庫存數量
        await get_single_product_single_size_stock_quantity(product_id, size_id)

        return true
    } catch (error) {
        console.error('無法新增庫存數量:', error)
        return false
    }
}

//取消時回補庫存(* 非主動補貨，會自動將數量加回去該商品的庫存 *)JY
async function return_stock(product_name, size_id, quantity) {
    try {
        // 構建 SQL 查詢，根據商品名稱獲取商品的ID
        const query_product_id = `
          SELECT id
          FROM product_detail
          WHERE product_name = ?
      `

        // 執行查詢，並獲取商品的ID
        const [product_id] = await connection.execute(query_product_id, [product_name])

        // 取得商品的ID
        const id = product_id[0].id

        // 調用 return_quantity 函數，以商品的ID、尺寸ID和回補的庫存數量為參數
        const box = await return_quantity(id, size_id, quantity)

        // 在控制台輸出是否回補成功
        console.log('有回補', box)
    } catch (error) {
        console.error('無法回補庫存數量:', error)
    }
}

module.exports = {
    get_product_brand,
    create_product_brand,
    check_brand_exists,
    check_brand_existence,
    update_product_brand,
    use_brand_name_get_brand_data,
    create_detail,
    use_product_name_get_detail_data,
    get_product_detail,
    update_product_name,
    create_product_size,
    get_product_size,
    get_product_stock_quantity,
    get_single_product_stock_quantity,
    get_single_product_single_size_stock_quantity,
    create_product_stock_quantity,
    get_single_product_stock,
    update_product_data_status,
    update_product_price,
    update_product_status_and_stock,
    get_product_class,
    check_class_existence,
    get_product_data,
    use_class_id_get_product,
    use_product_id_get_product,
    create_detail_and_product_data,
    return_quantity,
    return_stock,
}
