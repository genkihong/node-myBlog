const express = require('express');
const router = express.Router();
const moment = require('moment');
const striptags = require('striptags');
const pagination = require('../modules/pagination');
const firebaseAdminDb = require('../connections/firebase_admin');

const categoriesRef = firebaseAdminDb.ref('categories');
const articlesRef = firebaseAdminDb.ref('articles');

/* GET home page. */
// 首頁
router.get('/', (req, res, next) => {
  const currentPage = Number.parseInt(req.query.page) || 1; // 接收前端傳過來參數:目前頁數
  // console.log('目前頁面', currentPage);
  let categories = {};
  categoriesRef.once('value').then((snapshot) => { // 取得所有分類
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value'); // 取得所有文章並且依照時間排序
  })
  .then((snapshot) => {
    const articles = [];
    snapshot.forEach(function(snapshotChild) {
      if ('public' === snapshotChild.val().status) { // 文章 status === public
        articles.push(snapshotChild.val()); // 將每一篇文章 article 物件存到 articles 陣列
      }
    });
    articles.reverse();
    const Pages = pagination(articles, currentPage);
    
    /* 分頁 start
    const totalResult = articles.length; // 資料總數
    const perPage = 2; // 每頁 n 筆資料
    const totalPages = Math.ceil(totalResult / perPage); // 總頁數
    // let currentPage = 1; // 目前頁數
    if (currentPage > totalPages) {
      currentPage = totalPages; // 目前頁數若大於總頁數，就等於總頁數
    }
    // 每頁要呈現的第 min ~ max 筆資料計算公式
    const minNum = (currentPage * perPage) - perPage + 1; // (1~2,3~4,5~6)
    const maxNum = currentPage * perPage;

    const data = [];
    articles.forEach(function(item, i) {
      let itemNum = i + 1;
      if (itemNum >= minNum && itemNum <= maxNum ) { // 只顯示在此範圍的資料(1~2,3~4,5~6)
        // console.log(item.title, i);
        data.push(item);
      }
    });
    const page = {
      totalPages, // 總頁數
      currentPage, // 目前第幾頁
      hasPrepage: currentPage > 1, // 上一頁
      hasNextpage: currentPage < totalPages, // 下一頁        
    }
    // console.log('資料總數', totalResult, '每頁資料數', perPage, '總頁數', totalPages, '每頁第一資料', minNum, maxNum);
    分頁 end */
    res.render('archive', {
      categories, // 文章分類
      categoryId: null,
      articles: Pages.data,  // 所有文章
      striptags, // 限制字數
      moment,    // 時間
      page: Pages.page,
    });
  });
});
// 文章分類
router.get('/:category', (req, res) => {
  const currentPage = Number.parseInt(req.query.page) || 1;
  const categoryPath = req.params.category;
  // console.log('categoryPath:', categoryPath);
  let categories = {};
  let categoryId = '';
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val().path === categoryPath) { // 有相同分類路徑
        categoryId = childSnapshot.val().id; // 取得分類 ID
        // console.log('categoryId:', categoryId);
      }
    });
    return articlesRef.orderByChild('update_time').once('value');
  })
  .then((snapshot) => {
    const articles = [];
    snapshot.forEach(function(snapshotChild) {
      if (categoryId === snapshotChild.val().category) { // 分類 ID === 文章分類
        articles.push(snapshotChild.val()); // 將每一篇文章 article 物件存到 articles 陣列
      }
    });
    // 分頁
    const Pages = pagination(articles, currentPage, `/${categoryPath}`);
    // console.log('分類資料', Pages.data);
    res.render('archive', {
      categories,
      categoryId,
      articles: Pages.data,
      page: Pages.page,
      striptags,
      moment,
    });
  });
});
// 單一文章
router.get('/post/:id', (req, res, next) => {
  const id = req.params.id;
  // console.log('articleID', id);
  let categories = {}; 
  categoriesRef.once('value').then(function(snapshot) { // 取得所有分類
    categories = snapshot.val();
    return articlesRef.child(id).once('value'); // 取得單一篇文章
  })
  .then(function(snapshot) {
    const article = snapshot.val();
    // console.log('文章', article);
    if (!article) {
      return res.render('error', {
        title: '找不到該文章 !'
      });
    }
    res.render('post', {
      categories,
      categoryId: null,
      article, // 單一篇文章
      moment
    });
  });
});

module.exports = router;
