import React, { useState } from 'react';

// ─── Regex Helpers ────────────────────────────────────────────────────────────
const operatorsRegEx = /[+\-*/]/;
const decimalRegEx = /^-?(?:\d+|\d+\.\d*)$/;
const leadingZeroRegEx = /^(?:[1-9]|0\.)/g;

// ─── Types ────────────────────────────────────────────────────────────────────
type InputArray = string[];

// ─── Main Component ───────────────────────────────────────────────────────────
const JavascriptCalculator: React.FC = () => {
    const [input, setInput] = useState<InputArray>([]);
    const [result, setResult] = useState<string>('');
    const [tempNum, setTempNum] = useState<string[]>([]);

    const handleClick = (value: string) => {
        const letTempNum = [...tempNum, value];
        const lastElementIndex = letTempNum.length - 1;
        const lastInputElement = `${input[input.length - 1]}`;
        const lastInputIndex = input.length - 1;

        //======================================== EQUALS ========================================
        if (value === '=') {
            if (input.length === 0) return;
            if (lastInputElement === '=') return;
            if (lastInputElement.match(operatorsRegEx)) return;

            const finalResult = Math.floor(eval(input.join('')) * 1_000_000) / 1_000_000;
            setResult(finalResult.toString());
            setInput([...input, value]);
            setTempNum([]);

            //======================================== ALL CLEAR ========================================
        } else if (value === 'AC') {
            setResult('');
            setInput([]);
            setTempNum([]);

            //======================================== DELETE ========================================
        } else if (value === 'DEL') {
            setInput([...input.slice(0, lastInputIndex)]);

            //======================================== OPERATORS ========================================
        } else if ((value.match(operatorsRegEx) && input.length > 0) || (value === '-' && input.length === 0)) {

            if (lastInputElement === '-' && value.match(operatorsRegEx) && input.length === 1) return;

            const secondLastInputElement = `${input[input.length - 2]}`;

            // Two operators before minus — remove both and replace
            if (secondLastInputElement.match(operatorsRegEx) && lastInputElement === '-' && value.match(operatorsRegEx)) {
                setInput([...input.slice(0, -2), value]);
                return;
            }

            // Minus after operator: allow it as a negative sign
            if (lastInputElement.match(operatorsRegEx) && value === '-') {
                setInput([...input, value]);
                return;
            }

            // Chaining after equals: carry the result forward
            if (lastInputElement === '=') {
                const withoutEquals = [...input.slice(0, lastInputIndex)];
                const finalResult = Math.floor(eval(withoutEquals.join('')) * 1_000_000) / 1_000_000;
                setInput([finalResult.toString(), value]);
                return;
            }

            // Replace last operator with the new one
            if (lastInputElement.match(operatorsRegEx) && input.length > 0) {
                setInput([...input.slice(0, lastInputIndex), value]);
                return;
            }

            setInput([...input, value]);
            setTempNum([]);

            //======================================== NUMBERS & DECIMAL ========================================
        } else if (value.match(/\d|\./)) {
            setTempNum([...tempNum, value]);

            // After equals, start fresh
            if (lastInputElement === '=') {
                setInput([value]);
                setResult('');
                return;
            }

            const tempNumCheck = letTempNum.join('').match(decimalRegEx);
            const leadingZeroCheck = letTempNum.join('').match(leadingZeroRegEx);

            // Reject invalid entry (multiple decimals, leading zero before digit)
            if (!tempNumCheck || (letTempNum.length > 1 && !leadingZeroCheck)) {
                letTempNum.splice(lastElementIndex, 1);
                setTempNum(letTempNum);
                setInput([...input]);
            } else {
                setInput([...input, value]);
            }
        }
    };

    // ── Unified display logic ──────────────────────────────────────────────────
    // The original had TWO <p> tags — one for raw input history and one for the
    // result — which was an artefact needed purely for the FCC test runner.
    // Here we collapse them into a single display:
    //   • Empty state         → "0"
    //   • Result available    → show result
    //   • Otherwise           → show the current input expression
    const displayValue: string =
        result !== ''
            ? result
            : input.length === 0
                ? '0'
                : input.join('');


    return (
        <div
            id="main"
            className="w-full max-w-xs mx-auto border-4 border-acid shadow-neo bg-paper flex flex-col"
        >
            {/* ── Display ─────────────────────────────────────────────────── */}
            <div className="flex flex-col border-b-4 border-ink">
                {/* Expression history (dimmed, small) */}
                <p className="px-4 pt-3 pb-0 font-mono text-xs text-ink/40 text-right min-h-[1.5rem] truncate">
                    {result !== '' ? input.slice(0, -1).join('') : ''}
                </p>
                {/* Primary display */}
                <p
                    id="display"
                    className="px-4 pt-1 pb-4 font-sans font-black text-right text-3xl tracking-tighter text-ink leading-none min-h-[3.5rem] overflow-x-auto whitespace-nowrap"
                >
                    {displayValue}
                </p>
            </div>

            {/* ── Buttons ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 border-collapse">

                {/* Row 1: AC (spans 2) | DEL | + */}
                <CalcBtn id="clear" value="AC" label="AC" onClick={handleClick} accent="dark" span={2} />
                <CalcBtn id="DEL" value="DEL" label="DEL" onClick={handleClick} accent="operator" />
                <CalcBtn id="add" value="+" label="+" onClick={handleClick} accent="operator" />

                {/* Row 2: 7 8 9 − */}
                <CalcBtn id="seven" value="7" label="7" onClick={handleClick} />
                <CalcBtn id="eight" value="8" label="8" onClick={handleClick} />
                <CalcBtn id="nine" value="9" label="9" onClick={handleClick} />
                <CalcBtn id="subtract" value="-" label="−" onClick={handleClick} accent="operator" />

                {/* Row 3: 4 5 6 × */}
                <CalcBtn id="four" value="4" label="4" onClick={handleClick} />
                <CalcBtn id="five" value="5" label="5" onClick={handleClick} />
                <CalcBtn id="six" value="6" label="6" onClick={handleClick} />
                <CalcBtn id="multiply" value="*" label="×" onClick={handleClick} accent="operator" />

                {/* Row 4: 1 2 3 ÷ */}
                <CalcBtn id="one" value="1" label="1" onClick={handleClick} />
                <CalcBtn id="two" value="2" label="2" onClick={handleClick} />
                <CalcBtn id="three" value="3" label="3" onClick={handleClick} />
                <CalcBtn id="divide" value="/" label="/" onClick={handleClick} accent="operator" />

                {/* Row 5: 0 (spans 2) | . | = */}
                <CalcBtn id="zero" value="0" label="0" onClick={handleClick} span={2} />
                <CalcBtn id="decimal" value="." label="." onClick={handleClick} />
                <CalcBtn id="equals" value="=" label="=" onClick={handleClick} accent="operator" />
            </div>
        </div>
    );
};

// ─── Button Sub-component ─────────────────────────────────────────────────────
interface CalcBtnProps {
    id: string;
    value: string;
    label: string;
    onClick: (value: string) => void;
    accent?: 'dark' | 'operator';
    span?: 2;
}

const CalcBtn: React.FC<CalcBtnProps> = ({ id, value, label, onClick, accent, span }) => {
    const base =
        'h-14 border border-ink font-sans font-black text-lg uppercase tracking-wider ' +
        'flex items-center justify-center cursor-pointer select-none ' +
        'active:translate-x-px active:translate-y-px transition-all ';

    const colour =
        accent === 'dark' ? 'bg-ink text-paper hover:bg-acid hover:text-ink ' :
            accent === 'operator' ? 'bg-surface-muted text-ink hover:bg-acid ' :
                'bg-paper text-ink hover:bg-acid ';

    const colSpan = span === 2 ? 'col-span-2' : 'col-span-1';

    return (
        <button
            id={id}
            value={value}
            onClick={() => onClick(value)}
            className={`${base}${colour}${colSpan}`}
        >
            {label}
        </button>
    );
};

export default JavascriptCalculator;
