
import VigilantDriveApp from '@/components/vigilant-drive/VigilantDriveApp';
import { Shield, Eye, Bell, Activity, Lock, Smartphone, HeartPulse, Info } from 'lucide-react';

/**
 * EYE BLINK DETECTION - Driver Safety Monitoring
 * Metadata Version: 1.1.2
 */

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen scroll-smooth">
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
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#security" className="hover:text-primary transition-colors">Security</a>
            <a href="#safety" className="hover:text-primary transition-colors">Safety Guide</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* App Section */}
        <section className="py-12">
          <VigilantDriveApp />
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-24 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black font-headline mb-4">Core Technology Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                High-precision driver monitoring powered by industry-leading computer vision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Eye className="w-10 h-10 text-primary" />,
                  title: "Neural Blink Detection",
                  desc: "Utilizes 478-point facial landmarks to track eye closures even through spectacles and low light."
                },
                {
                  icon: <Smartphone className="w-10 h-10 text-secondary" />,
                  title: "Mobile Optimized",
                  desc: "Zero-latency processing specifically tuned for mobile browsers and front-facing cameras."
                },
                {
                  icon: <Bell className="w-10 h-10 text-primary" />,
                  title: "Emergency Siren",
                  desc: "Piercing high-frequency audio alerts that trigger instantly when micro-sleep is detected."
                },
                {
                  icon: <Activity className="w-10 h-10 text-secondary" />,
                  title: "Head Pose Analysis",
                  desc: "Monitors head tilt and pitch to detect when a driver's attention is drifting from the road."
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

        {/* Security Section */}
        <section id="security" className="bg-slate-50 py-24 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-bold mb-6">
                  <Lock className="w-4 h-4" /> Privacy-First Architecture
                </div>
                <h2 className="text-4xl font-black font-headline mb-6">Your Camera Data Never Leaves Your Device</h2>
                <div className="space-y-6 text-lg text-muted-foreground">
                  <p>
                    Unlike traditional cloud-based AI, EYE BLINK DETECTION processes all video frames <b>locally</b> on your browser using WebAssembly and GPU acceleration.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <span>No images or videos are ever uploaded to our servers.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <span>Real-time processing is end-to-end encrypted on the hardware level.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <span>Open-source MediaPipe framework ensures transparent security standards.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="relative aspect-square bg-white rounded-[3rem] shadow-2xl p-12 flex items-center justify-center border-8 border-slate-100">
                  <Lock className="w-32 h-32 text-primary animate-bounce" />
                  <div className="absolute -bottom-4 -right-4 bg-secondary text-white p-6 rounded-2xl shadow-xl font-bold">
                    100% OFFLINE DATA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Guide Section */}
        <section id="safety" className="bg-white py-24 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black font-headline mb-4">Driver Safety Protocol</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Please read these instructions before engaging the system for a long-distance drive.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-[2rem] border border-orange-100 bg-orange-50/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-700">
                  <HeartPulse className="w-5 h-5" /> Calibration
                </h3>
                <p className="text-slate-600">
                  Always use the "TEST ALARM" button before starting your vehicle. Ensure your device volume is at 100% and correctly positioned at eye level.
                </p>
              </div>
              <div className="p-8 rounded-[2rem] border border-blue-100 bg-blue-50/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
                  <Activity className="w-5 h-5" /> Positioning
                </h3>
                <p className="text-slate-600">
                  Mount your mobile device securely on the dashboard. Avoid holding the phone while driving, as this increases risk and reduces detection accuracy.
                </p>
              </div>
              <div className="p-8 rounded-[2rem] border border-red-100 bg-red-50/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700">
                  <Info className="w-5 h-5" /> Emergency
                </h3>
                <p className="text-slate-600">
                  If the "Extremely Drowsy" alert triggers, <b>pull over immediately</b> at the nearest safe location. Do not attempt to "power through" fatigue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-slate-900 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-8">E</div>
            <h2 className="text-4xl font-black font-headline mb-6">Our Mission</h2>
            <p className="text-slate-400 max-w-3xl text-xl leading-relaxed">
              EYE BLINK DETECTION was founded with a single goal: to reduce road accidents caused by driver fatigue. By combining advanced neural networks with the ubiquity of modern smartphones, we provide a life-saving safety layer that is accessible to every driver on the planet, regardless of their vehicle's age or technology.
            </p>
            <div className="mt-12 flex gap-4">
              <div className="px-6 py-3 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm">
                Built with <b>Google MediaPipe</b>
              </div>
              <div className="px-6 py-3 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm">
                Next.js 15
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800">
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
              <li>Wasm GPU Acceleration</li>
              <li>Next.js App Router</li>
              <li>React Vision Tasks</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Safety Standards</li>
              <li>Data Protection</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
