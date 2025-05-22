$(document).ready(function () {
  // クイズデータ(JSON形式)
  const quizData = [
    {
      title: "穏やかな朝",
      audio: "./audio/穏やかな朝.mp3",
    },
    {
      title: "2:23AM",
      audio: "./audio/2_23_AM.mp3",
    },
    {
      title: "Morning",
      audio: "./audio/Morning.mp3",
    },
    {
      title: "Scary Shaper",
      audio: "./audio/Scary_Shaper.mp3",
    },
    {
      title: "君に花",
      audio: "./audio/君に花.mp3",
    },
  ];

  let isFirstTime = true; // 1問目判定用bool
  let timer = null; // カウントダウン制御用
  let currentQuestionIndex = 0; // 出題データ選択用インデックス
  let correctCount = 0; // 正解数カウント変数
  let totalQuestions = 3; // 出題数
  let questionCount = 0; // 今何問目か
  let usedIndexes = []; // 出題済みのインデックス

  // スタートボタン押下時処理
  $("#startButton").click(function () {
    // 二重実行防止
    if (timer) return;
    // 全問出題済み
    if (questionCount >= totalQuestions) return;
    console.log("click startButton");

    // 表示を初期化
    $("#startButton").prop("disabled", true);
    $("#countdown").show();
    $("#quizArea").empty();
    $("#message").empty();

    // カウントダウン用
    let countdown = 3;
    $("#countdown").text(countdown);

    // カウントダウン
    timer = setInterval(function () {
      // デクリメント
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        $("#countdown").text("イントロ再生中");
        playIntro();
      } else {
        $("#countdown").text(countdown);
      }
    }, 1000);
  });

  // イントロ再生関数
  function playIntro() {
    console.log("playIntro()");
    // 未出題の中からランダムに選ぶ
    let availableIndexes = quizData
      // 要素は受け取るけど使わない
      // 配列から配列を作成（今回はインデックスのみ抽出）
      .map(function (_, i) {
        return i;
      })
      // 条件に一致する要素のみ保持する
      .filter(function (i) {
        return !usedIndexes.includes(i);
      });
    if (availableIndexes.length === 0) return;

    // 使用可能なインデックスの中から、乱数生成
    currentQuestionIndex =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    usedIndexes.push(currentQuestionIndex);
    console.log("currentQuestionIndex : " + currentQuestionIndex);

    // イントロ再生
    // jQueryでAudio要素は扱えないため、ネイティブな書き方をする
    const audio = document.getElementById("introAudio");
    audio.src = quizData[currentQuestionIndex].audio;
    audio.play();

    // 指定秒数イントロ再生後、クイズ関数実行
    setTimeout(function () {
      audio.pause();
      $("#countdown").hide();
      showQuiz();
    }, 5000);
  }

  // クイズ関数
  function showQuiz() {
    // インデックスからクイズデータを取得
    const correctTitle = quizData[currentQuestionIndex].title;

    // 問題文を表示
    const questionElem = $("<h2>").text("この曲のタイトルは？");
    $("#quizArea").append(questionElem);

    // 各要素のtitleプロパティを抽出して新しい配列を作成
    const titles = quizData.map(function (q) {
      return q.title;
    });
    // 正解のタイトル以外を抽出
    let options = titles.filter(function (t) {
      return t !== correctTitle;
    });
    // 誤回答を並び替え
    shuffleArray(options);
    // 2つを抽出
    options = options.slice(0, 2);
    // 正解のタイトルを追加
    options.push(correctTitle);
    // 最後に正解も含めて並び替え
    shuffleArray(options);

    // 選択肢をボタンで表示
    // optionはforEachが渡す引数
    options.forEach(function (option) {
      // 選択肢ボタンの設定
      const button = $("<button>")
        .text(option)
        .addClass("option-button")
        .click(function () {
          // 正解判定
          if (option === correctTitle) {
            $("#message").text("正解です！");
            correctCount++;
          } else {
            $("#message").text(
              "残念、不正解！ 正解は「" + correctTitle + "」です"
            );
          }
          // 回答ボタン全てを無効化
          $(".option-button").prop("disabled", true);

          // 二重防止用変数リセット
          timer = null;

          // 出題数インクリメント
          questionCount++;

          // 最終スコア表示
          if (questionCount >= totalQuestions) {
            // $("#startButton").hide();
            $("#message").append(
              "<br>全" +
                totalQuestions +
                "問中、" +
                correctCount +
                "問正解でした！"
            );

            // もう一度遊ぶボタンを表示
            $("#restartButton").show();
          } else {
            // 2問目以降はボタンのテキスト変更
            if (isFirstTime) {
              isFirstTime = false;
              $("#startButton").text("つぎの問題");
            }
            // スタートボタンを有効化
            $("#startButton").prop("disabled", false);
          }
        });

      // 選択肢ボタンの表示
      $("#quizArea").append(button);
    });
  }

  // もう一度遊ぶボタンクリック時の処理
  $("#restartButton").click(function () {
    // ページの再読み込み
    location.reload();
  });

  // シャッフル関数（FisherーYates、よく使われるアルゴリズムらしい）
  function shuffleArray(array) {
    // 配列の末尾から先頭へ向けてループ（要素数-1）回
    for (let i = array.length - 1; i > 0; i--) {
      // 0以上i以下のランダムな整数jを生成
      const j = Math.floor(Math.random() * (i + 1));
      // 要素の入れ替え
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
});
