import { useState, useEffect, useRef } from "react";
import { getColor, describeArc, polarToCartesian } from "../utils/utils";
import Tooltip from "../component/Tooltip";

export default function DonutChart({ clients, onSelectClient }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState(320);
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [centerClient, setCenterClient] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setSize(Math.min(containerRef.current.offsetWidth, 320));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const firstKey = Object.keys(clients)[0];
    setCenterClient(firstKey);
    onSelectClient(firstKey);
  }, []);
  const radius = size / 2 - 40;
  const donutThickness = radius * 0.28;

  const data = Object.entries(clients);
  const total = data.reduce((s, [, c]) => s + c.total_allowance, 0);

  let angle = 0;

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg width={size * 2} height={size}>
        <g transform={`translate(${size}, ${size / 2})`}>
          {data.map(([name, client], i) => {
            const slice = (client.total_allowance / total) * 360;
            const startAngle = angle;
            const endAngle = angle + slice;
            const midAngle = startAngle + slice / 2;
            angle += slice;
            const isFullCircle = slice >= 359.99;

            const path = !isFullCircle
              ? describeArc(0, 0, radius, startAngle, endAngle)
              : null;

            const angleRad = (midAngle * Math.PI) / 180;

            const bendDeg = 8;
            const bendRad =
              (Math.sign(Math.cos(angleRad)) * bendDeg * Math.PI) / 180;
            const finalAngle = angleRad + bendRad;
            const dx = Math.cos((150 * Math.PI) / 180);
            const dy = Math.sin(finalAngle);
            const radialLen = 32;

            const lineStart = polarToCartesian(0, 0, radius, midAngle);
            const lineMiddle = polarToCartesian(
              0,
              0,
              radius + radialLen,
              midAngle
            );

            const labelPos = {
              x: lineMiddle.x + dx,
              y: lineMiddle.y + dy,
            };

            const isHovered = hover?.name === name;
            const textAnchor = midAngle > 180 ? "end" : "start";

            return (
              <g key={name}>
                {isFullCircle ? (
                  <circle
                    cx="0"
                    cy="0"
                    r={radius}
                    fill="none"
                    stroke={getColor(i)}
                    strokeWidth={donutThickness}
                    cursor="pointer"
                    className="transition-all duration-200"
                    onClick={() => {
                      setCenterClient(name);
                      onSelectClient(name);
                    }}
                    onMouseMove={(e) => {
                      setHover({ name, client });
                      setPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHover(null)}
                  />
                ) : (
                  <path
                    d={path}
                    fill="none"
                    stroke={getColor(i)}
                    strokeWidth={donutThickness}
                    cursor="pointer"
                    className={`
      transition-all duration-200
      ${isHovered ? "drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]" : ""}
      ${!hover || isHovered ? "opacity-100" : "opacity-30"}
    `}
                    onClick={() => {
                      setCenterClient(name);
                      onSelectClient(name);
                    }}
                    onMouseMove={(e) => {
                      setHover({ name, client });
                      setPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHover(null)}
                  />
                )}

                {Object.keys(clients).length < 11 && (
                  <>
                    <line
                      x1={lineStart.x}
                      y1={lineStart.y}
                      x2={lineMiddle.x}
                      y2={lineMiddle.y}
                      stroke="#666"
                      strokeWidth={1}
                    />

                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      dominantBaseline="start"
                      textAnchor={textAnchor}
                      fontSize={Math.max(10, size / 36)}
                      className="font-medium select-none"
                    >
                      {name}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          <text
            x="0"
            y="-60"
            textAnchor="middle"
            dominantBaseline="start"
            className="font-semibold text-base cursor-pointer"
          >
            {centerClient ? (
              Object.entries(clients)
                .filter(([name]) => name === centerClient)
                .map(([name, client], index) => (
                  <tspan
                    key={name}
                    x="0"
                    dy={index === 0 ? "0em" : "1em"}
                    fontSize={12}
                    className="font-medium text-black"
                  >
                    {name}
                    <tspan
                      x="0"
                      dy="1.4em"
                      className="font-normal"
                      fontSize={14}
                    >
                      ₹{client.total_allowance.toLocaleString("en-IN")}
                    </tspan>
                    <tspan
                      x="0"
                      dy="1.5em"
                      className="font-normal "
                      fontSize={14}
                    >
                      HeadCount - ₹{client.head_count.toLocaleString("en-IN")}
                    </tspan>
                    <tspan
                      x="0"
                      dy="1.5em"
                      className="font-normal"
                      fontSize={14}
                    >
                      Shift A - ₹{client.shift_A.total.toLocaleString("en-IN")}
                    </tspan>
                    <tspan
                      x="0"
                      dy="1.5em"
                      className="font-normal"
                      fontSize={14}
                    >
                      Shift B - ₹{client.shift_B.total.toLocaleString("en-IN")}
                    </tspan>
                    <tspan
                      x="0"
                      dy="1.5em"
                      className="font-normal"
                      fontSize={14}
                    >
                      Shift C - ₹{client.shift_C.total.toLocaleString("en-IN")}
                    </tspan>
                    <tspan
                      x="0"
                      dy="1.5em"
                      className="font-normal"
                      fontSize={14}
                    >
                      Shift PRIME - ₹
                      {client.shift_PRIME.total.toLocaleString("en-IN")}
                    </tspan>
                  </tspan>
                ))
            ) : (
              <tspan>Clients</tspan>
            )}
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      <Tooltip x={pos.x} y={pos.y}>
        {hover && (
          <>
            <strong>{hover.name}</strong>
            <div>₹ {hover.client.total_allowance.toLocaleString()}</div>
            <div>HC: {hover.client.head_count}</div>
          </>
        )}
      </Tooltip>
    </div>
  );
}
