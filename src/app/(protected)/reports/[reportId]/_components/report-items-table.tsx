import { formatCurrency } from '@/lib/utils';

interface ReportItem {
  id: string;
  sort_order: number | null;
  group_code: string | null;
  sub_code: string | null;
  expense_content: string | null;
  amount: number;
  note: string | null;
}

export function ReportItemsTable({ items }: { items: ReportItem[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Chưa có khoản mục nào.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-3 font-medium w-8">STT</th>
            <th className="pb-2 pr-3 font-medium w-16">Nhóm</th>
            <th className="pb-2 pr-3 font-medium w-16">Mục</th>
            <th className="pb-2 pr-3 font-medium">Nội dung</th>
            <th className="pb-2 font-medium text-right">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="py-2 pr-3 text-muted-foreground">{idx + 1}</td>
              <td className="py-2 pr-3 font-mono text-xs">{item.group_code ?? '—'}</td>
              <td className="py-2 pr-3 font-mono text-xs">{item.sub_code ?? '—'}</td>
              <td className="py-2 pr-3">
                {item.expense_content}
                {item.note && <span className="text-muted-foreground text-xs ml-1">({item.note})</span>}
              </td>
              <td className="py-2 text-right font-medium">{formatCurrency(item.amount)} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
