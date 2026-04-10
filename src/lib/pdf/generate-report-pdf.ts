import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import React, { type ReactElement } from 'react';
import { ReportPdfDocument, type ReportPdfProps } from './report-pdf-template';

/** Render the report PDF to a Node.js Buffer. Must run server-side only. */
export async function generateReportPdf(props: ReportPdfProps): Promise<Buffer> {
  const element = React.createElement(ReportPdfDocument, props);
  return renderToBuffer(element as unknown as ReactElement<DocumentProps>) as Promise<Buffer>;
}
