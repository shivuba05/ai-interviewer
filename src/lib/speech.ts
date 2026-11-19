// Voice Recognition (Web Speech API) & Text-to-Speech (SpeechSynthesis API)
import { InterviewLanguage } from '../types';

export function getLanguageCode(language: InterviewLanguage): string {
  switch (language) {
    case 'Hindi':
      return 'hi-IN';
    case 'Kannada':
      return 'kn-IN';
    case 'English':
    default:
      return 'en-US';
  }
}

// -------------------------------------------------------------
// Real Microphone Audio Analyser (Live RMS Decibel Level)
// -------------------------------------------------------------
export interface AudioLevelMeter {
  stop: () => void;
}

export function createAudioLevelMeter(
  stream: MediaStream,
  onLevel: (level: number) => void // 0 to 100
): AudioLevelMeter | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    const audioCtx = new AudioContextClass();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animId: number;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      // Scale to 0-100
      const normalized = Math.min(100, Math.round((avg / 128) * 100));
      onLevel(normalized);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return {
      stop: () => {
        cancelAnimationFrame(animId);
        try {
          source.disconnect();
          analyser.disconnect();
          if (audioCtx.state !== 'closed') {
            audioCtx.close();
          }
        } catch (e) {}
      },
    };
  } catch (err) {
    console.warn('AudioContext level meter could not be initialized:', err);
    return null;
  }
}

// -------------------------------------------------------------
// Text-to-Speech (AI Voice)
// -------------------------------------------------------------
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string,
  language: InterviewLanguage = 'English',
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    rate?: number;
    pitch?: number;
    volume?: number;
  }
): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    options?.onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting symbols like * or # for smooth conversational delivery
  const cleanText = text
    .replace(/[*_#`~>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    options?.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = getLanguageCode(language);
  utterance.rate = options?.rate ?? 0.95; // Natural conversational tempo
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;

  // Try to find a high-quality natural voice for the target language
  const voices = window.speechSynthesis.getVoices();
  const langCode = utterance.lang.toLowerCase();
  const matchedVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(langCode.slice(0, 2)) &&
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online') || v.name.includes('Neural'))
  ) || voices.find((v) => v.lang.toLowerCase().startsWith(langCode.slice(0, 2)));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    options?.onError?.(e);
    options?.onEnd?.();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function pauseSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.resume();
  }
}

// -------------------------------------------------------------
// Voice Recognition (Microphone to Text)
// -------------------------------------------------------------
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export interface SpeechRecognizerInstance {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function createSpeechRecognizer(
  language: InterviewLanguage,
  callbacks: {
    onTranscript: (finalTranscript: string, interimTranscript: string) => void;
    onError: (error: string) => void;
    onEnd: () => void;
    onStart?: () => void;
  }
): SpeechRecognizerInstance | null {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError('Web Speech Recognition is not supported in this browser. Please type your answer or use Google Chrome / Microsoft Edge.');
    return null;
  }

  const SpeechRecognitionConstructor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognitionConstructor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = getLanguageCode(language);
  recognition.maxAlternatives = 1;

  let finalTranscriptAccumulator = '';
  let isIntentionallyStopped = false;

  recognition.onstart = () => {
    isIntentionallyStopped = false;
    callbacks.onStart?.();
  };

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const part = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscriptAccumulator += (finalTranscriptAccumulator ? ' ' : '') + part;
      } else {
        interim += part;
      }
    }
    callbacks.onTranscript(finalTranscriptAccumulator, interim);
  };

  recognition.onerror = (event: any) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      callbacks.onError('Microphone access was denied. Please allow microphone permissions in your browser URL bar.');
    } else if (event.error !== 'no-speech') {
      console.warn('SpeechRecognition notice:', event.error);
    }
  };

  recognition.onend = () => {
    if (!isIntentionallyStopped) {
      callbacks.onEnd();
    }
  };

  return {
    start: () => {
      finalTranscriptAccumulator = '';
      isIntentionallyStopped = false;
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    },
    stop: () => {
      isIntentionallyStopped = true;
      try {
        recognition.stop();
      } catch (err) {}
    },
    abort: () => {
      isIntentionallyStopped = true;
      try {
        recognition.abort();
      } catch (err) {}
    },
  };
}
