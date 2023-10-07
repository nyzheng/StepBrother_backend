# **Step Brother center console**
 # **中控室**
 >屬於業主的控制台，可以對訂單，會員做控管

## **管理員登入頁**

>此處輸入 Account ＆ Password 

- **URL**
  >/stepbrothers/console/login_page

- **Method:**

  `GET`

-  **Required:**  
  `none`

- **Success Response:**
  >已經是登入狀態
  - **Code:** 200 <br />
    **Content:**
    `HTML 內容(進入轉跳頁提示已經登入，再導向至訂單管理頁)`
    <br />
    ```json
      {
      "login_status":true
      }
    ```

- **Error Response:**
  >不是登入狀態
  - **Code:** 401 <br />
    **Content:**
    `HTML 內容(登入頁頁面)`
    ```json
      {
      "login_status":false
      }
    ```
    
<!-- 分隔線 -->

### **登入**

  >送出 Account ＆ Password

  **URL**
  >/stepbrothers/console/login

- **Method:**

  `POST`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
      "account": "NianYaoBro",
      "password": "password123"
      }
    ```

- **Success Response:**
  >登入成功
  - **Code:** 200 <br />
    **Content:**
    `HTML 內容(進入轉跳頁提示登入成功，再導向至訂單管理頁)`
    <br />
    ```json
      {
      "login_status":true
      }
    ```

- **Error Response:**
  >登入失敗
  - **Code:** 401 <br />
    **Content:**
    `HTML 內容(登入頁頁面)`
    ```json
      {
      "login_status":false
      }
    ```
<!-- 分隔線 -->

## **訂單管理**
  >管理員的訂單控管頁，等同管理員首頁

  - **URL**
    /stepbrothers/console/order_management_page

  - **Method:**

    `GET`

  - **URL Params**

    `none`

  -  **Required:**

     `none`

  - **Success Response:**

    - **Code:** 200 <br />
      **Content:**

      `顯示所有可以控管的訂單(限制僅能修改狀態purchase_status:1 or 2 or 3 or 4)`
      ```json
      [
        
        {
            "id": 1,
            "time": "2023-07-21 14:55:10",
            "user_id": 1,
            "name": "王瀚邑",
            "recipient_name": "王瀚邑(測試)",
            "recipient_phone": "0973506316",
            "recipient_address": "測試路1巷1號",
            "purchases": [
                {
                    "brand_name": "Adidas",
                    "product_name": "ADI2000 X W",
                    "size": 12,
                    "price": 2700,
                    "quantity": 5,
                    "subtotal": 13500,
                    "purchase_status": 1
                }
            ],
            "sum": 13500
        },
        {
            "id": 2,
            "time": "2023-07-21 15:18:36",
            "user_id": 2,
            "name": "NianYaoBro",
            "recipient_name": "NianYaoBro",
            "recipient_phone": "0912345678",
            "recipient_address": "高雄市前金區五福三路63號11樓",
            "purchases": [
                {
                    "brand_name": "NEW BALANCE",
                    "product_name": "1880",
                    "size": 9,
                    "price": 2400,
                    "quantity": 1,
                    "subtotal": 2400,
                    "purchase_status": 1
                },
                {
                    "brand_name": "PUMA",
                    "product_name": "RS-X Elevated Hike",
                    "size": 9,
                    "price": 3800,
                    "quantity": 5,
                    "subtotal": 19000,
                    "purchase_status": 1
                },
                {
                    "brand_name": "NEW BALANCE",
                    "product_name": "996",
                    "size": 9,
                    "price": 1300,
                    "quantity": 1,
                    "subtotal": 1300,
                    "purchase_status": 1
                }
            ],
            "sum": 22700
        },
      ]
    ```
<!-- 分隔線 -->

### **所有訂單模糊搜尋**

  >以訂單編號或訂購人關鍵字來搜尋訂單。

  **URL**
  >/stepbrothers/console/all_order_vague_search

- **Method:**

  `POST`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "index": "王瀚邑",
      }
    ```
    - **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    `展開商品內容(當前商品狀態詳情含庫存)`
    ```json
    [
        
        {
            "id": 1,
            "time": "2023-07-21 14:55:10",
            "user_id": 1,
            "name": "王瀚邑",
            "recipient_name": "王瀚邑(測試)",
            "recipient_phone": "0973506316",
            "recipient_address": "測試路1巷1號",
            "purchases": [
                {
                    "brand_name": "Adidas",
                    "product_name": "ADI2000 X W",
                    "size": 12,
                    "price": 2700,
                    "quantity": 5,
                    "subtotal": 13500,
                    "purchase_status": 1
                }
            ],
            "sum": 13500
        },
      ]
    ```
