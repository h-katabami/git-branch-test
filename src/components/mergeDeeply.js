function mergeDeeply(target, source, opts) {
  // オブジェクトかどうかをチェックするヘルパー関数
  const isObject = (obj) =>
    obj && typeof obj === "object" && !Array.isArray(obj);
  // 配列を結合するかどうかのオプションをチェック
  const isConcatArray = opts && opts.concatArray;

  // ターゲットオブジェクトのシャローコピーを作成
  let result = Object.assign({}, target);

  // ターゲットとソースの両方がオブジェクトであるかを確認
  if (isObject(target) && isObject(source)) {
    // ソースオブジェクトのすべてのエントリをループ
    for (const [sourceKey, sourceValue] of Object.entries(source)) {
      const targetValue = target[sourceKey];

      // オプションが有効で、両方の値が配列の場合、結合する
      if (
        isConcatArray &&
        Array.isArray(sourceValue) &&
        Array.isArray(targetValue)
      ) {
        result[sourceKey] = targetValue.concat(...sourceValue);
      }
      // 値がオブジェクトで、ターゲットにそのキーが存在する場合、再帰的に深く結合する
      else if (isObject(sourceValue) && target.hasOwnProperty(sourceKey)) {
        result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
      }
      // 上記のいずれでもない場合、単純にプロパティを上書きする
      else {
        Object.assign(result, { [sourceKey]: sourceValue });
      }
    }
  }
  return result;
}
