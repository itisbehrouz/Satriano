import { SIZE_CODES, parseQuantityInput, type SizeQuantities } from "@/lib/configuratorLogic";

interface SizeQtyTableProps {
  quantities: SizeQuantities;
  onChange: (quantities: SizeQuantities) => void;
}

export function SizeQtyTable({ quantities, onChange }: SizeQtyTableProps) {
  return (
    <div className="border border-[#D1D5DB] rounded-lg bg-white overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs uppercase font-semibold text-[#5B6B85]">
            <th className="py-3 px-4 w-1/3">Size Code</th>
            <th className="py-3 px-4 text-right">Unit Quantity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#1A2233]">
          {SIZE_CODES.map((size) => (
            <tr key={size} className="hover:bg-[#F5F7FA]/60 transition-colors">
              <td className="py-3 px-4 font-semibold text-[#1A2233]">{size}</td>
              <td className="py-3 px-4 text-right">
                <input
                  aria-label={size}
                  className="w-28 bg-[#F5F7FA] border border-[#D1D5DB] text-[#1A2233] focus:border-[#2E5AAC] focus:bg-white focus:outline-none py-1.5 px-3 rounded text-sm text-right font-medium tabular-nums"
                  min={0}
                  type="number"
                  value={quantities[size]}
                  onChange={(event) =>
                    onChange({
                      ...quantities,
                      [size]: parseQuantityInput(event.target.value),
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
