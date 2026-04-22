import React from 'react';
import { User, Bell, Shield, Palette, Database, Globe, Save } from 'lucide-react';

const Settings = () => {
  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Manage your public profile and personal information' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Configure how you receive alerts and updates' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Update passwords and security preferences' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Customize the look and feel of your dashboard' },
    { id: 'data', label: 'Data Management', icon: Database, desc: 'Export or backup your business data' },
    { id: 'regional', label: 'Regional', icon: Globe, desc: 'Set your timezone and currency preferences' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <button key={section.id} className="group text-left p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <section.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{section.label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{section.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">General Configuration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Basic application behavior and branding</p>
            </div>
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" defaultValue="Abbasi Cable" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Support Email</label>
              <input type="email" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" defaultValue="support@abbasicalble.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Currency Symbol</label>
              <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                <option>PKR (Rs.)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Mode</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="mode" className="w-4 h-4 text-blue-600" defaultChecked />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Production</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="mode" className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Maintenance</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
