'use client';

import { useState } from 'react';

interface CallRecord {
  id: string;
  patientName: string;
  status: 'Live' | 'Answered' | 'Missed';
  phoneNo: string;
  callType: 'Incoming call' | 'Outgoing call' | 'View Chat';
  duration: string;
  date: string;
  hasTranscript?: boolean;
  isChat?: boolean;
  transcript?: string;
  aiSummary?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
}

interface CallDetailsModalProps {
  call: CallRecord;
  onClose: () => void;
}

interface TranscriptEntry {
  user: string;
  bot: string;
  label: string;
  class_id: number;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'patient';
  message: string;
  timestamp?: string;
}

const sampleTranscript: ChatMessage[] = [
  {
    id: '1',
    sender: 'ai',
    message: 'Hello XYZ, how are you today? Hello XYZ, how are you today?\nHello XYZ, how are you today?',
  },
  {
    id: '2',
    sender: 'patient',
    message: "Hello,I'm fine, Hello,I'm fine, Hello,I'm fine,\nHello,I'm fine, Hello,I'm fine, Hello,I'm fine,\nHello,I'm fine",
  },
  {
    id: '3',
    sender: 'ai',
    message: 'Hello XYZ, how are you today? Hello XYZ, how are you today?\nHello XYZ, how are you today?',
  },
  {
    id: '4',
    sender: 'patient',
    message: "Hello,I'm fine, Hello,I'm fine, Hello,I'm fine,",
  },
  {
    id: '5',
    sender: 'ai',
    message: 'Hello XYZ, how are you today? Hello XYZ, how are you today?\nHello XYZ, how are you today?',
  },
];

export default function CallDetailsModal({ call, onClose }: CallDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('transcript');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('02:45');
  const [totalTime] = useState('05:00');
  const [playbackSpeed, setPlaybackSpeed] = useState('1.5x');

  // Parse transcript JSON and convert to ChatMessage format
  const parseTranscript = (transcriptJson: string | undefined): ChatMessage[] => {
    if (!transcriptJson) return [];

    try {
      const entries: TranscriptEntry[] = JSON.parse(transcriptJson);
      const messages: ChatMessage[] = [];

      entries.forEach((entry, index) => {
        // Add patient message if it exists
        if (entry.user && entry.user.trim()) {
          messages.push({
            id: `patient-${index}`,
            sender: 'patient',
            message: entry.user.trim(),
          });
        }

        // Add AI/bot message if it exists
        if (entry.bot && entry.bot.trim()) {
          messages.push({
            id: `ai-${index}`,
            sender: 'ai',
            message: entry.bot.trim(),
          });
        }
      });

      return messages;
    } catch (error) {
      console.error('Error parsing transcript:', error);
      return [];
    }
  };

  const transcriptMessages = parseTranscript(call.transcript);

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2*$3');
  };

  const getCallTypeInfo = () => {
    const isOutgoing = call.callType === 'Outgoing call';
    return {
      text: isOutgoing ? 'Outgoing call' : call.callType,
      icon: isOutgoing ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      ) : null,
    };
  };

  const callTypeInfo = getCallTypeInfo();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" style={{ backgroundColor: '#0000004D' }} onClick={onClose}></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{call.patientName}</h2>
              <p className="text-sm text-gray-500">Phone- {formatPhoneNumber(call.phoneNo)}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Call Details */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Call Details</h3>
              <span className="text-sm text-gray-500">Date- {call.date}</span>
            </div>

            {/* Call Duration and Type */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Start- End Time</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {call.startTime || 'N/A'}{call.endTime ? ` - ${call.endTime}` : ''} ({call.duration})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600">
                {callTypeInfo.icon}
                <span className="text-sm font-medium">{callTypeInfo.text}</span>
              </div>
            </div>

            {/* Audio Player */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">Call Recording</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Waveform */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                  
                  {/* Waveform bars */}
                  <div className="flex-1 flex items-center gap-0.5 h-8">
                    {Array.from({ length: 80 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full ${
                          i < 30 ? 'bg-primary' : 'bg-gray-300'
                        }`}
                        style={{
                          height: `${Math.random() * 100 + 20}%`,
                        }}
                      />
                    ))}
                  </div>
                  
                  <button className="px-3 py-1 bg-primary text-white text-xs rounded-md hover:bg-primary-hover">
                    {playbackSpeed}
                  </button>
                </div>
                
                {/* Time display */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{currentTime}</span>
                  <span>{totalTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Call Summary
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transcript'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Transcript
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'summary' ? (
              <div className="bg-gray-50 rounded-lg p-4">
                {call.aiSummary ? (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {call.aiSummary}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">No summary available</p>
                )}
                {call.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{call.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {transcriptMessages.length > 0 ? transcriptMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {message.sender === 'ai' ? (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Message */}
                    <div className={`flex-1 ${message.sender === 'ai' ? 'mr-12' : 'ml-12'}`}>
                      <div
                        className={`p-3 rounded-lg text-sm leading-relaxed ${
                          message.sender === 'ai'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.message.split('\n').map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                      
                      {/* Print button for patient messages */}
                      {message.sender === 'patient' && (
                        <button className="mt-2 text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No transcript available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
