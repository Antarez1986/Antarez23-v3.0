import React, { useState, useCallback } from 'react';
import StudentForm from './components/StudentForm';
import GeneratedContentDisplay from './components/GeneratedContent';
import ElaborateLoading from './components/ElaborateLoading';
import { generateStoryAndWorkshop } from './services/geminiService';
import type { FormData, GeneratedContent } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [currentStudentName, setCurrentStudentName] = useState<string>('');

  const handleGenerate = useCallback(async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setCurrentStudentName(data.studentName);
    try {
      const content = await generateStoryAndWorkshop(data);
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleReset = useCallback(() => {
    setGeneratedContent(null);
    setError(null);
    setIsLoading(false);
    setCurrentStudentName('');
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <ElaborateLoading studentName={currentStudentName} />
        </div>
      );
    }
    
    if (error) {
      return (
          <div className="text-center max-w-2xl mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-red-600 mb-4">¡Oh no! Algo salió mal.</h2>
              <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</p>
              <button onClick={handleReset} className="bg-gradient-to-r from-slate-600 to-slate-800 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
                  Intentar de Nuevo
              </button>
          </div>
      );
    }

    if (generatedContent) {
      return <GeneratedContentDisplay content={generatedContent} studentName={currentStudentName} onReset={handleReset} />;
    }

    return <StudentForm onGenerate={handleGenerate} isLoading={isLoading} />;
  }

  return (
    <main className="min-h-screen w-full p-4 sm:p-6 md:p-8 font-poppins relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      <div className="container mx-auto relative z-10">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
