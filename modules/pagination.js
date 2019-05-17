
const pagination = function (articles, currentPage, route = '/') {
  // console.log('currentPage:', currentPage, 'route:', route);
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
    route,
    totalPages, // 總頁數
    currentPage, // 目前第幾頁
    hasPrepage: currentPage > 1, // 上一頁
    hasNextpage: currentPage < totalPages, // 下一頁        
  }
  return {
    page,
    data
  };
  // console.log('資料總數', totalResult, '每頁資料數', perPage, '總頁數', totalPages,
  //  '每頁第一資料', minNum, maxNum);
}

module.exports = pagination;