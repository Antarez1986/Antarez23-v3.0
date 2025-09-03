
import React, { useState, useEffect } from 'react';
import type { FormData } from '../types';
import { Difficulty } from '../types';
import { SCHOOL_GRADES, TEXT_TYPES, PREFERENCES, DIFFICULTIES, EXTRA_ACTIVITIES } from '../constants';

interface StudentFormProps {
  onGenerate: (data: FormData) => void;
  isLoading: boolean;
}

const LOCAL_STORAGE_KEY = 'creativeWorkshopFormData';

// Helper component for styled section headers
const SectionHeader: React.FC<{ icon: string; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-4xl shadow-lg">
      {icon}
    </div>
    <div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      <p className="text-slate-500">{subtitle}</p>
    </div>
  </div>
);

// Helper component for styled checkbox tags
const CheckboxTag: React.FC<{ value: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; field: 'preferences' | 'extraActivities' }> = ({ value, checked, onChange, field }) => {
  const baseClasses = "flex items-center space-x-2 cursor-pointer p-3 rounded-full border-2 transition-all duration-200 text-sm font-semibold";
  const colorClasses = {
    preferences: {
      checked: 'bg-sky-500 border-sky-500 text-white shadow-md',
      unchecked: 'bg-white/50 border-slate-300 hover:border-sky-400 hover:bg-sky-50 text-slate-700'
    },
    extraActivities: {
      checked: 'bg-teal-500 border-teal-500 text-white shadow-md',
      unchecked: 'bg-white/50 border-slate-300 hover:border-teal-400 hover:bg-teal-50 text-slate-700'
    }
  };

  return (
    <label className={`${baseClasses} ${checked ? colorClasses[field].checked : colorClasses[field].unchecked}`}>
      <input type="checkbox" value={value} checked={checked} onChange={onChange} className="hidden" />
      <span>{value}</span>
    </label>
  );
};


