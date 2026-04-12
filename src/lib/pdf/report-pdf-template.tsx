import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import path from 'path';

// Register NotoSans for Vietnamese diacritics support
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/NotoSans-Regular.ttf'), fontWeight: 'normal' },
    { src: path.join(process.cwd(), 'public/fonts/NotoSans-Bold.ttf'), fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page:         { padding: 24, fontFamily: 'NotoSans', fontSize: 10, color: '#0f172a' },
  frameOuter:   { flex: 1, borderWidth: 2, borderColor: '#1d4ed8', padding: 2 },
  frameInner:   { flex: 1, borderWidth: 1, borderColor: '#1d4ed8', padding: 20 },
  
  // Header
  headerRow:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  logoBox:      { width: 64, height: 64, borderWidth: 3, borderColor: '#ef4444', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText:     { color: '#ef4444', fontSize: 26, fontWeight: 'bold' },
  
  titleBox:     { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  titleText:    { color: '#dc2626', fontSize: 18, fontWeight: 'bold' },
  titleSub:     { color: '#dc2626', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  dateText:     { fontSize: 10, marginTop: 4, color: '#1d4ed8' },
  
  infoBox:      { width: 140, alignItems: 'flex-end' },
  infoLine:     { color: '#1d4ed8', fontSize: 10, marginBottom: 2 },
  infoVal:      { color: '#dc2626', fontWeight: 'bold' },
  
  divider:      { borderBottomWidth: 1.5, borderBottomColor: '#dc2626', marginBottom: 12 },
  
  // Info Form
  formRow:      { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-end' },
  labelGroup:   { color: '#1d4ed8', fontSize: 10, marginRight: 4 },
  labelTitle:   { color: '#dc2626', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase' },
  dottedLine:   { flex: 1, borderBottomWidth: 1, borderBottomColor: '#64748b', borderBottomStyle: 'dashed', paddingBottom: 1 },
  dottedText:   { fontSize: 10, color: '#0f172a' },
  
  // Table
  table:        { borderWidth: 1, borderColor: '#1d4ed8', marginTop: 16 },
  tr:           { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1d4ed8' },
  trLast:       { flexDirection: 'row' },
  colStt:       { width: 30, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#1d4ed8', padding: 4 },
  colContent:   { flex: 1, borderRightWidth: 1, borderRightColor: '#1d4ed8', padding: 4 },
  colGroup:     { width: 45, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#1d4ed8', padding: 4 },
  colSub:       { width: 45, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#1d4ed8', padding: 4 },
  colNote:      { width: 80, borderRightWidth: 1, borderRightColor: '#1d4ed8', padding: 4 },
  colAmount:    { width: 80, textAlign: 'right', padding: 4 },
  
  th:           { fontWeight: 'bold', color: '#1d4ed8', fontSize: 9, textAlign: 'center' },
  thSub:        { color: '#1d4ed8', fontSize: 8, marginTop: 2, textAlign: 'center' },
  td:           { fontSize: 9, color: '#0f172a' },
  
  // Totals
  totalRow:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1d4ed8' },
  totalLabelBox:{ flex: 1, borderRightWidth: 1, borderRightColor: '#1d4ed8', padding: 4, alignItems: 'flex-end' },
  totalLabel:   { fontWeight: 'bold', color: '#1d4ed8', fontSize: 10 },
  totalAmountBox:{ width: 80, padding: 4, alignItems: 'flex-end' },
  totalAmount:  { fontWeight: 'bold', color: '#dc2626', fontSize: 10 },
  
  wordsRow:     { flexDirection: 'row', padding: 4, alignItems: 'flex-start' },
  wordsLabel:   { color: '#1d4ed8', fontSize: 10, marginRight: 4, paddingTop: 1 },
  wordsValue:   { flex: 1, borderBottomWidth: 1, borderBottomColor: '#64748b', borderBottomStyle: 'dashed', fontSize: 10, paddingBottom: 2, color: '#0f172a' },
  
  // Footer
  footer:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingHorizontal: 20 },
  signBox:      { alignItems: 'center' },
  signRole:     { color: '#1d4ed8', fontWeight: 'bold', fontSize: 10 },
  signSub:      { color: '#1d4ed8', fontSize: 9, marginBottom: 50 },
  signName:     { fontWeight: 'bold', fontSize: 10, color: '#0f172a' },
});

export interface PdfReportItem {
  sort_order: number | null;
  group_code: string | null;
  sub_code: string | null;
  expense_content: string | null;
  amount: number;
  note: string | null;
}

export interface PdfOrgProfile {
  unit_name: string;
  address: string;
  tax_code: string;
}

export interface ReportPdfProps {
  reportName: string;
  reportCode: string | null;
  totalAmount: number;
  items: PdfReportItem[];
  orgProfile: PdfOrgProfile | null;
  exportDate: string;
}

function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

// Num to words
const units = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const level = ['', 'nghìn', 'triệu', 'tỉ', 'nghìn tỉ', 'triệu tỉ'];

function doc3So(n: number) {
  const t = Math.floor(n / 100);
  const c = Math.floor((n % 100) / 10);
  const d = n % 10;
  let res = '';
  if (t > 0) res += units[t] + ' trăm ';
  if (c > 1) res += units[c] + ' mươi ';
  else if (c === 1) res += 'mười ';
  else if (t > 0 && d > 0) res += 'lẻ ';
  if (d > 0) {
    if (d === 1 && c > 1) res += 'mốt';
    else if (d === 5 && c > 0) res += 'lăm';
    else res += units[d];
  }
  return res.trim();
}

function convertNumberToWords(amount: number) {
  if (amount === 0) return 'Không đồng';
  let str = Math.floor(amount).toString();
  let res = [];
  let tIndex = 0;
  while (str.length > 0) {
    let chunk = str.slice(-3);
    str = str.slice(0, -3);
    let chunkNum = parseInt(chunk, 10);
    if (chunkNum > 0 || (str.length > 0 && tIndex === 3)) { // always read billion if applicable
      let chunkStr = doc3So(chunkNum);
      if (chunkStr) res.unshift(chunkStr + ' ' + level[tIndex]);
    }
    tIndex++;
  }
  let final = res.join(' ').trim() + ' đồng';
  return final.charAt(0).toUpperCase() + final.slice(1);
}

export function ReportPdfDocument({ reportName, reportCode, totalAmount, items, orgProfile, exportDate }: ReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.frameOuter}>
          <View style={styles.frameInner}>
            
            {/* 1. Header (Logo, Titles, Status) */}
            <View style={styles.headerRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>A</Text>
              </View>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>PHIẾU ĐỀ NGHỊ THANH TOÁN</Text>
                <Text style={styles.titleSub}>(PAYMENT REQUEST / INVOICE)</Text>
                <Text style={styles.dateText}>Ngày (Date) {exportDate}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLine}>Ký hiệu (Serial): <Text style={styles.infoVal}>AI/2026</Text></Text>
                <Text style={styles.infoLine}>Số (No.): <Text style={styles.infoVal}>{reportCode || '00000001'}</Text></Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 2. Issuer Info */}
            <View style={styles.formRow}>
              <Text style={styles.labelGroup}>Mã Đơn vị (Unit Code):</Text>
              <View style={styles.dottedLine}>
                <Text style={[styles.dottedText, styles.labelTitle]}>{orgProfile?.unit_name || '..........................................................'}</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.labelGroup}>Mã số thuế (Tax code):</Text>
              <View style={styles.dottedLine}>
                <Text style={styles.dottedText}>{orgProfile?.tax_code || '..........................................................'}</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.labelGroup}>Địa chỉ (Address):</Text>
              <View style={styles.dottedLine}>
                <Text style={styles.dottedText}>{orgProfile?.address || '..........................................................'}</Text>
              </View>
            </View>

            <View style={{ height: 12 }} />

            {/* 3. Report Info */}
            <View style={styles.formRow}>
              <Text style={styles.labelGroup}>Tên báo cáo (Report Name):</Text>
              <View style={styles.dottedLine}>
                <Text style={styles.dottedText}>{reportName}</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.labelGroup}>Hình thức thanh toán (Payment method):</Text>
              <View style={styles.dottedLine}>
                <Text style={styles.dottedText}>TM/CK</Text>
              </View>
            </View>

            {/* 4. Table */}
            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tr, { backgroundColor: '#f8fafc' }]}>
                <View style={styles.colStt}>
                  <Text style={styles.th}>STT</Text>
                  <Text style={styles.thSub}>(No)</Text>
                  <Text style={styles.thSub}>(1)</Text>
                </View>
                <View style={styles.colContent}>
                  <Text style={styles.th}>Tên hàng hóa, dịch vụ / Nội dung</Text>
                  <Text style={styles.thSub}>(Description)</Text>
                  <Text style={styles.thSub}>(2)</Text>
                </View>
                <View style={styles.colGroup}>
                  <Text style={styles.th}>Nhóm</Text>
                  <Text style={styles.thSub}>(Group)</Text>
                  <Text style={styles.thSub}>(3)</Text>
                </View>
                <View style={styles.colSub}>
                  <Text style={styles.th}>Mục</Text>
                  <Text style={styles.thSub}>(Sub)</Text>
                  <Text style={styles.thSub}>(4)</Text>
                </View>
                <View style={styles.colNote}>
                  <Text style={styles.th}>Ghi chú</Text>
                  <Text style={styles.thSub}>(Notes)</Text>
                  <Text style={styles.thSub}>(5)</Text>
                </View>
                <View style={[styles.colAmount, { borderRightWidth: 0 }]}>
                  <Text style={styles.th}>Thành tiền</Text>
                  <Text style={styles.thSub}>(Amount)</Text>
                  <Text style={styles.thSub}>(6)</Text>
                </View>
              </View>

              {/* Rows */}
              {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                const content = item.expense_content || '';

                return (
                  <View key={idx} style={isLast ? styles.trLast : styles.tr}>
                    <View style={styles.colStt}><Text style={[styles.td, { textAlign: 'center' }]}>{idx + 1}</Text></View>
                    <View style={styles.colContent}><Text style={styles.td}>{content}</Text></View>
                    <View style={styles.colGroup}><Text style={[styles.td, { textAlign: 'center' }]}>{item.group_code || ''}</Text></View>
                    <View style={styles.colSub}><Text style={[styles.td, { textAlign: 'center' }]}>{item.sub_code || ''}</Text></View>
                    <View style={styles.colNote}><Text style={styles.td}>{item.note || ''}</Text></View>
                    <View style={[styles.colAmount, { borderRightWidth: 0 }]}><Text style={styles.td}>{formatVnd(item.amount)}</Text></View>
                  </View>
                );
              })}

              {/* Totals */}
              <View style={styles.totalRow}>
                <View style={styles.totalLabelBox}>
                  <Text style={styles.totalLabel}>Tổng cộng tiền thanh toán (Total payment):</Text>
                </View>
                <View style={styles.totalAmountBox}>
                  <Text style={styles.totalAmount}>{formatVnd(totalAmount)}</Text>
                </View>
              </View>

              {/* Amount in Words */}
              <View style={styles.wordsRow}>
                <Text style={styles.wordsLabel}>Số tiền bằng chữ (Amount in words):</Text>
                <View style={styles.wordsValue}>
                  <Text style={styles.td}>{convertNumberToWords(totalAmount)}</Text>
                </View>
              </View>
            </View>

            {/* 5. Footer (Signatures) */}
            <View style={styles.footer}>
              <View style={styles.signBox}>
                <Text style={styles.signRole}>Người đề nghị (Applicant)</Text>
                <Text style={styles.signSub}>(Ký, ghi rõ họ tên)</Text>
                <Text style={styles.signName}></Text>
              </View>
              <View style={styles.signBox}>
                <Text style={styles.signRole}>Người phê duyệt (Approver)</Text>
                <Text style={styles.signSub}>(Ký, ghi rõ họ tên)</Text>
                <View style={{ width: 140, height: 60, borderWidth: 1, borderColor: '#ef4444', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 4, backgroundColor: '#fef2f2' }}>
                  <Text style={{ color: '#ef4444', fontSize: 7, fontWeight: 'bold' }}>Signature Valid</Text>
                  <Text style={{ color: '#ef4444', fontSize: 6 }}>Ký bởi: HỆ THỐNG KIẾN TRÚC</Text>
                  <Text style={{ color: '#ef4444', fontSize: 6 }}>Ký ngày: {exportDate}</Text>
                </View>
              </View>
            </View>

          </View>
        </View>
      </Page>
    </Document>
  );
}
