const service = require('../model/service_question_model');
const tools = require('../model/tool_model');
//取得所有ＱＡ
async function getServiceQuestion(req, res) {
  const id_card = tools.verify_token(req.header.Authorization);
  console.log('目前所有ＱＡ頁使用憑證為：' + id_card);
  try {
    if (id_card) {
      const service_QA_data = await service.get_customer_service_QA();
      console.log('取得ＱＡ');
      res.json(service_QA_data);
    } else {
      res.json({ login_status: false });
    }
  } catch (error) {
    console.error('處理請求時發生錯誤：', error);
    res.status(500).json({ error: '獲取所有QA時發生錯誤' });
  }
}

// 新增ＱＡ
async function add_new_QA(req, res) {
  const id_card = tools.verify_token(req.header.Authorization);
  console.log('目前新增ＱＡ使用憑證為：' + id_card);
  try {
    if (id_card) {
      const question = req.body.question;
      const answer = req.body.answer;
      const new_QA_data = await service.create_customer_service_QA(
        question,
        answer
      );
      console.log('新的ＱＡ！');
      res.json({ add_QA: true });
    } else {
      res.json({ login_status: false });
    }
  } catch (error) {
    console.error('處理請求時發生錯誤：', error);
    res.status(500).json({ error: '新增QA時發生錯誤' });
  }
}

// 移除ＱＡ
async function remove_QA(req, res) {
  const id_card = tools.verify_token(req.header.Authorization);
  console.log('目前移除ＱＡ使用憑證為：' + id_card);
  try {
    if (id_card) {
      const QA_id = req.body.QA_id;
      const delete_QA_data = await service.delete_customer_service_QA(QA_id);
      console.log('移除ＱＡ!');
      res.json({ delete_QA: true });
    } else {
      res.json({ login_status: false });
    }
  } catch (error) {
    console.error('處理請求時發生錯誤：', error);
    res.status(500).json({ error: '移除QA時發生錯誤' });
  }
}

// 異動ＱＡ
async function update_QA(req, res) {
  const id_card = tools.verify_token(req.header.Authorization);
  console.log('目前異動ＱＡ使用憑證為：' + id_card);
  try {
    if (id_card) {
      const QA_id = req.body.QA_id;
      const question = req.body.question;
      const answer = req.body.answer;
      const update_QA_data = await service.use_id_update_customer_service_QA(
        QA_id,
        question,
        answer
      );
      console.log('異動ＱＡ！');
      res.json({ update_QA: true });
    } else {
      res.json({ login_status: false });
    }
  } catch (error) {
    console.error('處理請求時發生錯誤：', error);
    res.status(500).json({ error: '異動QA時發生錯誤' });
  }
}

module.exports = {
  getServiceQuestion,
  add_new_QA,
  remove_QA,
  update_QA,
};
