const express = require('express');
const multer = require('multer');
const routes = express.Router();
const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const order = require('../controller/order_ctrl');
const product = require('../controller/product_ctrl');
const members = require('../controller/member_ctrl');
const admin = require('../controller/administrator_ctrl');
const service = require('../controller/service_QA_ctrl');

///網頁
//業主登入頁
routes.get('/stepbrothers/console/login_page', (req, res) => {
  admin.login_admin('banny1234', 'password');
  res.send('login_page!');
});

//全部訂單閱覽
routes.get(
  '/stepbrothers/console/order_management_page',
  order.purchase_history
);

//訂單模糊搜尋
routes.post(
  '/stepbrothers/console/all_order_vague_search',
  order.all_search_order
);

//全部商品閱覽
routes.get(
  '/stepbrothers/console/merchandise_management_page',
  product.get_all_product
);

//全部會員閱覽
routes.get('/stepbrothers/console/all_user_page', members.get_all_users);

// 上架頁
routes.get(
  '/stepbrothers/console/product_on_shelves_page',
  product.product_on_page_classtype
);

//完成or取消的訂單閱覽頁
routes.get('/stepbrothers/all_purchase_history_page', order.end_order_history);

//客服ＱＡ管理頁
routes.get('/stepbrothers/console/service_QA_page', service.getServiceQuestion);
///功能

// 登入
routes.post('/stepbrothers/console/login', admin.login_admin);
// 登出
routes.put('/stepbrothers/console/logout', admin.logout_admin);

// 更新訂單狀態
routes.put('/stepbrothers/console/switch_order_status', order.update_order);

// 單項產品詳情
routes.post(
  '/stepbrothers/console/product_open_storage',
  product.get_product_all_size_inventory
);

//完成or取消訂單模糊搜尋
routes.post(
  '/stepbrothers/console/end_order_vague_search',
  order.end_search_order
);

//產品模糊搜尋
routes.post('/stepbrothers/console/product_search', product.vague_search);

// 單項產品更新資料與庫存
routes.put(
  '/stepbrothers/console/product_update',
  product.update_product_content
);

// 產品上架
routes.post(
  '/stepbrothers/console/submit_on_shelves',
  upload.array('files'),
  product.add_new_product
);

//交易紀錄下載
routes.get(
  '/stepbrothers/console/download_history_order',
  order.download_history_order
);

//新增客服問題
routes.post('/stepbrothers/console/add_service_QA', service.add_new_QA);

//移除客服問題
routes.put('/stepbrothers/console/remove_service_QA', service.remove_QA);

//修改客服問題
routes.put('/stepbrothers/console/update_service_QA', service.update_QA);

module.exports = routes;
