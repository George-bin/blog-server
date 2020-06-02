/**
 * 更新文档参数过滤
 * @params obj: 更新的文档对象
 */
function updateDocPropsFilter(obj) {
  obj = JSON.parse(JSON.stringify(obj));
  delete obj['_id'];
  delete obj['__v'];
  return obj;
}

module.exports = {
  updateDocPropsFilter
}