<!-- 分隔線 -->

### **訂單狀態確認變更**

  >送出訂單狀態變更

  **URL**
  >/stepbrothers/console/switch_order_status

- **Method:**

  `PUT`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "user_id": 2,
        "time": "2023-07-21 15:18:36",
        "purchase_status": 2
      }
    ```

- **Success Response:**
  >更改成功
  - **Code:** 200 <br />
    **Content:**
    `(回傳更新後訂單狀態)`
    <br />
    ```json
      [
    {
        "id": 32,
        "time": "2023-07-26 13:50:55",
        "user_id": 3,
        "name": "yukai",
        "recipient_name": "NianYaoBro",
        "recipient_phone": "0912345678",
        "recipient_address": "高雄市前金區五福三路63號11樓",
        "purchases": [
            {
                "brand_name": "PUMA",
                "product_name": "All-Day Active SlipOn",
                "size": 9,
                "price": 1980,
                "quantity": 1,
                "subtotal": 1980,
                "purchase_status": 3
            },
            {
                "brand_name": "NIKE",
                "product_name": "React Infinity FK 3",
                "size": 9,
                "price": 3100,
                "quantity": 7,
                "subtotal": 21700,
                "purchase_status": 3
            }
        ],
        "sum": 5080
    }
]
    ```

- **Error Response:**
  >更改失敗
  - **Code:** 401 <br />
    **Content:**
    `(回傳錯誤狀態)`
    ```json
      {
      "purchase_status": false
      }
    ```
<!-- 分隔線 --> 

## **產品管理頁**
>產品管控頁，可以編輯倉庫數量及上架

- **URL**
  /stepbrothers/console/merchandise_management_page

- **Method:**

  `GET`

- **URL Params**

  `none`

-  **Required:**

   `none`

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    `HTML內容(當前商品狀態簡述)`
    ```json
    [
      {
        "id": 1,
        "brand_name": "NEW BALANCE",
        "product_name": "1880",
        "price": 2400,
        "class": "man",
        "product_data_status": 1
      },
      {
        "id": 1,
        "brand_name": "NEW BALANCE",
        "product_name": "1880",
        "price": 2400,
        "class": "man",
        "product_data_status": 1
      }
     ]
    ```
<!-- 分隔線 -->

### **產品模糊搜尋**

  >以品牌或品名關鍵字來搜尋商品。

  **URL**
  >/stepbrothers/console/product_search

- **Method:**

  `POST`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "index": "nik",
      }
    ```
    - **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    `展開商品內容(當前商品狀態詳情含庫存)`
    ```json
    [
      {
        "id": 6,
        "brand_name": "NIKE",
        "product_name": "Air Jordan 1 Low Craft",
        "price": 4500,
        "class": "man"
      },
      {
        "id": 7,
        "brand_name": "NIKE",
        "product_name": "Invincible Run 3",
        "price": 5500,
        "class": "man"
      },
    ]
    ```
<!-- 分隔線 -->

### **展開商品狀態**

  >展開商品，上架、下架、價格、尺寸庫存數量，有輸入格可以異動。

  **URL**
  >/stepbrothers/console/product_open_storage

- **Method:**

  `GET`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "product_id": 31,
      }
    ```
    - **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    `展開商品內容(當前商品狀態詳情含庫存)`
    ```json
    {
        "product_id": 31,
        "product_status":1,
        "size_stcok": [
          { "size": 1, "stock": 10 },
          { "size": 2, "stock": 10 },
          { "size": 3, "stock": 10 },
          { "size": 4, "stock": 10 },
          { "size": 5, "stock": 10 },
          { "size": 6, "stock": 10 },
          { "size": 7, "stock": 10 },
          { "size": 8, "stock": 10 },
          { "size": 9, "stock": 10 },
          { "size": 10, "stock": 10 },
          { "size": 11, "stock": 10 },
          { "size": 12, "stock": 10 }
          ],
      "price": 2400,
    }
    ```
### **確認更新**

  >送出訂單狀態變更

  **URL**
  >/stepbrothers/console/product_update

- **Method:**

  `PUT`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "product_id": 31,
        "product_status":1,
        "size_stcok": [
            { "size": 1, "stock": 10 },
            { "size": 2, "stock": 10 },
            { "size": 3, "stock": 10 },
            { "size": 4, "stock": 10 },
            { "size": 5, "stock": 10 },
            { "size": 6, "stock": 10 },
            { "size": 7, "stock": 10 },
            { "size": 8, "stock": 10 },
            { "size": 9, "stock": 10 },
            { "size": 10, "stock": 10 },
            { "size": 11, "stock": 10 },
            { "size": 12, "stock": 10 }
            ],
        "price": 2400,
      }
    ```
