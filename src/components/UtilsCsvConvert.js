// utils.js
/**
 * 住所文字列から都道府県名を抽出します。
 * @param {string} originalAddress - 処理する住所文字列
 * @returns {string} - 抽出された都道府県名、または空文字列
 */
export const extractPrefecture = (originalAddress) => {
  if (!originalAddress || typeof originalAddress !== "string") {
    return "";
  }
  // 句読点を全て除去
  const cleanedAddress = originalAddress.replace(/[.,、。]/g, "");

  const prefectures = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ];

  for (const prefecture of prefectures) {
    if (cleanedAddress.includes(prefecture)) {
      return prefecture;
    }
  }

  return "";
};

/**
 * APIから取得した通話履歴の配列をCSV形式の文字列に変換
 * @param {Array<Object>} data - APIからのレスポンス配列
 * @returns {string} - CSV形式の文字列
 */
export const convertToCsv = (data) => {
  // 値を""で囲み、内部の特殊文字をエスケープするヘルパー関数
  const wrapInQuotes = (value) => {
    // 値がnullまたはundefinedの場合は空文字列に変換
    const safeValue = value ? value.toString() : "";
    // 二重引用符を""に、改行を削除
    const escapedValue = safeValue.replace(/"/g, '""').replace(/\n/g, "");
    return `"${escapedValue}"`;
  };
  /**
   * 日付オブジェクトを YYYYMMDDhhss 形式の文字列に変換するヘルパー関数
   * @param {Date} date - 変換するDateオブジェクト
   * @returns {string} - YYYYMMDDhhss 形式の文字列
   */
  const formatDateForCsv = (date) => {
    if (!date) {
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    // const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hours}${minutes}`;
  };
  /**
   * API配列から特定のquestion_idに対応するresultの値を返します。
   * @param {Array<Object>} apiInputs - APIレスポンスのapi配列
   * @param {string} questionId - 検索するquestion_id
   * @returns {string} - 見つかったresultの値、または空文字列
   */
  const getApiResult = (apiInputs, questionId) => {
    if (!apiInputs || !Array.isArray(apiInputs)) {
      return "";
    }
    const resultObject = apiInputs.find(
      (input) => input.question_id === questionId
    );
    return resultObject?.result?.result ?? "";
  };
  /**
   * user_inputsから特定の質問IDの値を取得するヘルパー関数
   * @param {Object} item - APIレスポンスの単一の通話履歴オブジェクト
   * @param {string} questionId - 検索する質問ID
   * @returns {string} - 見つかった入力値、または空文字列
   */
  const getUserInput = (item, questionId) => {
    if (!item.user_inputs || !Array.isArray(item.user_inputs)) {
      return "";
    }
    const inputObject = item.user_inputs.find(
      (input) => input.question_id === questionId
    );
    return inputObject ? inputObject.input : "";
  };
  /**
   * 文字列から特定の全角カタカナのノイズを削除する関数
   * @param {string} name - クリーンアップする文字列（名前など）
   * @returns {string} - ノイズが削除された文字列
   */
  const removeNoiseFromName = (name) => {
    if (!name || typeof name !== "string") {
      return "";
    }
    return name
      .replace(/^(モシモシ|アモシモシ|アーモシモシ|アモシー)/g, "")
      .replace(/^(エット|エイト|エート|アエット|エイ)/g, "")
      .replace(/(デス|デイス|デスウ|デイスウ|デヨス|デエス)$/g, "")
      .replace(/(モウシマス|モオシマス|モオシマ|モウシマスウ)$/g, "")
      .replace(/(イイマス|イマス|イーマス|イマース|トイイマスウ)$/g, "")
      .replace(/(オネガイシマス|オネガイシマアス|オネガイタシマス)$/g, "")
      .replace(/(ヨロシク|ヨシク|ヨロシクオネガイシマス)$/g, "");
  };

  /**
   * +81で始まる電話番号を0で始まる日本の電話番号に変換する関数
   * @param {string} number - 変換する電話番号
   * @returns {string} - 0で始まる電話番号
   */
  const convertToJapaneseNumber = (number) => {
    if (typeof number !== "string" || !number.startsWith("+81")) {
      return number;
    }
    return `0${number.substring(3)}`;
  };
  /**
   * user_inputsから、最新の「郵便番号」と「郵便番号確認」の入力に基づいて郵便番号を返す関数
   * @param {Array<Object>} userInputs - user_inputs 配列
   * @returns {string} - 条件に合致した郵便番号、または空文字列
   */
  const getVerifiedPostalCode = (userInputs) => {
    if (!userInputs || !Array.isArray(userInputs)) {
      return "";
    }

    // 郵便番号と郵便番号確認の入力をフィルタリング
    const postalCodeInputs = userInputs.filter(
      (input) => input.question_id === "郵便番号"
    );
    const verificationInputs = userInputs.filter(
      (input) => input.question_id === "郵便番号確認"
    );

    // 最新の郵便番号と確認の入力を取得
    const latestPostalCode = postalCodeInputs.sort(
      (a, b) => new Date(b.created_time) - new Date(a.created_time)
    )[0];
    const latestVerification = verificationInputs.sort(
      (a, b) => new Date(b.created_time) - new Date(a.created_time)
    )[0];

    // 両方が存在し、かつ最新の郵便番号確認が 'YES' の場合に郵便番号を返す
    if (
      latestPostalCode &&
      latestVerification &&
      latestVerification.input === "YES"
    ) {
      // 郵便番号からハイフンを削除して返す
      return latestPostalCode.input.replace(/-/g, "");
    }

    return ""; // 条件を満たさない場合は空文字列
  };

  // CSVのヘッダー行
  const csvHeader =
    "受付番号,伝票区分,対応区分,フリーダイヤル,受付担当,受付日時,顧客区分,媒体日時,媒体局,注文者フリガナ,注文者氏名,注文者性別,電話番号,ディスプレイ番号,注文者郵便番号,注文者都道府県,注文者住所1,注文者住所2,届先相違の有無,お届け先フリガナ,お届け先氏名,お届け先性別,お届け先電話番号,お届け先郵便番号,お届け先都道府県,お届け先住所1,お届け先住所2,生年月日,入電者,飲用者,支払方法,配達日,時間指定,運送会社伝達事項,注文商品,注文商品名,注文コース,単価,数量,商品金額,送料,送料込総合計,特記事項,運送会社,折返しフラグ,折返し時間,購入動機,未成約理由,他社飲用,伝達事項,スナッチ元受付番号,スナッチ対応,折返し日付,次回配送日,クロス案内,リザーブ6,リザーブ7,リザーブ8,マスタコード,IVR_FLG";

  // データ行の作成
  const rows = data.map((item) => {
    // // user_inputsから特定の質問IDの値を取得するヘルパー関数
    // const getUserInput = (questionId) => {
    //   if (!item.user_inputs || !Array.isArray(item.user_inputs)) {
    //     return "";
    //   }
    //   const inputObject = item.user_inputs.find(
    //     (input) => input.question_id === questionId
    //   );
    //   return inputObject ? inputObject.input : "";
    // };
    // start_time を新しい形式に変換
    const userInputPhoneNumberStatus = getUserInput(item, "phonenumber");
    let userInputPhoneNumber = getUserInput(item, "電話番号");

    // ユーザー入力の電話番号からハイフンを削除
    if (userInputPhoneNumber) {
      userInputPhoneNumber = userInputPhoneNumber.replace(/-/g, "");
    }

    let finalPhoneNumber = "";
    if (userInputPhoneNumberStatus === "YES") {
      finalPhoneNumber = convertToJapaneseNumber(item.call_from);
    } else if (userInputPhoneNumberStatus === "NO") {
      finalPhoneNumber = userInputPhoneNumber;
    }
    // 1. すべてのパターンを定義（メンテナンス時はここを編集するだけ）
    const productData = {
      // まるっと健康青汁 シリーズ
      "+815036282663": { fd: "0120771156", name: "まるっと健康青汁" },
      "+815033583026": { fd: "0120706070", name: "まるっと健康青汁" },
      "+815033582981": { fd: "0120445566", name: "まるっと健康青汁" },
      // リンクルクリアクリーム シリーズ（既存のデフォルト条件）
      "+815033582944": { fd: "0120115577", name: "リンクルクリアクリーム" },
      "+815033583064": { fd: "0120113510", name: "リンクルクリアクリーム" },
      "+815033583051": { fd: "0120303303", name: "リンクルクリアクリーム" },
      // 皇潤ダブル
      "+815033582988": { fd: "0120303707", name: "皇潤W" },
      "+815033582854": { fd: "0120119789", name: "皇潤W" },
    };
    const target = productData[item.call_to];
    const fdNumber = target ? target.fd : "0120771156";
    const productName = target ? target.name : "まるっと健康青汁";

    const startTimeFormatted = item.start_time
      ? formatDateForCsv(new Date(item.start_time))
      : "";
    const originalName = getUserInput(item, "氏名");
    const cleanedName = removeNoiseFromName(originalName);
    const originalAddress = getUserInput(item, "住所").replace(/[.,、。]/g, "");
    const prefecture = extractPrefecture(originalAddress);

    // 注文コースと料金を決定するロジック
    const orderStatus = getUserInput(item, "受注");
    const teikiStatus = getUserInput(item, "定期案内");
    // const callTo = item.call_to;
    let orderCourseName = "";
    let orderCourse = "";
    let unitPrice = "";
    let shippingFee = "";
    let totalAmount = "";

    if (productName === "まるっと健康青汁") {
      // --- まるっと健康青汁のロジック ---
      if (orderStatus === "YES" && teikiStatus === "定期") {
        orderCourseName = "【定期】まるっと健康青汁60袋1箱2480円(送料無)";
        orderCourse = "定期";
        unitPrice = "2480";
        shippingFee = "0";
      } else {
        // orderStatusが"NO"、または"YES"でも定期以外の場合
        orderCourseName =
          "【フリー】まるっと健康青汁30袋1箱+30袋1箱プレゼント3070円(送料込)";
        orderCourse = "フリー";
        unitPrice = "3070";
        shippingFee = "590";
      }
    } else {
      if (productName === "リンクルクリアクリーム") {
        // --- リンクルクリアクリーム ---
        if (orderStatus === "YES" && teikiStatus === "定期") {
          orderCourseName =
            "【定期】パーフェクトリンクルクリアクリーム1箱+1箱プレゼント1980円(送料無)";
          orderCourse = "定期";
          unitPrice = "1980";
          shippingFee = "0";
        } else {
          // orderStatusが"NO"、または"YES"でも定期以外の場合
          orderCourseName =
            "【フリー】パーフェクトリンクルクリアクリーム1箱+1箱プレゼント2570円(送料込)";
          orderCourse = "フリー";
          unitPrice = "1980";
          shippingFee = "590";
        }
      } else {
        // --- 皇潤ダブル（またはその他）のロジック ---
        if (orderStatus === "YES" && teikiStatus === "定期") {
          orderCourseName = "【定期】皇潤W60粒＋60粒プレゼント1980円(送料無)";
          orderCourse = "定期";
          unitPrice = "1980";
          shippingFee = "0";
        } else {
          // orderStatusが"NO"、または"YES"でも定期以外の場合
          orderCourseName = "【フリー】皇潤W60粒＋60粒プレゼント3570円(送料込)";
          orderCourse = "フリー";
          unitPrice = "2570";
          shippingFee = "590";
        }
      }
    }

    const quantity = 1;
    const itemAmount = unitPrice !== "" ? parseFloat(unitPrice) * quantity : "";
    totalAmount = itemAmount !== "" ? itemAmount + parseFloat(shippingFee) : "";

    const rowValues = [
      wrapInQuotes(getApiResult(item.api, "start")),
      wrapInQuotes("注文伝票"),
      wrapInQuotes("通常"),
      wrapInQuotes(fdNumber),
      wrapInQuotes("TACT"),
      wrapInQuotes(startTimeFormatted),
      wrapInQuotes("新規"),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(cleanedName), //氏名
      wrapInQuotes(cleanedName), //氏名
      wrapInQuotes("不明"),
      wrapInQuotes(finalPhoneNumber), //電話番号
      wrapInQuotes(convertToJapaneseNumber(item.call_from)), //ディスプレイ電話番号
      wrapInQuotes(getVerifiedPostalCode(item.user_inputs)), //郵便番号
      wrapInQuotes(prefecture), //都道府県
      wrapInQuotes(originalAddress), //注文者住所1
      wrapInQuotes(""), //setting
      wrapInQuotes("相違なし"),
      wrapInQuotes(cleanedName), //氏名
      wrapInQuotes(cleanedName), //氏名
      wrapInQuotes("不明"),
      wrapInQuotes(finalPhoneNumber), //電話番号
      wrapInQuotes(getVerifiedPostalCode(item.user_inputs)), //郵便番号
      wrapInQuotes(prefecture), //都道府県
      wrapInQuotes(originalAddress), //注文者住所1
      wrapInQuotes(""), //setting
      wrapInQuotes(""), //生年月日
      wrapInQuotes("本人"),
      wrapInQuotes("本人"),
      wrapInQuotes("後払い決済"),
      wrapInQuotes(""), //配達日
      wrapInQuotes("指定なし"),
      wrapInQuotes(""),
      wrapInQuotes(productName),
      wrapInQuotes(orderCourseName),
      wrapInQuotes(orderCourse),
      wrapInQuotes(unitPrice),
      wrapInQuotes(quantity),
      wrapInQuotes(itemAmount),
      wrapInQuotes(shippingFee),
      wrapInQuotes(totalAmount),
      wrapInQuotes(""),
      wrapInQuotes("宅配便"),
      wrapInQuotes("0"),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),
      wrapInQuotes(""),

      // wrapInQuotes(item.status),
    ];

    // 加工した項目をカンマで結合して1行にする
    return rowValues.join(",");
  });

  // ヘッダーとデータ行を改行で結合して返す
  return [csvHeader, ...rows].join("\n");
};
