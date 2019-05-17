const express = require('express');
const router = express.Router();
const firebase = require('../connections/firebase_client');
const firebaseAdminDb = require('../connections/firebase_admin');

// 註冊頁面
router.get('/signup', (req, res) => {
  const messages = req.flash('error');
  res.render('dashboard/signup', {
    messages,
    hasErrors: messages.length > 0,
  });
});
// 註冊成功
router.get('/success', (req, res) => {
  res.render('success', {
    title:'註冊成功'
  });
});
// 登入頁面
router.get('/signin', (req, res) => {
  const messages = req.flash('error');
  res.render('dashboard/signin', {
    messages,
    hasErrors: messages.length > 0,
  });
});
// 登出
router.get('/signout', (req, res) => {
  req.session.uid = '';
  res.redirect('/auth/signin');
});

// 註冊 API
router.post('/signup', (req, res) => { // 接收 signup 傳來的帳號，密碼，暱稱
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;
  if (password !== confirmPassword) {
    req.flash('error', '兩個密碼輸入不符合');
    res.redirect('/auth/signup');
  }
  firebase.auth().createUserWithEmailAndPassword(email, password) // 在 firebase 註冊帳號,密碼   
  .then((user) => {
    // console.log(user, email, password);
    const regUser = {
      email,
      uid: user.user.uid
    };
    console.log('註冊資料', regUser);
    // firebaseAdminDb.ref(`user/${user.user.uid}`).set(regUser); // 將註冊資料寫入資料庫
    res.redirect('/auth/success'); // 註冊成功，轉址到 success
  })
  .catch((error) => {
    console.log('錯誤訊息', error);
    req.flash('error', error.message);
    res.redirect('/auth/signup'); // 註冊失敗，轉址到 signup
  });
});

// 登入 API
router.post('/signin', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((user) => {
    req.session.uid = user.user.uid;
    req.session.mail = req.body.email;
    console.log('session.uid', req.session.uid);
    res.redirect('/dashboard'); // 登入成功，轉址到 dashboard
  })
  .catch((error) => {
    console.log(error);
    req.flash('error', error.message);
    res.redirect('/auth/signin');
  });
});

module.exports = router;