- **Success Response:**
  >回傳詳情
  - **Code:** 200 <br />
    **Content:**
    `回傳刷新資訊(此處會回傳更新後的商品狀態)`
    
    ```json
        {
          "id": 1,
          "product_name": "1880",
          "update_product_data": true  
        }
    ```

<!-- 分隔線 --> 

## **會員總覽頁**
    >管理員的會員顯示頁，僅能觀看者相關資訊

  - **URL**
    /stepbrothers/console/all_user_page

  - **Method:**

    `GET`

  - **URL Params**

    `none`

  -  **Required:**

     `none`

  - **Success Response:**

    - **Code:** 200 <br />
      **Content:**

      `顯示所有會員(唯讀)`
      ```json
      [
        {
          "id": 3,
          "account": "kaikai",
          "name": "yukai",
          "phone": "0911223344",
          "mail": "zxc4885bsd@gmail.com",
          "grade": 3,
          "create_time": "2023/07/24 11:17:22",
          "update_time": "2023/08/07 22:54:25",
          "purchase_CA": 1000,
          "login_status": 1
        },
        {
          "id": 2,
          "account": "kaikai",
          "password": "password456",
          "name": "yukai",
          "phone": "0911223344",
          "mail": "zxc4885bsd@gmail.com",
          "grade": 3,
          "create_time": "2023/07/24 11:17:22",
          "update_time": "2023/08/07 22:54:25",
          "purchase_CA": 0,
          "login_status": 1
        }
      ]
      ```

## **產品上架頁**
>可以輸入即將上架商品之相關資訊及照片

  - **URL**
    /stepbrothers/console/product_on_shelves_page

  - **Method:**

    `GET`

  - **URL Params**

    `none`

  -  **Required:**

     **Body:**
    >給予商品照片的品牌
    ```json
      [
      { "id": 1, "brand_name": "Adidas" },
      { "id": 2, "brand_name": :"Converse" },
      { "id": 3, "brand_name": "FILA" },
      { "id": 4, "brand_name": "Jordan" },
      { "id": 5, "brand_name": "NEW BALANCE" },
      { "id": 6, "brand_name": "NIKE" },
      { "id": 7, "brand_name": "PUMA" },
      { "id": 8, "brand_name": "Reebok" },
      { "id": 9, "brand_name": "Timberland" },
      { "id": 10, "brand_name": "Under Armour" },
      { "id": 11, "brand_name": "VANS" },
      { "id": 12, "brand_name": "其他品牌" }
    ]
    ```
<!-- 分隔線 -->

### **確認上架**

>將商品資料匯入系統，預設顯示為下架狀態

- **URL**
  >/stepbrothers/console/submit_on_shelves

- **Method:**

  `POST`

- **URL Params**

  `none`

-  **Required:**
    **Body:**
    >送出商品照片的品牌、名稱、價錢及類別(性別)
    ```json
    {
      "files": [
        {image_1},
        {image_2},
        {image_3}
        ],
      "brand": 1,
      "product_name": "1880",
      "price": 2400,
      "class": 1
    }
    ```

- **Success Response:**
  
  - **Code:** 200 <br />
    **Content:**
    `上架成功`
     <br />
     ```json
     {
      "shelves_status": true,
      "message": "商品上架成功"
      }
    ```

- **Error Response:**

  - **Code:** 400 <br />
    **Content:** 
    `上架失敗`
    ```json
    {
      "shelves_status": false,
      "message": "商品上架失敗，請再檢查相關資訊"
    }
    ```
<!-- 分隔線 -->

## **交易紀錄**
>可以查看已完成交易訂單記錄(唯獨)，可以看見的僅取消或完成之訂單。

- **URL**
  >/stepbrothers/all_purchase_history_page

- **Method:**

  `POST`

- **URL Params**

  `none`

  **Required:**

  `none`

