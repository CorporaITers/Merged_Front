"use client";

import React from "react";
import { useEffect, useState } from "react";

type ScheduleResult = {
  company: string;
  vessel: string;
  fare: string;
  etd: string;
  eta: string;
  schedule_url?: string;
  raw_response: string;
  status?: string; // 任意（optional）
};

const DEPARTURE_DESTINATION_MAP: Record<string, string[]> = {
  Kobe: ["Shanghai", "Singapore", "Los Angeles", "Rotterdam", "Hamburg", "Dubai", "New York", "Hong Kong", "Busan", "Sydney"],
  Osaka: ["Shanghai", "Singapore", "Los Angeles", "Rotterdam", "Hamburg", "Dubai", "New York", "Hong Kong", "Busan", "Sydney"],
  Yokohama: ["Shanghai", "Singapore", "Los Angeles", "Rotterdam", "Hamburg", "Dubai", "New York", "Hong Kong", "Busan", "Sydney"],
  Tokyo: ["Shanghai", "Singapore", "Los Angeles", "Rotterdam", "Hamburg", "Dubai", "New York", "Hong Kong", "Busan", "Sydney"]
};

export default function Home() {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [etd, setEtd] = useState("");
  const [eta, setEta] = useState("");
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [results, setResults] = useState<ScheduleResult[]>([]);
  const [error, setError] = useState("");
  const [feedbackSentMap, setFeedbackSentMap] = useState<Record<string, boolean>>({});
  const [showRawMap, setShowRawMap] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDifyChat, setShowDifyChat] = useState(false);

  // 船会社のログインURLマッピング
  const MOCK_COMPANY_LOGIN_URLS: Record<string, string> = {
    "NYK": "https://www.nyk.com/",
    "ONE": "https://jp.one-line.com/ja/user/login",
    "MAERSK": "https://accounts.maersk.com/ocean-maeu/auth/login",
    "MSC": "https://www.msc.com/ja/ebusiness",
    "CMA CGM": "https://www.cma-cgm.com/",
    "COSCO": "https://world.lines.coscoshipping.com/japan/jp/home",
    "EVERGREEN": "https://www.shipmentlink.com/jp/"
  };

  // Toyoshigoリンクのマッピング
  const MOCK_TOYOSHINGO_URLS: Record<string, string> = {
    "NYK": "https://toyoshingo.com/nyk/",
    "ONE": "https://toyoshingo.com/one/",
    "MAERSK": "https://toyoshingo.com/maersk/",
    "MSC": "https://toyoshingo.com/msc/",
    "CMA CGM": "https://toyoshingo.com/cmacgm/",
    "COSCO": "https://toyoshingo.com/cosco/", 
    "EVERGREEN": "https://toyoshingo.com/evergreen/"
  };

  const handleStatusChange = (index: number, newStatus: "done" | "processing" | "exclude") => {
    const updated = [...results];
    const currentStatus = updated[index].status;
    updated[index].status = currentStatus === newStatus ? "none" : newStatus;

    setResults(updated);
  };

  const getStatusBgColor = (status?: string) => {
    switch (status) {
      case "done":
        return "bg-blue-100";
      case "processing":
        return "bg-pink-100";
      case "exclude":
        return "bg-gray-200";
      default:
        return "bg-white";
    }
  };

  useEffect(() => {
    console.log("✅取得したresults:", results);
    if (!Array.isArray(results)) {
      console.warn("⚠️ resultsが配列ではありません:", typeof results);
    }
    if (results.length > 0) {
      console.log("🟢 表示可能な結果があります:", results);
    } else {
      console.log("🟡 結果は空配列です。");
    }
  }, [results]);

  useEffect(() => {
    setAvailableDestinations(DEPARTURE_DESTINATION_MAP[departure] || []);
    setDestination("");
  }, [departure]);

  const handleSubmit = async () => {
    setSubmitted(true);
    setError("");
    setResults([]);
    setFeedbackSentMap({});
    setShowRawMap({});
    setIsLoading(true); // ← 追加

    if (!etd && !eta) {
      setIsLoading(false); // ← エラーでも必ずfalseに
      setError("ETDまたはETAのいずれかを入力してください。");
      return;
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + '/recommend-shipping', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure_port: departure,
          destination_port: destination,
          etd_date: etd || null,
          eta_date: eta || null
        })
      });
      const data = await res.json();
      console.log("🧪受信したdata:", data); // ←これ追加して中身確認

      
      if (res.ok) {
        const newResults = data.map((item: ScheduleResult) => ({
          ...item,           // ← 元のデータを維持
          status: "none"     // ← 初期状態（まだタグ未選択）
        })).sort((a: ScheduleResult, b: ScheduleResult) => {
          const fareA = Number(a.fare ?? Infinity);
          const fareB = Number(b.fare ?? Infinity);
          return fareA - fareB;
        });

        setResults(newResults);  // ← 加工後のデータをセットする
      } else {
        setResults([]);  // ← 明示的に空配列を設定
        const specificError = data.reason === "no_schedule_for_destination"
          ? "この目的地へのスケジュールは現在ありません。"
          : data.reason === "no_schedule"
          ? "該当するスケジュールが存在しません。"
          : data.reason === "pdf_not_found"
          ? "PDFスケジュールファイルが見つかりませんでした。"
          : "スケジュール取得に失敗しました。";
        setError(data.error || specificError);
      }
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました。");
    } finally {
      setIsLoading(false); // ← 必ず最後にfalse
    }
  };

  const handleFeedback = async (index: number, value: "yes" | "no") => {
    const schedule = results[index];
    try {
      await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + 'update-feedback', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: schedule.schedule_url,
          etd: schedule.etd,
          eta: schedule.eta,
          feedback: value
        })
      });
      setFeedbackSentMap((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      console.error("Feedback送信失敗:", err);
    }
  };

  const toggleRaw = (index: number) => {
    setShowRawMap((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleEtaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEta(e.target.value);
    if (e.target.value) setEtd("");
  };

  const handleEtdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEtd(e.target.value);
    if (e.target.value) setEta("");
  };
  
  return (
    <>
      {/* メイン */}
      <div className="p-8 w-full max-w-none bg-gray-50 min-h-screen pb-16">

        {/* 検索フォームと結果を横並びにするflex */}
        <div className="flex justify-center flex-col lg:flex-row gap-6 w-full">

        {/* 検索フォーム全体をカードで囲む*/}
        <div className="w-full lg:w-1/3 bg-white rounded-md shadow-md mb-8 overflow-hidden">
          <div className="bg-[#e6efff] px-4 py-3 flex justify-between items-center">
            <h1 className="text-lg font-medium">スケジュール検索</h1>
          </div>
          
          <div className="p-6">
            {/* 検索フォーム */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">出港地：</label>
              <select className="w-full p-2 border rounded" value={departure} onChange={(e) => setDeparture(e.target.value)}>
                <option value="">選択してください</option>
                {Object.keys(DEPARTURE_DESTINATION_MAP).map((port) => (
                  <option key={port} value={port}>{port}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">目的地：</label>
              <select
                className="w-full p-2 border rounded"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={!departure}
              >
                <option value="">選択してください</option>
                {availableDestinations.map((port) => (
                  <option key={port} value={port}>{port}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">出港予定日（ETD）：</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={etd}
                onChange={handleEtdChange}
                disabled={eta !== ""}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">到着予定日（ETA）：</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={eta}
                onChange={handleEtaChange}
                disabled={etd !== ""}
              />
            </div>

            <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              レコメンド取得
            </button>

            {isLoading && (
              <div className="mt-4 text-blue-600 border border-blue-300 p-2 rounded bg-blue-50">
                渡航スケジュールを確認中です...
              </div>
            )}
          </div>
        </div>

      {/* 結果表示 */}
        <div className="w-full lg:w-2/3 bg-white rounded-md shadow-md mb-8 overflow-hidden flex flex-col">
          {/* ヘッダー部分 - 固定 */}
          <div className="bg-[#e6efff] px-4 py-3 flex justify-between items-center">
            <h2 className="text-lg font-medium">レコメンド</h2>
            {results.length > 0 && (
              <span className="text-sm text-gray-600">{results.length}件の結果</span>
            )}
          </div>

          {/* コンテンツ部分 - パディングを適用 */}
           <div className="px-6 py-4 overflow-hidden">
            {/* 結果リスト */}
            <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2">
              {results.length === 0 ? (
                // レコメンド未取得時
                <div className="border rounded p-4 bg-gray-50 text-gray-400">
                  レコメンド結果はまだありません。
               </div>
             ) : (
                // レコメンド取得時
                results.map((result, index) => (
                 <div key={index} className={`border rounded p-4 ${getStatusBgColor(result.status)} flex flex-col space-y-2`}>
                  {/* ステータスタグ */}
                  <div className="flex items-center justify-between mb-2">
                    {/* 船会社名とログインボタン（左寄せ） */}
                    <div className="flex items-center space-x-4">
                    <p className="text-xl font-bold">船会社：{result.company}</p>
                    <button 
                      onClick={() => {
                        const url = MOCK_COMPANY_LOGIN_URLS[result.company];
                        if (url) {
                          window.open(url, '_blank');
                        } else {
                          alert('この船会社のログインURLは現在登録されていません。');
                        }
                      }}
                      className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                  >
                      ログイン</button>
                  </div>
                    {/* ステータスボタン（右寄せ）*/}
                    <div className="space-x-2">
                      <button
                       onClick={() => handleStatusChange(index, "done")}
                       className={`px-3 py-1 rounded text-sm font-semibold 
                         ${result.status === "done" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"}`}
                      >
                        ＢＫＧ済
                      </button>
                      <button
                        onClick={() => handleStatusChange(index, "processing")}
                        className={`px-3 py-1 rounded text-sm font-semibold 
                         ${result.status === "processing" ? "bg-red-500 text-white" : "bg-pink-100 text-red-600"}`}
                      >       
                        ＢＫＧ中
                      </button>
                      <button
                        onClick={() => handleStatusChange(index, "exclude")}
                        className={`px-3 py-1 rounded text-sm font-semibold 
                          ${result.status === "exclude" ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-700"}`}
                      >
                        除外
                      </button>
                    </div>
                  </div>

                  <hr className="border-t border-gray-300 mb-3" />

                  <div className="ml-4 space-y-1 mt-2 text-gray-800">
                    <p><strong>船名:</strong> {result.vessel}</p>
                    <p><strong>運賃:</strong> ${result.fare} </p>
                    <p><strong>出港日（ETD）:</strong> {result.etd}</p>
                    <p><strong>到着予定日（ETA）:</strong> {result.eta}</p>
                    <p>
                      <a
                        href={result.schedule_url ?? "#"} // ← fallbackを設定
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        スケジュールPDFを開く
                      </a>
                      
                      <span className="mx-6">|</span>
                       
                      <a
                        href={MOCK_TOYOSHINGO_URLS[result.company] || "#"}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Toyoshingoを確認する
                      </a>

                    </p>
                  </div>

          
                  <hr className="border-t border-gray-300 mb-3" />

                  <div className="mt-4 flex justify-between items-center flex-wrap gap-2">
                    {/* 左側：質問＋Yes/Noボタン＋感謝メッセージ */}
                      <div className="flex items-center gap-2">
                      <span className="text-sm">この抽出内容は適切でしたか？</span>

                      <button
                        onClick={() => handleFeedback(index, "yes")}
                        className={`px-3 py-1 rounded border text-sm font-semibold 
                          ${feedbackSentMap[index] === true ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                      >
                        Yes
                      </button>

                      <button
                        onClick={() => handleFeedback(index, "no")}
                        className={`px-3 py-1 rounded border text-sm font-semibold 
                          ${feedbackSentMap[index] === false ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                      >
                        No
                      </button>

                      {feedbackSentMap[index] !== undefined && (
                        <span className="text-green-600 text-sm">フィードバックありがとうございます。</span>
                        )}
                  </div>

                  {/* ChatGPT抽出内容表示 */}
                  <button onClick={() => toggleRaw(index)} className="text-sm text-blue-600 underline">
                    {showRawMap[index] ? "ChatGPTの抽出内容を隠す" : "ChatGPTの抽出内容を表示"}
                  </button>
                    {showRawMap[index] && (
                      <textarea className="w-full h-32 p-2 border rounded mt-2 bg-white" value={result.raw_response} readOnly></textarea>
                    )}
                </div>
              </div>
            ))
          )}
        </div>

           {/* エラーメッセージ（共通） */}
            {(submitted && !isLoading && (error || results.length === 0)) && (
              <div className="mt-4 text-red-600 border border-red-300 p-2 rounded bg-red-50">
                {error || "該当する船便がありませんでした。"}
              </div>
            )}
            </div>
          </div>
        </div>
  </div> 


{/* CSP回避 直接Difyチャットボット実装 - ヘッダーなし */}
      <div className="fixed bottom-10 right-8 z-50">
        {/* どりもちゃんボタン - 通知バッジなし */}
        <button
          onClick={() => setShowDifyChat(!showDifyChat)}
          className="relative w-30 h-25 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          style={{
            backgroundImage: "url('/dorimochan.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '80px',
            height: '60px'
          }}
          title="どりもちゃんに相談する"
        >
        </button>
        
{/* Difyチャットウィンドウ - 超シンプル版 */}
        {showDifyChat && (
          <div className="absolute bottom-20 right-0 w-96 h-[600px] bg-white rounded-lg shadow-2xl border animate-fade-in overflow-hidden">
            {/* Dify iframe - 完全フルサイズ */}
            <iframe
              src="https://udify.app/chatbot/o5eR4Ibgrs8MWzXD"
              className="w-full h-full border-none rounded-lg"
              title="どりもちゃんチャットボット"
              allow="microphone; camera"
              onLoad={() => console.log('✅ Dify iframe loaded successfully')}
              onError={() => console.error('❌ Dify iframe failed to load')}
            />
          </div>
        )}
      </div>

      {/* アニメーション用CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
  </>
  );
}
