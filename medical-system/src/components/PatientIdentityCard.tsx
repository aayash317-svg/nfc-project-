'use client';

import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { Nfc, CreditCard, Download, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

export function PatientIdentityCard({
    nfcTagId,
    qrCodeToken,
    patientId
}: {
    nfcTagId: string;
    qrCodeToken: string;
    patientId: string;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const downloadCard = async () => {
        if (!cardRef.current) return;

        setDownloading(true);
        try {
            // Wait a tiny bit for any layout/font shifts
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: '#0f172a', // Matches cyan-900/40 deep base
                style: {
                    borderRadius: '0px', // Prevent clipped corners in the file itself if needed
                }
            });

            const link = document.createElement('a');
            link.download = `health-id-${nfcTagId}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download ID card. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div
                ref={cardRef}
                className="bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-purple-900/30 border border-cyan-500/20 p-6 rounded-2xl shadow-lg"
            >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* QR Code */}
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Health Identity QR</p>
                        <QRCodeGenerator value={qrCodeToken} size={160} />
                    </div>

                    {/* Identity Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-500/20 p-2.5 rounded-xl">
                                <Nfc className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">NFC Tag ID</p>
                                <p className="font-mono text-lg font-bold text-cyan-300 tracking-wider">{nfcTagId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/20 p-2.5 rounded-xl">
                                <CreditCard className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Digital Health ID</p>
                                <p className="font-mono text-sm text-blue-300">{patientId.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Show this QR or tap your NFC-enabled card at any registered hospital to access your records instantly.
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={downloadCard}
                disabled={downloading}
                className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
            >
                {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                )}
                {downloading ? 'Generating Image...' : 'Download Health ID Image'}
            </button>
        </div>
    );
}