- **Success Response:**
  
   >訂單記錄頁

  - **Code:** 200 <br />
    **Content:**

     ```json
    [
      {
        "id": 1,
        "user_id": 2,
        "recipient_name": "NianYaoBro",
        "recipient_phone": "0912345678",
        "recipient_address": "高雄市前金區五福三路63號11樓",
        "brand_name": "NEW BALANCE",
        "product_name": '1880',
        "price": 2400,
        "us_size": 9,
        "shopping_car_id": 4,
        "quantity": 1,
        "subtotal": 2400,
        "sum": 2400,
        "purchase_status": 3,
        "create_time": "2023/07/21 15: 18: 36"
      },
      {
        "id": 2,
        "user_id": 2,
        "recipient_name": "NianYaoBro",
        "recipient_phone": "0912345678",
        "recipient_address": "高雄市前金區五福三路63號11樓",
        "brand_name": "NEW BALANCE",
        "product_name": '1880',
        "price": 2400,
        "us_size": 9,
        "shopping_car_id": 5,
        "quantity": 1,
        "subtotal": 2400,
        "sum": 2400,
        "purchase_status": 4,
        "create_time": "2023/07/21 15: 18: 36"
      }
    ]
    ```
<!-- 分隔線 -->

### **結束訂單模糊搜尋**

  >以訂單編號或訂購人關鍵字來搜尋訂單。

  **URL**
  >/stepbrothers/console/end_order_vague_search

- **Method:**

  `POST`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "index": "王瀚邑",
      }
    ```
    - **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    `展開商品內容(當前商品狀態詳情含庫存)`
    ```json
    [
      {
        "id": 5,
        "name": "ben2002204",
        "recipient_name": "草擬馬",
        "recipient_phone": "0912345678",
        "recipient_address": "高雄市版和有限公司",
        "product_id": 5,
        "quantity": 5,
        "subtotal": 18000,
        "sum": 16200,
        "purchase_status": 3,
        "create_time": "2023/08/21 11:23:30"
      },
      {
          "id": 6,
          "name": "ben2002204",
          "recipient_name": "nyz_1994",
          "recipient_phone": "0976876123",
          "recipient_address": "高雄市版和有限公司",
          "product_id": 8,
          "quantity": 2,
          "subtotal": 9800,
          "sum": 8820,
          "purchase_status": 3,
          "create_time": "2023/08/21 15:42:32"
      }
    ]
    ```

    
<!-- 分隔線 -->
### **下載結束訂單紀錄**

  >完成或取消的訂單記錄Excel紀錄檔下載

  **URL**
  >/stepbrothers/console/download_history_order

- **Method:**

  `GET`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    - **Success Response:**

  - **Code:** 200 <br />
    **Content:**
    >下載Excel檔

## **客服ＱＡ管理頁**
>客服ＱＡ管控頁，可以編輯客服ＱＡ相關內容

- **URL**
  /stepbrothers/console/service_QA_page

- **Method:**

  `GET`

- **URL Params**

  `none`

-  **Required:**

   `none`

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    `HTML內容(客服問題)`
    ```json
     [
      {
        "id": 1,
        "question": "如何更改會員資料",
        "answer": "前往修改資料，直接針對可修改內容進行修改後，點擊確認修改，即可修改資料，特別注意密碼需要再次輸入確認密碼後才可修改唷!",
        "exist_status": 1
      },
      {
        "id": 2,
        "question": "會員等級計算方式",
        "answer": "會員累積消費滿5000時將成為銀牌會員，銀牌折扣9.5折，會員累積消費滿10000時將成為金牌會員，金牌折扣9折。",
        "exist_status": 1
      }
     ]
    ```
<!-- 分隔線 -->

### **新增客服問題**

  >新增ＱＡ。

  **URL**
  >/stepbrothers/console/add_service_QA

- **Method:**

  `POST`
- **URL Params**

  `none`

- **Required:**
      **Body:**
       ```json
      {"question""XXXX?",
      "answer":"XXXXXX,XXXXX"
      }
    
    - **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    `回傳新增成功訊息`
    ```json
    {
      "add_QA": true
      }
    ```
<!-- 分隔線 -->

### **移除客服問題**

  >移除ＱＡ。

  **URL**
  >/stepbrothers/console/remove_service_QA

- **Method:**

  `PUT`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "QA_id": 1,
      }
    ```
    - **Success Response:**

  - **Code:** 200 <br />
    **Content:**

    `回傳移除成功訊息`
    ```json
    {
      "delete_QA: true": true
      }
    ```
### **修改客服問題**

  >修改既有客服問題

  **URL**
  >/stepbrothers/console/update_service_QA

- **Method:**

  `PUT`
- **URL Params**

  `none`

- **Required:**
      **Body:**

    ```json
      {
        "QA_id":1,
        "question":"XXXX",
        "answer":"XXXXX"
      }
    ```
- **Success Response:**
  >回傳詳情
  - **Code:** 200 <br />
    **Content:**
    `(回傳更新客服問題成功)`
    
    ```json
        {
        "update_QA": true
      }
    ```

<!-- 分隔線 --> 
