import React, { HTMLAttributes } from 'react';

interface EmojiProps extends HTMLAttributes<HTMLSpanElement> {
    symbol: string;
    label?: string;
    size?: number;
}

export function Emoji({ symbol, label, size, ...props }: EmojiProps) {
    return (
        <span
            {...props}
            style={{
                fontSize: size,
            }}
            role="img"
            aria-label={label || ''}
            aria-hidden={label ? 'false' : 'true'}
        >
            {symbol}
        </span>
    );
}
