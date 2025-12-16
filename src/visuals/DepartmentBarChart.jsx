import { useState } from "react";
import Tooltip from "../component/Tooltip";
import { getColor, shadeColor } from "../utils/utils";

export default function DepartmentBarChart({ clientName = "", transformedData }) {
  const departments = transformedData[clientName] || [];

  const bars = departments.map((d) => {
    const name = Object.keys(d)[0];
    return { name, ...d[name] };
  });

  const rowHeight = 40;
  const leftPadding = 140;
  const topPadding = 20;
  const chartHeight = bars.length * rowHeight;
  const chartWidth = 500;
  const maxBarWidth = chartWidth - 160;

  const max = Math.max(...bars.map((b) => b.total_allowance));
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const ticks = 5;
  const tickValues = Array.from({ length: ticks + 1 }).map(
    (_, i) => (max / ticks) * i
  );

  return (
    <div
      className="relative h-full flex flex-col p-4 gap-4"
      style={{ width: leftPadding + maxBarWidth + 100 }}
    >
      <h3 className="font-bold">{clientName}</h3>

      <div className="mt-4">
        <svg
          width={chartWidth + leftPadding}
          height={chartHeight + topPadding + 30}
        >
          {/* X-axis */}
          <line
            x1={leftPadding}
            y1={chartHeight + topPadding}
            x2={leftPadding + maxBarWidth}
            y2={chartHeight + topPadding}
            stroke="#999"
          />

          {tickValues.map((v, i) => {
            const x = leftPadding + (v / max) * maxBarWidth;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={chartHeight + topPadding}
                  x2={x}
                  y2={chartHeight + topPadding + 5}
                  stroke="#999"
                />
                <text
                  x={x}
                  y={chartHeight + topPadding + 20}
                  fontSize={10}
                  textAnchor="middle"
                >
                  ₹{Math.round(v).toLocaleString("en-IN")}
                </text>
              </g>
            );
          })}

          {bars.map((b, i) => {
            const width = (b.total_allowance / max) * maxBarWidth;
           const isHovered = hover?.name === b.name;

            return (
              <g
                key={b.name}
                transform={`translate(0, ${i * rowHeight + topPadding})`}
                onMouseMove={(e) => {
                  setHover(b);
                  setPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHover(null)}
              >
                <text x={0} y={25} fontSize={12}>
                  {b.name}
                </text>

                <rect
                  x={leftPadding}
                  y={10}
                  width={width}
                  height={18}
                  fill={isHovered ? shadeColor(getColor(i), 2) : getColor(i)}
                  className={`
                    cursor-pointer
                    transition-all duration-200
                    ${isHovered ? 'drop-shadow-[0_0_0_20px_rgba(255,215,0,0.8)]' : ''}
                    ${!hover || isHovered ? 'opacity-100' : 'opacity-30'}
                  `}
                />

                <text
                  x={Math.min(leftPadding + width + 8, leftPadding + maxBarWidth + 40)}
                  y={25}
                  fontSize={11}
                >
                  ₹{b.total_allowance.toLocaleString("en-IN")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <Tooltip x={pos.x} y={pos.y}>
        {hover && (
          <>
            <strong>{hover.name}</strong>
            <div>HC: {hover.head_count}</div>
            <hr />
            {["shift_A", "shift_B", "shift_C", "shift_PRIME"].map((s) => (
              <div key={s}>
                {s}: ₹{hover[s].total} (HC {hover[s].head_count})
              </div>
            ))}
          </>
        )}
      </Tooltip>
    </div>
  );
}
