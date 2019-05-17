const express = require('express');
const router = express.Router();
const moment = require('moment');
const striptags = require('striptags');
const pagination = require('../modules/pagination');
const firebaseAdminDb = require('../connections/firebase_admin');

const categoriesRef = firebaseAdminDb.ref('categories');
const articlesRef = firebaseAdminDb.ref('articles');

// 後台首頁
router.get('/', (req, res, next) => {
  console.log('後台首頁');
  const messages = req.flash('info');
  res.render('dashboard/index', {
    currentPath: '/',
    hasInfo: messages.length > 0,
  });
});
// 所有文章列表
router.get('/archives', (req, res, next) => {
  const messages = req.flash('info');
  const status = req.query.status || 'public';
  let currentPage = Number.parseInt(req.query.page) || 1;
  console.log('currentPage:', currentPage, 'status:', status);
  let categories = {}; 
  categoriesRef.once('value')
  .then((snapshot) => { // 取得所有分類
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value'); // 取得所有文章依照時間排序
  })
  .then((snapshot) => {
    const articles = [];
    snapshot.forEach((snapshotChild) => {
      // console.log('child', snapshotChild.val());
      if (status === snapshotChild.val().status) {
        articles.push(snapshotChild.val()); // 將每一篇文章 article 物件存到 articles 陣列
      }
    });
    articles.reverse();
    // 分頁
    const Pages = pagination(articles, currentPage, `/dashboard/archives?status=${status}`);
    res.render('dashboard/archives', {
      categories,// 文章分類
      articles: Pages.data,  // 所有文章
      currentPath: '/archives/',
      striptags, // 限制字數
      moment,    // 時間
      status,     // 公開/草稿
      page: Pages.page, // 分頁
      messages,
      hasInfo: messages.length > 0 // 錯誤訊息
    });
  });
});
// 新增文章頁面
router.get('/article/create', (req, res, next) => {
  const messages = req.flash('info');
  categoriesRef.once('value')
  .then((snapshot) => {
    const categories = snapshot.val();
    res.render('dashboard/article', {
      categories,
      currentPath: '/article/create',
      messages,
      hasInfo: messages.length > 0,
    });
  });
});
// 新增後/更新文章頁面(有 id)
router.get('/article/:id', (req, res, next) => {
  const messages = req.flash('info');
  const id = req.params.id;
  let categories = {}; 
  categoriesRef.once('value')
  .then((snapshot) => { // 取得所有分類
    categories = snapshot.val();
    return articlesRef.child(id).once('value'); // 取得單一篇文章
  })
  .then((snapshot) => {
    const article = snapshot.val();
    // console.log('分類', categories);
    // console.log('文章', article);
    res.render('dashboard/article', {
      categories,
      article, // 單一篇文章
      currentPath: '/article/',
      messages,
      hasInfo: messages.length > 0,
    });
  });  
});
// 文章分類
router.get('/categories', (req, res, next) => {
  const messages = req.flash('info');
  categoriesRef.once('value')
  .then((snapshot) => {
    const categories = snapshot.val();
    res.render('dashboard/categories', {
      categories,
      currentPath: '/categories/',
      messages,
      hasInfo: messages.length > 0
    });
  });
});

/*-- 文章 API --*/

// 新增文章 API
router.post('/article/create', (req, res) => {
  const data = req.body;
  // console.log('新增文章', data);
  const articleRef = articlesRef.push();
  const key = articleRef.key;
  // console.log('新增文章key', key);
  const updateTime = Math.floor(Date.now() / 1000);
  data.id = key;
  data.update_time = updateTime;
  articleRef.set(data)
  .then(() => { // 新增文章到資料庫後，就轉址到 dashboard/article/${key}
    res.redirect(`/dashboard/article/${key}`);
  });
});
// 更新文章 API
router.post('/article/update/:id', (req, res) => {
  const data = req.body;
  const id = req.params.id;
  // console.log('Id', id); 
  articlesRef.child(id).update(data)
  .then(() => {
    res.redirect(`/dashboard/article/${id}`);
  });
});
// 刪除文章 API
router.post('/article/delete/:id', (req, res) => {
  const id = req.params.id;
  articlesRef.child(id).remove();
  req.flash('info', '文章已刪除');
  res.send('文章已刪除');
});
// 新增分類 API
router.post('/categories/create', (req, res) => {
  const data = req.body;
  const categoryRef = categoriesRef.push();
  const key = categoryRef.key;
  // console.log('新增分類key', key);  
  data.id = key;
  categoriesRef.orderByChild('path').equalTo(data.path).once('value')
  .then((snapshot) => { // 判斷資料庫內是否有相同的路徑
    if (snapshot.val() !== null) { // 有值表示有相同的路徑，轉址到 dashboard/categories
      req.flash('info', '已有相同路徑');
      res.redirect('/dashboard/categories');
    } else { // 空值表示沒有相同路徑，寫入資料庫，轉址到轉址到 dashboard/categories
      categoryRef.set(data).then(() => { 
        res.redirect('/dashboard/categories');
      });
    }
  });
});
// 刪除分類 API
router.post('/categories/delete/:id', (req, res) => {
  // const id = req.param('id');
  const id = req.params.id;
  categoriesRef.child(id).remove();
  req.flash('info', '欄位已刪除');
  res.redirect('/dashboard/categories');
});


module.exports = router;