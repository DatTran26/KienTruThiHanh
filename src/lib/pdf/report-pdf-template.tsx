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
  page:         { padding: 36, fontFamily: 'NotoSans', fontSize: 9 },
  title:        { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  headerLine:   { fontSize: 9, marginBottom: 3 },
  headerBlock:  { marginBottom: 14 },
  table:        { borderWidth: 1, borderColor: '#999' },
  row:          { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#999' },
  rowLast:      { flexDirection: 'row' },
  headerRow:    { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  cell:         { padding: 4, borderRightWidth: 1, borderRightColor: '#999', fontSize: 8 },
  cellLast:     { padding: 4, fontSize: 8 },
  colStt:       { width: 28 },
  colGroup:     { width: 46 },
  colSub:       { width: 46 },
  colContent:   { flex: 1 },
  colAmount:    { width: 72, textAlign: 'right' },
  totalRow:     { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  totalLabel:   { fontWeight: 'bold', fontSize: 9, marginRight: 4 },
  totalValue:   { fontWeight: 'bold', fontSize: 9 },
  footer:       { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' },
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

export function ReportPdfDocument({ reportName, reportCode, totalAmount, items, orgProfile, exportDate }: ReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>PHIẾU ĐỀ NGHỊ THANH TOÁN / BỒI HOÀN</Text>
          {reportCode && <Text style={[styles.headerLine, { textAlign: 'center' }]}>Số: {reportCode}</Text>}
          <Text style={styles.headerLine}>Tên phiếu: {reportName}</Text>
          {orgProfile && (
            <>
              <Text style={styles.headerLine}>Đơn vị: {orgProfile.unit_name}</Text>
              <Text style={styles.headerLine}>Địa chỉ: {orgProfile.address}</Text>
              <Text style={styles.headerLine}>MST: {orgProfile.tax_code}{'      '}Ngày: {exportDate}</Text>
            </>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.colStt]}>STT</Text>
            <Text style={[styles.cell, styles.colGroup]}>Mã nhóm</Text>
            <Text style={[styles.cell, styles.colSub]}>Mã mục</Text>
            <Text style={[styles.cell, styles.colContent]}>Nội dung chi</Text>
            <Text style={[styles.cellLast, styles.colAmount]}>Số tiền (VND)</Text>
          </View>

          {/* Item rows */}
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            const RowStyle = isLast ? styles.rowLast : styles.row;
            return (
              <View key={idx} style={RowStyle}>
                <Text style={[styles.cell, styles.colStt]}>{idx + 1}</Text>
                <Text style={[styles.cell, styles.colGroup]}>{item.group_code ?? ''}</Text>
                <Text style={[styles.cell, styles.colSub]}>{item.sub_code ?? ''}</Text>
                <Text style={[styles.cell, styles.colContent]}>{item.expense_content ?? ''}{item.note ? ` (${item.note})` : ''}</Text>
                <Text style={[styles.cellLast, styles.colAmount]}>{formatVnd(item.amount)}</Text>
              </View>
            );
          })}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{formatVnd(totalAmount)} VND</Text>
        </View>
      </Page>
    </Document>
  );
}
