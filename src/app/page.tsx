import VigilantDriveApp from '@/components/vigilant-drive/VigilantDriveApp';
import { Shield, Eye, Bell, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl">E</div>
            <span className="font-headline font-bold text-xl tracking-tight">EYE BLINK DETECTION</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Features</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
            <a href="#" className="hover:text-primary transition-colors">Safety Guide</a>
            <a href="#" className="hover:text-primary transition-colors">About</a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <VigilantDriveApp />

        <section className="bg-white py-20 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black font-headline mb-4">Enterprise-Grade Driver Monitoring</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Utilizing state-of-the-art computer vision and MediaPipe's float16 neural network to keep you safe on the road.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Eye className="w-10 h-10 text-primary" />,
                  title: "Real-time Tracking",
                  desc: "Analyzes over 470 facial landmarks every frame to monitor eye aspect ratio and blink rate."
                },
                {
                  icon: <Shield className="w-10 h-10 text-secondary" />,
                  title: "Privacy First",
                  desc: "All processing happens locally on your device. Your camera feed never leaves your browser."
                },
                {
                  icon: <Bell className="w-10 h-10 text-primary" />,
                  title: "Smart Alerts",
                  desc: "Multi-stage audible and visual warnings that scale based on detected drowsiness levels."
                },
                {
                  icon: <Activity className="w-10 h-10 text-secondary" />,
                  title: "Motion Analysis",
                  desc: "Goes beyond eyes to track head tilt and posture for comprehensive fatigue detection."
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl">E</div>
              <span className="font-headline font-bold text-2xl tracking-tight">EYE BLINK DETECTION</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-6">
              Empowering drivers with advanced AI safety tools. Built with MediaPipe, Genkit, and next-generation vision models.
            </p>
            <p className="text-xs text-slate-500">
              © 2024 EYE BLINK DETECTION Safety Systems. All rights reserved.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Technology</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>MediaPipe Face Landmarker</li>
              <li>Genkit Flows</li>
              <li>Next.js App Router</li>
              <li>React Vision Tasks</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Documentation</li>
              <li>API Status</li>
              <li>Safety Standards</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
