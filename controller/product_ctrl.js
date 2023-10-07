const fs = require('fs')
const path = require('path')
const product = require('../model/product_data_model')
const tools = require('../model/tool_model')

// 全部商品資料頁
async function get_all_product(req, res) {
    const id_card = tools.verify_token(req.header.Authorization)
    console.log('目前商品資料頁使用憑證為：' + id_card)
    try {
        if (id_card) {
            const product_data = await product.get_product_data()
            res.json(product_data)
        } else {
            res.json({ login_status: false })
        }
    } catch (error) {
        console.error('處理請求時發生錯誤：', error)
        res.status(500).json({ error: '獲取產品時發生錯誤' })
    }
}

// 產品模糊搜尋(品牌或品名)
async function vague_search(req, res) {
    const index = req.body.index
    console.log(index)
    const vague_result = await tools.vague_search_product_data(index)
    try {
        if (!vague_result) {
            res.json(false)
        } else {
            res.json(vague_result)
        }
    } catch (error) {
        console.error('處理請求時發生錯誤：', error)
        res.status(500).json({ error: '獲取購產品資料時發生錯誤' })
    }
}

// 取得單項產品狀態、價格、各尺寸庫存
async function get_product_all_size_inventory(req, res) {
    try {
        const product_id = req.body.product_id
        const product_data = await product.use_product_id_get_product(product_id)
        const inventory = await product.get_single_product_stock(product_id)
        console.log(product_data)
        const result = {
            product_id: product_id,
            product_data_status: product_data[0].product_data_status,
            size_stock: inventory,
            price: product_data[0].price,
        }
        console.log(result)
        res.json(result)
    } catch (error) {
        console.error('處理請求時發生錯誤：', error)
        res.status(500).json({ error: '獲取購產品資料時發生錯誤' })
    }
}

//產品上架頁 ----回傳品牌
async function product_on_page_classtype(req, res) {
    const id_card = tools.verify_token(req.header.Authorization)
    console.log('目前商品資料頁使用憑證為：' + id_card)
    try {
        if (id_card) {
            const product_brand = await product.get_product_brand()
            res.json(product_brand)
        } else {
            res.json({ login_status: false })
        }
    } catch (error) {
        console.error('處理請求時發生錯誤：', error)
        res.status(500).json({ error: '獲取品牌時發生錯誤' })
    }
}

// 更新單項產品狀態、價格、各尺寸庫存
async function update_product_content(req, res) {
    const id_card = tools.verify_token(req.header.Authorization)
    console.log('目前商品資料頁使用憑證為：' + id_card)
    try {
        if (id_card) {
            const id = req.body.product_id
            const product_status = req.body.product_status
            const size_stock = req.body.size_stock
            const price = req.body.price
            const update_result = await product.update_product_status_and_stock(id, product_status, size_stock, price)

            console.log(size_stock)
            if (update_result) {
                await product.update_product_status_and_stock(id, product_status, size_stock, price)
                const product_data = await product.use_product_id_get_product(id)
                const result = {
                    id: product_data[0].id,
                    product_name: product_data[0].product_name,
                    update_product_data: true,
                }
                res.json(result)
            }
        } else {
            res.json({ login_status: false })
        }
    } catch (error) {
        console.error('處理請求時發生錯誤：', error)
        res.status(500).json({ error: '更新單項產品時發生錯誤' })
    }
}

// 貨品上架
async function add_new_product(req, res) {
    const files = req.files
    const brand = req.body.brand
    const name = req.body.name
    const price = req.body.price
    const class_ification = req.body.category
    try {
        const add_product = await product.create_detail_and_product_data(brand, name, price, class_ification)
        if (!add_product) {
            res.status(500).send('上傳失敗')
            return false
        }

        const img = await tools.handle_upload_images(files, name, class_ification)
        if (!img) {
            // 如果圖片上傳發生錯誤，就不繼續執行後續的操作
            res.status(500).send('上傳失敗')
            return false
        }

        console.log(add_product)
        console.log('已收到')
        res.status(200).send('上傳成功')
    } catch (error) {
        console.error('錯誤', error)
        res.status(500).send('上傳失敗')
    }
}

module.exports = {
    get_all_product,
    get_product_all_size_inventory,
    update_product_content,
    product_on_page_classtype,
    add_new_product,
    vague_search,
}
