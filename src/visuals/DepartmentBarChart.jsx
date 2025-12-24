import { useState } from "react";
import Tooltip from "../component/Tooltip";
import { formatRupeesWithUnit, getColor, shadeColor } from "../utils/utils";

export default function DepartmentBarChart({
  clientName = "",
  transformedData,
  setClickedClient,
}) {
  const departments = transformedData[clientName] || [];

  const bars = departments.map((d) => {
    const name = Object.keys(d)[0];
    return { name, ...d[name] };
  });

  const rowHeight = 40;
  const leftPadding = 140;
  const topPadding =0;
  const chartHeight = bars.length * rowHeight;
  const chartWidth = 300;
  const maxBarWidth = chartWidth - 160;

  const max = Math.max(...bars.map((b) => b.total_allowance));
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const ticks = 4;
  // const tickValues = Array.from({ length: ticks + 1 }).map(
  //   (_, i) => (max / ticks) * i
  // );

  return (
    <div className="relative h-full flex flex-col p-4 gap-4 w-full -z-10">
      <h3 className="font-bold">{clientName}</h3>

      <div className="mt-4 ">
        <svg
          width={chartWidth + leftPadding + 100}
          height={chartHeight + topPadding + 30}
        >
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
                    ${
                      isHovered
                        ? "drop-shadow-[0_0_0_20px_rgba(255,215,0,0.8)]"
                        : ""
                    }
                    ${!hover || isHovered ? "opacity-100" : "opacity-30"}
                  `}
                />

                <text
                  x={Math.min(
                    leftPadding + width + 8,
                    leftPadding + maxBarWidth + 40
                  )}
                  y={25}
                  fontSize={11}
                >
                  {formatRupeesWithUnit(b.total_allowance)}
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
                {s}: {formatRupeesWithUnit(hover[s].total)} (HC {hover[s].head_count})
              </div>
            ))}
          </>
        )}
      </Tooltip>
    </div>
  );
}