const StudentForm: React.FC<StudentFormProps> = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Error al leer los datos del formulario desde localStorage", error);
    }
    return {
      studentName: '',
      grade: SCHOOL_GRADES[0],
      topic: '',
      desempenos: '',
      textType: TEXT_TYPES[0],
      difficulty: Difficulty.Medio,
      additionalDetails: '',
      preferences: [],
      characterCount: 1500,
      saberQuestionCount: 5,
      openQuestionCount: 3,
      extraActivities: [],
      sopaDeLetrasWordCount: 10,
      sopaDeLetrasRows: 15,
      sopaDeLetrasCols: 15,
    };
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error("Error al guardar los datos del formulario en localStorage", error);
    }
  }, [formData]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumberInput = type === 'number' || type === 'range';
    
    setFormData(prev => ({ ...prev, [name]: isNumberInput ? Number(value) : value }));
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'preferences' | 'extraActivities') => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentValues = prev[field];
      const newValues = checked 
        ? [...currentValues, value]
        : currentValues.filter(p => p !== value);
      return { ...prev, [field]: newValues };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.studentName.trim()) newErrors.studentName = 'El nombre del estudiante es obligatorio.';
    if (!formData.topic.trim()) newErrors.topic = 'El tema escolar es obligatorio.';
    if (formData.characterCount < 500 || formData.characterCount > 3000) newErrors.characterCount = 'Debe estar entre 500 y 3000.';
    if (formData.saberQuestionCount < 3 || formData.saberQuestionCount > 10) newErrors.saberQuestionCount = 'Debe estar entre 3 y 10.';
    if (formData.extraActivities.includes('Preguntas Abiertas') && (formData.openQuestionCount < 1 || formData.openQuestionCount > 10)) newErrors.openQuestionCount = 'Debe estar entre 1 y 10.';
    
    if (formData.extraActivities.includes('Sopa de Letras')) {
        if (formData.sopaDeLetrasWordCount < 5 || formData.sopaDeLetrasWordCount > 15) {
            newErrors.sopaDeLetrasWordCount = 'Debe ser entre 5 y 15 palabras.';
        }
        if (formData.sopaDeLetrasRows < 10 || formData.sopaDeLetrasRows > 25) {
            newErrors.sopaDeLetrasRows = 'Debe ser entre 10 y 25 filas.';
        }
        if (formData.sopaDeLetrasCols < 10 || formData.sopaDeLetrasCols > 25) {
            newErrors.sopaDeLetrasCols = 'Debe ser entre 10 y 25 columnas.';
        }

        // New validation: Check if grid is large enough for the number of words.
        // Only run this check if the individual values are within their valid ranges.
        if (!newErrors.sopaDeLetrasWordCount && !newErrors.sopaDeLetrasRows && !newErrors.sopaDeLetrasCols) {
            // Heuristic: Total cells should be at least word count * 12
            // (Assumes avg word length of 8, with a 1.5x space factor for placement flexibility)
            const totalCells = formData.sopaDeLetrasRows * formData.sopaDeLetrasCols;
            const estimatedRequiredCells = formData.sopaDeLetrasWordCount * 12;
            if (totalCells < estimatedRequiredCells) {
                const errorMessage = 'La cuadrícula es pequeña para tantas palabras. Aumenta el tamaño o reduce la cantidad de palabras.';
                newErrors.sopaDeLetrasWordCount = errorMessage;
                newErrors.sopaDeLetrasRows = errorMessage;
                newErrors.sopaDeLetrasCols = errorMessage;
            }
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onGenerate(formData);
    }
  };

  const inputClasses = (hasError: boolean) => `w-full px-4 py-3 bg-white/50 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm placeholder:text-slate-400 ${hasError ? 'border-red-500' : 'border-slate-300'}`;
  const labelClasses = "block text-sm font-semibold text-slate-600 mb-2";

  return (
    <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/30">
        <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2">
                Generador de Talleres Creativos
            </h1>
            <p className="text-slate-600 text-md sm:text-lg">✨ Da vida al aprendizaje con historias y actividades personalizadas ✨</p>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-12">
        {/* SECTION 1: STUDENT & TOPIC */}
        <section>
            <SectionHeader icon="🎓" title="Datos del Estudiante" subtitle="Cuéntanos sobre el protagonista de esta aventura." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studentName" className={labelClasses}>Nombre del estudiante</label>
                <input type="text" name="studentName" id="studentName" value={formData.studentName} onChange={handleInputChange} className={inputClasses(!!errors.studentName)} />
                {errors.studentName && <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>}
              </div>
              <div>
                <label htmlFor="grade" className={labelClasses}>Grado escolar</label>
                <select name="grade" id="grade" value={formData.grade} onChange={handleInputChange} className={inputClasses(false)}>
                  {SCHOOL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="topic" className={labelClasses}>Tema escolar a explorar</label>
                <input type="text" name="topic" id="topic" value={formData.topic} onChange={handleInputChange} placeholder="Ej: El Ciclo del Agua, Los Planetas, La Amistad" className={inputClasses(!!errors.topic)} />
                {errors.topic && <p className="mt-1 text-sm text-red-600">{errors.topic}</p>}
              </div>
            </div>
        </section>

        {/* SECTION 2: STORY DETAILS */}
        <section>
            <SectionHeader icon="📖" title="Detalles de la Historia" subtitle="Define el tono y la estructura del texto narrativo." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                    <label htmlFor="textType" className={labelClasses}>Tipo de texto a generar</label>
                    <select name="textType" id="textType" value={formData.textType} onChange={handleInputChange} className={inputClasses(false)}>
                    {TEXT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Nivel de dificultad</label>
                    <div className="flex items-center space-x-2 bg-white/50 p-1.5 rounded-xl border-2 border-slate-300">
                    {DIFFICULTIES.map(d => (
                      <label key={d} className={`w-full text-center py-2 rounded-lg cursor-pointer transition-all ${formData.difficulty === d ? 'bg-purple-500 text-white shadow' : 'hover:bg-purple-100'}`}>
                        <input type="radio" name="difficulty" value={d} checked={formData.difficulty === d} onChange={handleInputChange} className="hidden" />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="characterCount" className={`${labelClasses} flex justify-between`}><span>Longitud del texto</span> <span className="font-bold text-purple-600">~{formData.characterCount} caracteres</span></label>
                    <input type="range" name="characterCount" id="characterCount" min="500" max="3000" step="100" value={formData.characterCount} onChange={handleInputChange} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:bg-purple-500" />
                    {errors.characterCount && <p className="mt-1 text-sm text-red-600">{errors.characterCount}</p>}
                </div>
            </div>
        </section>
        
        {/* SECTION 3: PERSONALIZATION */}
        <section>
            <SectionHeader icon="🎨" title="Toque Personal" subtitle="Agrega los intereses del estudiante para una historia única." />
             <label className={labelClasses}>Preferencias e intereses</label>
             <div className="flex flex-wrap gap-3">
                {PREFERENCES.map(p => (
                  <CheckboxTag key={p} value={p} checked={formData.preferences.includes(p)} onChange={(e) => handleCheckboxChange(e, 'preferences')} field="preferences" />
                ))}
            </div>
        </section>

        {/* SECTION 4: ADVANCED DETAILS */}
        <section>
            <SectionHeader icon="⚙️" title="Detalles Avanzados (Opcional)" subtitle="Especifica objetivos pedagógicos y otros detalles." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="desempenos" className={labelClasses}>Desempeños a Evaluar</label>
                    <textarea name="desempenos" id="desempenos" value={formData.desempenos} onChange={handleInputChange} rows={4} placeholder="Ej: Identifica las partes de una célula..." className={inputClasses(false)}></textarea>
                </div>
                <div>
                    <label htmlFor="additionalDetails" className={labelClasses}>Otros detalles del estudiante</label>
                    <textarea name="additionalDetails" id="additionalDetails" value={formData.additionalDetails} onChange={handleInputChange} rows={4} placeholder="Ej: Aprende mejor con ejemplos visuales..." className={inputClasses(false)}></textarea>
                </div>
            </div>
        </section>

        {/* SECTION 5: WORKSHOP ACTIVITIES */}
        <section>
            <SectionHeader icon="🧩" title="Actividades del Taller" subtitle="Selecciona los ejercicios para complementar la lectura." />
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <label htmlFor="saberQuestionCount" className={`${labelClasses} flex justify-between`}><span>Preguntas tipo SABER (Obligatorio)</span><span className="font-bold text-blue-600">{formData.saberQuestionCount} preguntas</span></label>
                <input type="range" name="saberQuestionCount" id="saberQuestionCount" min="3" max="10" value={formData.saberQuestionCount} onChange={handleInputChange} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-blue-500" />
                {errors.saberQuestionCount && <p className="mt-1 text-sm text-red-600">{errors.saberQuestionCount}</p>}
            </div>
             <label className={labelClasses}>Actividades opcionales</label>
            <div className="flex flex-wrap gap-3">
                {EXTRA_ACTIVITIES.map(activity => (
                    <CheckboxTag key={activity} value={activity} checked={formData.extraActivities.includes(activity)} onChange={(e) => handleCheckboxChange(e, 'extraActivities')} field="extraActivities" />
                ))}
            </div>
            
            {/* Conditional inputs */}
            <div className="mt-6 space-y-4">
                 {formData.extraActivities.includes('Preguntas Abiertas') && (
                    <div className="p-4 bg-teal-50 border-l-4 border-teal-400 rounded-r-lg">
                        <label htmlFor="openQuestionCount" className={`${labelClasses} flex justify-between`}><span>Nº de Preguntas Abiertas</span> <span className="font-bold text-teal-600">{formData.openQuestionCount}</span></label>
                        <input type="range" name="openQuestionCount" min="1" max="10" value={formData.openQuestionCount} onChange={handleInputChange} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-teal-500" />
                        {errors.openQuestionCount && <p className="mt-1 text-sm text-red-600">{errors.openQuestionCount}</p>}
                    </div>
                )}
                 {formData.extraActivities.includes('Sopa de Letras') && (
                    <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-800 mb-2">Configuración de Sopa de Letras</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="sopaDeLetrasWordCount" className="block text-xs font-medium text-slate-600 mb-1">Nº de Palabras (5-15)</label>
                                <input type="number" name="sopaDeLetrasWordCount" id="sopaDeLetrasWordCount" min="5" max="15" value={formData.sopaDeLetrasWordCount} onChange={handleInputChange} className={`${inputClasses(!!errors.sopaDeLetrasWordCount)} py-2`} />
                                {errors.sopaDeLetrasWordCount && <p className="mt-1 text-xs text-red-600">{errors.sopaDeLetrasWordCount}</p>}
                            </div>
                            <div>
                                <label htmlFor="sopaDeLetrasRows" className="block text-xs font-medium text-slate-600 mb-1">Filas (10-25)</label>
                                <input type="number" name="sopaDeLetrasRows" id="sopaDeLetrasRows" min="10" max="25" value={formData.sopaDeLetrasRows} onChange={handleInputChange} className={`${inputClasses(!!errors.sopaDeLetrasRows)} py-2`} />
                                {errors.sopaDeLetrasRows && <p className="mt-1 text-xs text-red-600">{errors.sopaDeLetrasRows}</p>}
                            </div>
                            <div>
                                <label htmlFor="sopaDeLetrasCols" className="block text-xs font-medium text-slate-600 mb-1">Columnas (10-25)</label>
                                <input type="number" name="sopaDeLetrasCols" id="sopaDeLetrasCols" min="10" max="25" value={formData.sopaDeLetrasCols} onChange={handleInputChange} className={`${inputClasses(!!errors.sopaDeLetrasCols)} py-2`} />
                                {errors.sopaDeLetrasCols && <p className="mt-1 text-xs text-red-600">{errors.sopaDeLetrasCols}</p>}
                            </div>
                        </div>
                    </div>
                 )}
            </div>
        </section>

        <div className="pt-8 text-center">
          <button type="submit" disabled={isLoading} className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xl py-4 px-16 rounded-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 ease-in-out disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:scale-100 shadow-xl hover:shadow-2xl">
            {isLoading ? 'Creando Magia...' : '¡Generar Taller!'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
