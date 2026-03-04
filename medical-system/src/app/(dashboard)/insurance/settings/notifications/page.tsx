
import { Bell, Mail, Smartphone, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NotificationsSettingsPage() {
    const notificationTypes = [
        { name: "Email Alerts", icon: Mail, desc: "Receive updates about claims and policies via email.", enabled: true },
        { name: "Push Notifications", icon: Smartphone, desc: "Get real-time browser alerts for urgent actions.", enabled: false },
        { name: "System Alerts", icon: Bell, desc: "In-portal notifications for routine system updates.", enabled: true },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <Link href="/insurance/settings" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-2 transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Settings
                </Link>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Bell className="h-8 w-8 text-purple-400" />
                    Notification Preferences
                </h1>
                <p className="text-white/50 mt-1">Control how and when you want to be notified about portal activity.</p>
            </div>

            <div className="glass p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {notificationTypes.map((type, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl">
                                    <type.icon className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{type.name}</h3>
                                    <p className="text-sm text-white/30">{type.desc}</p>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${type.enabled ? 'bg-blue-600' : 'bg-white/10'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${type.enabled ? 'left-7' : 'left-1'}`} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95">
                        <Save className="h-5 w-5" />
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
