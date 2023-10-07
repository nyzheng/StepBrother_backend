const history = require('../model/purchase_history_model');
const tools = require('../model/tool_model');
const product = require('../model/product_data_model');

// 全部訂單頁
async function purchase_history(req, res) {
  const id_card = tools.verify_token(req.header.Authorization);
  console.log('目前訂單頁使用憑證為：' + id_card);
  try {
    if (id_card) {
      const purchase = await history.get_detailed_purchase_history();
      console.log(purchase);
      res.json(purchase.reverse());
    } else {
      res.json({ login_status: false });
    }
  } catch (error) {
    console.error('處理請求時發生錯誤：', error);
    res.status(500).json({ error: '獲取購買記錄時發生錯誤' });
  }
}

//模糊搜尋訂單(訂購人或編號)
async function all_search_order(req, res) {
  const index = req.body.index;
  console.log(index);
  const result = await tools.vague_search_order(index);
  try {
    if (!result) {
      res.json(false);
    } else {
      console.log(result);
      res.json(result);
    }
  } catch (error) {
    console.error('處理首頁請求時發生錯誤：', error);
    res.status(500).json({ error: '獲取記錄時發生錯誤' });
  }
}

// 已完成or取消訂單
async function end_order_history(req, res) {
  const id_card = tools.verify_token(req.header.Authorization);
  console.log('目前訂完結訂單使用憑證為：' + id_card);
  try {
    if (id_card) {
      const order_history = await history.get_end_history();
      console.log('我是控制層：', order_history);
      res.json(order_history);
    } else {
      res.json({ login_status: false });
    }
  } catch (error) {
    console.error('處理首頁請求時發生錯誤：', error);
    res.status(500).json({ error: '獲取購買記錄時發生錯誤' });
  }
}

//模糊搜尋訂單 "已完成or取消訂單"(訂購人或編號)
async function end_search_order(req, res) {
  const index = req.body.index;
  const result = await tools.vague_search_order_only_cancel_or_finish(index);
  try {
    if (!result) {
      res.json(false);
    } else {
      console.log(result);
      res.json(result);
    }
  } catch (error) {
    console.error('處理首頁請求時發生錯誤：', error);
    res.status(500).json({ error: '獲取記錄時發生錯誤' });
  }
}

// 更新訂單狀態
async function update_order(req, res) {
  try {
    const status = req.body.purchase_status;
    const id = req.body.user_id;
    const time = req.body.time;
    const update_result = await history.update_purchase_status(
      id,
      time,
      status
    );
    console.log(update_result);
    if (!update_result) {
      console.log('不允許更動');
      res.json(false);
      return;
    }

    const result = await history.get_user_only_purchase_history(id, time);
    const purchases_data = result[0].purchases;
    console.log(purchases_data);
    // 此處塞入修改判定
    if (status == 3) {
      await history.update_user_CA(result[0].user_id, result[0].sum);
      await history.update_user_grade(result[0].user_id);
      for (let i = 0; i < purchases_data.length; i++) {
        const product_name = purchases_data[i].product_name;
        const size_id = purchases_data[i].size;
        const quantity = purchases_data[i].quantity;
        await product.return_stock(product_name, size_id, quantity);
      }
    }

    if (status == 4) {
      await history.create_user_CA(result[0].user_id, result[0].sum);
      await history.update_user_grade(result[0].user_id);
    }



    if (update_result) {
      res.json(result);
    }
  } catch (error) {
    console.error('處理請求時發生錯誤：', error);
    res.status(500).json({ error: '更新訂單時發生錯誤' });
  }
}

// 下載歷史交易紀錄(已完成or取消訂單)
async function download_history_order(req, res) {
  const id_card = tools.verify_token(req.header.Authorization);
  console.log('目前訂完結訂單使用憑證為：' + id_card);
  try {
    if (id_card) {
      const order_history = await history.get_detailed_end_history();
      console.log(order_history[0].purchases);
      const workbook = tools.createExcelReport(order_history);
      // 設定回應標頭以提供下載
      res.setHeader(
        'Content-Disposition',
        'attachment; filename= transaction records.xlsx'
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      // 將 Excel 報表寫入回應流中
      await workbook.xlsx.write(res);
    } else {
      res.json({ login_status: false });
    }
  } catch (error) {
    console.error('創建 Excel 報表時發生錯誤:', error);
    res.status(500).send('內部錯誤');
  }
}

module.exports = {
  purchase_history,
  end_order_history,
  update_order,
  all_search_order,
  end_search_order,
  download_history_order,
};
