'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import '@/app/po/upload/poupload.css';
import ProtectedPage from '../../../components/ProtectedPage'; // 追加
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || '';

const POUploadPageContent = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<'upload' | 'processing' | 'summary'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualTotalEdit, setManualTotalEdit] = useState(false);
  const [poData, setPoData] = useState({
    customer_name: '',
    po_number: '',
    currency: '',
    total_amount: '0.00',
    payment_terms: '',
    shipping_terms: '',
    destination: '',
    status: 'pending',
    products: [{ product_name: '', quantity: '', unit_price: '', amount: '' }],
    shipment_arrangement: '手配前',
    po_acquisition_date: new Date().toISOString().split('T')[0],
    organization: '',
    invoice_number: '',
    payment_status: '',
    memo: '',
    ocr_raw_text: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setPoData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const resetToManualEntry = () => {
    setViewMode('upload');
    setUploadedFile(null);
    setManualTotalEdit(false);
    setPoData({
      customer_name: '',
      po_number: '',
      currency: 'USD',
      total_amount: '0.00',
      payment_terms: '',
      shipping_terms: '',
      destination: '',
      status: 'pending',
      products: [{ product_name: '', quantity: '', unit_price: '', amount: '' }],
      shipment_arrangement: '手配前',
      po_acquisition_date: new Date().toISOString().split('T')[0],
      organization: '',
      invoice_number: '',
      payment_status: '',
      memo: '',
      ocr_raw_text: '',
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleAddProduct = () => {
    if (poData.products.length >= 6) return;
    setPoData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { product_name: '', quantity: '', unit_price: '', amount: '' },
      ],
    }));
  };

  const handleRemoveProduct = (index: number) => {
    if (poData.products.length <= 1) return;
    setPoData(prev => {
      const updated = [...prev.products];
      updated.splice(index, 1);
      return { ...prev, products: updated };
    });
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    setPoData(prev => {
      const updated = [...prev.products];
      updated[index] = { ...updated[index], [field]: value };

      // 数量・単価変更 → 金額自動計算
      const quantity = parseFloat(updated[index].quantity) || 0;
      const unitPrice = parseFloat(updated[index].unit_price) || 0;
      updated[index].amount = (quantity * unitPrice).toFixed(2);

      return { ...prev, products: updated };
    });
  };

  useEffect(() => {
    if (!manualTotalEdit && poData.products.length > 0) {
      const total = poData.products.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      setPoData(prev => ({
        ...prev,
        total_amount: total.toFixed(2),
      }));
    }
  }, [poData.products, manualTotalEdit]);

  

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('PDF、PNG、JPEGファイルのみアップロード可能です');
      return;
    }

    setUploadedFile(file);
    setViewMode('processing');
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('認証トークンがありません。再ログインしてください。');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('local_kw', 'true');

      const response = await axios.post<{ ocrId?: string; id?: string }>(
        `${API_URL}/api/ocr/upload`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { local_kw: 'true' },
        }
      );

      const ocrId = response.data?.ocrId || response.data?.id;
      if (ocrId) {
        checkOCRStatus(ocrId);
      } else {
        throw new Error('OCR IDが取得できませんでした');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage('アップロードに失敗しました: ' + (err.response?.data?.detail || err.message));
      } else if (err instanceof Error) {
        setErrorMessage('アップロードに失敗しました: ' + err.message);
      } else {
        setErrorMessage('アップロードに失敗しました（詳細不明）');
      }

      setViewMode('upload');
      setIsProcessing(false);
    }
  };

  const checkOCRStatus = async (ocrId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get<{ status?: string }>(
        `${API_URL}/api/ocr/status/${ocrId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data?.status === 'completed') {
        fetchOCRData(ocrId);
      } else if (res.data?.status === 'failed') {
        setErrorMessage('OCR処理に失敗しました');
        setViewMode('upload');
        setIsProcessing(false);
      } else {
        setTimeout(() => checkOCRStatus(ocrId), 1000);
      }
    } catch {
      setErrorMessage('OCRステータス確認中にエラー');
      setViewMode('upload');
      setIsProcessing(false);
    }
  };

  type OCRData = {
    customer?: string;
    poNumber?: string;
    currency?: string;
    totalAmount?: string;
    paymentTerms?: string;
    terms?: string;
    destination?: string;
    products?: Array<{
      name?: string;
      quantity?: string;
      unitPrice?: string;
      amount?: string;
    }>;
  };
  
  const fetchOCRData = async (ocrId: string) => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get<{ data?: OCRData }>(
          `${API_URL}/api/ocr/extract/${ocrId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
  
        const data: OCRData = res.data?.data || {};

      setPoData((prev) => ({
        ...prev,
        customer_name: data.customer || '',
        po_number: data.poNumber || '',
        currency: data.currency || 'USD',
        total_amount: data.totalAmount || '0.00',
        payment_terms: data.paymentTerms || '',
        shipping_terms: data.terms || '',
        destination: data.destination || '',
        products: (data.products || []).map((p: { name?: string; quantity?: string; unitPrice?: string; amount?: string }) => ({
          product_name: p.name || '',
          quantity: p.quantity || '',
          unit_price: p.unitPrice || '',
          amount: p.amount || ''
        })),
        ocr_raw_text: JSON.stringify(data),
      }));

      setViewMode('summary');
      setIsProcessing(false);
      setSuccessMessage('OCR結果を取得しました');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage('OCRデータ取得エラー: ' + (err.response?.data?.detail || err.message));
      } else if (err instanceof Error) {
        setErrorMessage('OCRデータ取得エラー: ' + err.message);
      } else {
        setErrorMessage('OCRデータ取得エラー（詳細不明）');
      }

      setViewMode('upload');
      setIsProcessing(false);
    }
  };


  const confirmRegistration = async () => {
    setShowConfirmDialog(false);
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('認証トークンがありません。再ログインしてください。');
      return;
    }

    setIsProcessing(true); // スピナー表示開始
    
    try {
      const payload = {
        customer: poData.customer_name,
        poNumber: poData.po_number,
        currency: poData.currency,
        totalAmount: poData.total_amount,
        paymentTerms: poData.payment_terms,
        terms: poData.shipping_terms,
        destination: poData.destination,
        products: poData.products.map(p => ({
          name: p.product_name,
          quantity: p.quantity,
          unitPrice: p.unit_price,
          amount: p.amount,
        })),
        shipment_arrangement: poData.shipment_arrangement,
        po_acquisition_date: poData.po_acquisition_date,
        organization: poData.organization,
        invoice_number: poData.invoice_number,
        payment_status: poData.payment_status,
        memo: poData.memo,
        ocr_raw_text: poData.ocr_raw_text,
      };

      const res = await axios.post<{ success?: boolean }>(
        `${API_URL}/api/po/register`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );


      if (res.data?.success) {
        setShowCompletedDialog(true);
      } else {
        throw new Error('登録に失敗しました');
      }

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage('登録失敗: ' + (err.response?.data?.detail || err.message));
      } else if (err instanceof Error) {
        setErrorMessage('登録失敗: ' + err.message);
      } else {
        setErrorMessage('登録失敗: 不明なエラーが発生しました');
      }
    } finally {
      setIsProcessing(false); // スピナー終了
    }
  };

  const navigateToList = () => router.push('/po/list');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="po-upload-container">
      <div className="main-content">
        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        {/* 成功メッセージ */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="two-column-layout">
          {/* 左カラム：PO情報サマリー */}
          <div className="info-panel">
            <div className="info-header">
              <div className="info-title">PO読取情報サマリー</div>
              <div className="button-group">
                <button 
                  className={`action-button ${viewMode === 'summary' ? 'active' : ''}`}
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={viewMode !== 'summary'}
                >
                  登録する
                </button>
                <button 
                  className={`action-button ${viewMode === 'summary' ? 'active' : ''}`}
                  onClick={() => setManualTotalEdit(true)}
                  disabled={viewMode !== 'summary'}
                >
                  修正する
                </button>
              </div>
            </div>

            <div className="info-body">
              <div className="info-row">
                <div className="info-label">顧客</div>
                <input
                  type="text"
                  className="info-input"
                  value={poData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  disabled={viewMode !== 'summary' || !manualTotalEdit}
                />
              </div>
              {/* PO No. */}
              <div className="info-row">
                <div className="info-label">PO No.</div>
                <input
                  type="text"
                  className="info-input"
                  value={poData.po_number}
                  onChange={(e) => handleInputChange('po_number', e.target.value)}
                  disabled={viewMode !== 'summary' || !manualTotalEdit}
                />
              </div>

              {/* 通貨 */}
              <div className="info-row">
                <div className="info-label">通貨</div>
                <input
                  type="text"
                  className="info-input"
                  value={poData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  disabled={viewMode !== 'summary' || !manualTotalEdit}
                />
              </div>

              <div className="product-info-section">
                <div className="product-header">
                  <span>製品情報</span>
                  <button 
                    className={`add-product-button ${viewMode === 'summary' ? 'active' : ''}`}
                    onClick={handleAddProduct}
                    disabled={viewMode !== 'summary' || !manualTotalEdit || poData.products.length >= 6}
                  >
                    <span>+</span> 製品を追加
                  </button>
                </div>

                {poData.products.map((product, index) => (
                  <div key={index} className="product-item">
                    <div className="product-number-row">
                      <span className="product-number">製品 {index + 1}</span>
                      {poData.products.length > 1 && (
                        <button 
                          className="remove-product-button"
                          onClick={() => handleRemoveProduct(index)}
                          disabled={viewMode !== 'summary' || !manualTotalEdit}
                        >
                          削除
                        </button>
                      )}
                    </div>

                    <div className="info-row">
                      <div className="info-label">製品名称</div>
                      <input 
                        type="text"
                        className="info-input"
                        value={product.product_name}
                        onChange={(e) => handleProductChange(index, 'product_name', e.target.value)}
                        disabled={viewMode !== 'summary' || !manualTotalEdit}
                      />
                    </div>
                    <div className="info-row">
                      <div className="info-label">数量</div>
                      <input 
                        type="text"
                        className="info-input"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        disabled={viewMode !== 'summary' || !manualTotalEdit}
                      />
                    </div>
                    <div className="info-row">
                      <div className="info-label">単価</div>
                      <input 
                        type="text"
                        className="info-input"
                        value={product.unit_price}
                        onChange={(e) => handleProductChange(index, 'unit_price', e.target.value)}
                        disabled={viewMode !== 'summary' || !manualTotalEdit}
                      />
                    </div>
                    <div className="info-row">
                      <div className="info-label">金額</div>
                      <input 
                        type="text"
                        className="info-input"
                        value={product.amount}
                        onChange={(e) => handleProductChange(index, 'amount', e.target.value)}
                        disabled={viewMode !== 'summary' || !manualTotalEdit}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="info-row total-row">
                <div className="info-label">合計金額</div>
                <input
                  type="text"
                  className="info-input total-amount"
                  value={poData.total_amount}
                  onChange={(e) => {
                    setManualTotalEdit(true);
                    handleInputChange('total_amount', e.target.value);
                  }}
                  disabled={viewMode !== 'summary' || !manualTotalEdit}
                />
              </div>

              {/* 支払い条件 */}
              <div className="info-row">
                <div className="info-label">支払い条件</div>
                <input
                  type="text"
                  className="info-input"
                  value={poData.payment_terms}
                  onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                  disabled={viewMode !== 'summary' || !manualTotalEdit}
                />
              </div>

              {/* ターム */}
              <div className="info-row">
                <div className="info-label">ターム</div>
                <input
                  type="text"
                  className="info-input"
                  value={poData.shipping_terms}
                  onChange={(e) => handleInputChange('shipping_terms', e.target.value)}
                  disabled={viewMode !== 'summary' || !manualTotalEdit}
                />
              </div>

              {/* 揚げ地 */}
              <div className="info-row">
                <div className="info-label">揚げ地</div>
                <input
                  type="text"
                  className="info-input"
                  value={poData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  disabled={viewMode !== 'summary' || !manualTotalEdit}
                />
              </div>

            </div>
          </div>

          {/* 右カラム：アップロードビュー */}
          <div className="image-panel">
            <div className="image-header">
              <div className="image-title">PO画像</div>
            </div>
            <div className="image-body">
              {viewMode === 'upload' && (
                <div
                  className="upload-area"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                >
                  <p className="upload-main-text">POをアップロードしてください</p>
                  <p className="upload-sub-text">(対応形式：PDF/PNG/JPEG)</p>
                  <p className="upload-instruction">ここにドラッグアンドドロップ</p>
                  <p className="upload-or">または</p>
                  <button className="file-select-button" onClick={handleFileButtonClick}>
                    ファイルを選択
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="file-input-hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                  />
                </div>
              )}
  
              {(viewMode === 'processing' || isProcessing) && (
                <div className="processing-area">
                  <p className="processing-text">画像を解析しています...</p>
                  <div className="spinner"></div>
                </div>
              )}

              {viewMode === 'summary' && uploadedFile && (
                <div className="preview-area">
                  {uploadedFile.type.includes('image') ? (
                    <Image
                      src={URL.createObjectURL(uploadedFile)}
                      alt="Uploaded PO"
                      className="preview-image"
                      width={800}  // 適切な幅を指定
                      height={600} // 適切な高さを指定
                      unoptimized={true} // Next.jsの最適化を無効化
                    />
                  ) : (
                    <div className="preview-pdf">
                      <p className="preview-filename">ファイル名: {uploadedFile.name}</p>
                      <object
                        data={URL.createObjectURL(uploadedFile)}
                        type="application/pdf"
                        className="pdf-object"
                      >
                        <p>PDFを表示できません。<a href={URL.createObjectURL(uploadedFile)} target="_blank" rel="noopener noreferrer">ここをクリック</a>して開く</p>
                      </object>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 登録確認ダイアログ */}
      {showConfirmDialog && (
        <div className="overlay">
          <div className="dialog">
            <h3 className="dialog-title">PO情報を登録しますか？</h3>
            <div className="dialog-buttons">
              <button className="dialog-button-cancel" onClick={() => setShowConfirmDialog(false)}>戻る</button>
              <button className="dialog-button-confirm" onClick={confirmRegistration}>はい</button>
            </div>
          </div>
        </div>
      )}

      {/* 登録完了ダイアログ */}
      {showCompletedDialog && (
        <div className="overlay">
          <div className="dialog">
            <h3 className="dialog-title">PO情報が登録されました</h3>
            <div className="dialog-buttons">
              <button className="dialog-button-cancel" onClick={() => { setShowCompletedDialog(false); resetToManualEntry(); }}>別のPOを登録する</button>
              <button className="dialog-button-confirm" onClick={() => { setShowCompletedDialog(false); navigateToList(); }}>一覧を見る</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const POUploadPage = () => {
  return (
    <ProtectedPage>
      <POUploadPageContent />
    </ProtectedPage>
  );
};

export default POUploadPage;
