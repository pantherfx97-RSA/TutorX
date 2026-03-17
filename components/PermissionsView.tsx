import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Mic, 
  FolderOpen, 
  ShieldCheck, 
  X, 
  Check,
  ChevronRight
} from 'lucide-react';

interface PermissionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAllow: () => void;
  onDeny: () => void;
  status: 'idle' | 'granted' | 'denied';
}

const PermissionCard: React.FC<PermissionCardProps> = ({ 
  icon, 
  title, 
  description, 
  onAllow, 
  onDeny, 
  status 
}) => {
  return (
    <motion.div 
      layout
      className={`p-6 rounded-[2rem] border transition-all ${
        status === 'granted' 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : status === 'denied'
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-slate-900/50 border-slate-800/50 hover:border-indigo-500/30'
      }`}
    >
      <div className="flex items-start gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
          status === 'granted' ? 'bg-emerald-500 text-white' : 
          status === 'denied' ? 'bg-red-500 text-white' : 
          'bg-slate-800 text-indigo-400'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
            {status === 'granted' && <Check size={20} className="text-emerald-500" />}
            {status === 'denied' && <X size={20} className="text-red-500" />}
          </div>
          <p className="text-slate-400 font-medium leading-relaxed mb-6">
            {description}
          </p>
          
          {status === 'idle' && (
            <div className="flex gap-3">
              <button 
                onClick={onAllow}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-500/10"
              >
                Allow Access
              </button>
              <button 
                onClick={onDeny}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Not Now
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface PermissionsViewProps {
  onComplete: () => void;
  requiredPermissions?: ('camera' | 'microphone' | 'storage')[];
}

const PermissionsView: React.FC<PermissionsViewProps> = ({ onComplete, requiredPermissions = ['camera', 'microphone', 'storage'] }) => {
  const [statuses, setStatuses] = React.useState<Record<string, 'idle' | 'granted' | 'denied'>>({
    camera: 'idle',
    microphone: 'idle',
    storage: 'idle'
  });

  const handlePermission = (key: string, status: 'granted' | 'denied') => {
    setStatuses(prev => ({ ...prev, [key]: status }));
    
    // Check if all required are handled
    const updated = { ...statuses, [key]: status };
    const allHandled = requiredPermissions.every(p => updated[p] !== 'idle');
    
    if (allHandled) {
      setTimeout(onComplete, 800);
    }
  };

  const permissionData = [
    {
      id: 'camera',
      icon: <Camera size={28} />,
      title: "Camera Permission",
      description: "TutorX uses your camera to scan homework questions and help solve them step-by-step."
    },
    {
      id: 'microphone',
      icon: <Mic size={28} />,
      title: "Microphone Permission",
      description: "Use your voice to ask TutorX questions and get spoken explanations."
    },
    {
      id: 'storage',
      icon: <FolderOpen size={28} />,
      title: "Storage Permission",
      description: "TutorX needs access to your storage so you can upload homework photos or study materials."
    }
  ].filter(p => requiredPermissions.includes(p.id as any));

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-2xl w-full py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Neural <span className="text-indigo-500">Permissions</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-md mx-auto">
            To provide a full masterclass experience, TutorX needs access to your device capabilities.
          </p>
        </motion.div>

        <div className="space-y-4">
          {permissionData.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <PermissionCard 
                icon={p.icon}
                title={p.title}
                description={p.description}
                status={statuses[p.id]}
                onAllow={() => handlePermission(p.id, 'granted')}
                onDeny={() => handlePermission(p.id, 'denied')}
              />
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 text-sm font-medium">
            You can manage these permissions anytime in your device settings.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PermissionsView;
