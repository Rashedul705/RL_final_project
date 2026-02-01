"use client";

import { useState } from "react";
import { Truck, Copy, Check } from "lucide-react";

export function ShippingOffer() {
    const [copied, setCopied] = useState(false);
    const code = "FREESHIP";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-slate-50 border-y border-slate-200 py-6 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 hover:shadow-md transition-shadow duration-300">

                    <div className="flex items-center gap-4">
                        <div className="bg-[#FE45A0]/10 p-3 rounded-full shrink-0">
                            <Truck className="w-6 h-6 md:w-8 md:h-8 text-[#FE45A0]" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-lg md:text-xl font-bold text-slate-800">
                                Free Shipping Available!
                            </h3>
                            <p className="text-slate-500 text-sm md:text-base">
                                Get free delivery on your order today
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={copyToClipboard}
                        className="cursor-pointer group relative flex flex-col items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg transition-all active:scale-[0.98] w-full md:w-auto"
                        title="Click to copy"
                    >
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Coupon Code</span>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xl md:text-2xl font-bold tracking-wider text-[#FE45A0]">
                                {code}
                            </span>
                            {copied ? (
                                <Check className="w-5 h-5 text-green-400 animate-in zoom-in" />
                            ) : (
                                <Copy className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            )}
                        </div>

                        {copied && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                                Copied to clipboard!
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
