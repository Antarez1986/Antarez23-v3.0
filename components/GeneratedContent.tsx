
import React, { useState } from 'react';
import type { GeneratedContent, ExtraActivity, VerdaderoFalsoItem, CompletarFraseItem, SopaDeLetrasContent, OrdenaFraseItem } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface GeneratedContentProps {
  content: GeneratedContent;
  studentName: string;
  onReset: () => void;
}

// Interactive Component for "Verdadero o Falso"
const VerdaderoFalsoActivity: React.FC<{ content: VerdaderoFalsoItem[] }> = ({ content }) => {
    const questions = content.map(item => item.statement);
    const answers = content.map(item => item.answer ? 'verdadero' : 'falso');
    
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    const handleAnswerChange = (index: number, answer: string) => {
        setUserAnswers(prev => ({ ...prev, [index]: answer }));
    };

    if (!questions.length) return null;

    return (
        <div className="space-y-4">
            {questions.map((q, i) => (
                <div key={i} className={`p-4 rounded-lg border ${showResults ? (userAnswers[i] === answers[i] ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : 'border-slate-200 bg-slate-50'}`}>
                    <p className="font-medium text-slate-800 mb-3">{i + 1}. {q}</p>
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name={`vf-q-${i}`} value="verdadero" onChange={() => handleAnswerChange(i, 'verdadero')} checked={userAnswers[i] === 'verdadero'} className="h-4 w-4 text-purple-600 border-slate-300 focus:ring-purple-500"/>
                            <span>Verdadero</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name={`vf-q-${i}`} value="falso" onChange={() => handleAnswerChange(i, 'falso')} checked={userAnswers[i] === 'falso'} className="h-4 w-4 text-purple-600 border-slate-300 focus:ring-purple-500"/>
                            <span>Falso</span>
                        </label>
                    </div>
                     {showResults && (
                        <p className={`mt-2 text-sm font-bold ${userAnswers[i] === answers[i] ? 'text-green-700' : 'text-red-700'}`}>
                            {userAnswers[i] === answers[i] ? '¡Correcto!' : `Incorrecto. La respuesta es: ${answers[i]}`}
                        </p>
                    )}
                </div>
            ))}
            <button onClick={() => setShowResults(true)} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition">
                Revisar Respuestas
            </button>
        </div>
    );
};


// Interactive Component for "Completar la Frase"
const CompletarFraseActivity: React.FC<{ content: CompletarFraseItem[] }> = ({ content }) => {
    const items = content;
    const answers = content.map(item => item.answer);

    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    const handleAnswerChange = (index: number, answer: string) => {
        setUserAnswers(prev => ({ ...prev, [index]: answer }));
    };

    if (!items.length) return null;

    return (
        <div className="space-y-4">
            {items.map((item, i) => (
                <div key={i} className={`p-4 rounded-lg border ${showResults ? (userAnswers[i] === answers[i] ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center space-x-2">
                        <p className="font-medium text-slate-800">{i + 1}. {item.phrase.split('_______________')[0]}</p>
                        <select
                            onChange={(e) => handleAnswerChange(i, e.target.value)}
                            value={userAnswers[i] || ''}
                            className="px-3 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="" disabled>Selecciona</option>
                            {item.options.map((opt, j) => <option key={j} value={opt}>{opt}</option>)}
                        </select>
                        <p className="font-medium text-slate-800">{item.phrase.split('_______________')[1]}</p>
                    </div>
                     {showResults && (
                        <p className={`mt-2 text-sm font-bold ${userAnswers[i] === answers[i] ? 'text-green-700' : 'text-red-700'}`}>
                            {userAnswers[i] === answers[i] ? '¡Correcto!' : `Incorrecto. La respuesta es: ${answers[i]}`}
                        </p>
                    )}
                </div>
            ))}
            <button onClick={() => setShowResults(true)} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition">
                Revisar Respuestas
            </button>
        </div>
    );
};

// Component for "Ordena la Frase"
const OrdenaFraseActivity: React.FC<{ content: OrdenaFraseItem[] }> = ({ content }) => {
    const [showResults, setShowResults] = useState(false);

    if (!content || content.length === 0) return null;

    return (
        <div className="space-y-4">
            {content.map((item, i) => (
                <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <p className="font-medium text-slate-800 mb-2">
                        {i + 1}. <span className="italic">{item.scrambledWords.join(' / ')}</span>
                    </p>
                    {showResults && (
                        <p className="mt-2 text-sm font-bold text-green-700">
                            Respuesta: {item.correctSentence}
                        </p>
                    )}
                </div>
            ))}
            {!showResults && (
                <button onClick={() => setShowResults(true)} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition">
                    Mostrar Respuestas
                </button>
            )}
        </div>
    );
};


// Component for "Sopa de Letras"
const SopaDeLetrasActivity: React.FC<{ content: SopaDeLetrasContent }> = ({ content }) => {
    const { grid, words } = content;

    if (!grid || grid.length === 0 || !words || words.length === 0) {
        return <p>Contenido de la sopa de letras no es válido.</p>;
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="overflow-x-auto">
                <table className="border-collapse border-2 border-slate-300 bg-white">
                    <tbody>
                        {grid.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td key={`${rowIndex}-${cellIndex}`} className="w-7 h-7 sm:w-8 sm:h-8 border border-slate-200 text-center font-mono font-bold text-slate-700 align-middle">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h5 className="font-bold text-lg mb-2 text-slate-800">Palabras a encontrar:</h5>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {words.map((word, index) => (
                        <li key={index} className="text-slate-600 font-medium">{word}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

interface SectionCardProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
  color?: 'blue' | 'teal' | 'purple' | 'amber' | 'rose' | 'indigo';
}

const SectionCard: React.FC<SectionCardProps> = ({ title, emoji, children, color = 'blue' }) => {
    const colorClasses = {
        blue: 'from-blue-400 to-sky-500',
        teal: 'from-teal-400 to-emerald-500',
        purple: 'from-purple-400 to-violet-500',
        amber: 'from-amber-400 to-orange-500',
        rose: 'from-rose-400 to-pink-500',
        indigo: 'from-indigo-400 to-fuchsia-500',
    };

    return (
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/30 relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-full w-2 bg-gradient-to-b ${colorClasses[color]}`}></div>
            <div className="pl-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4"><span className="mr-3 text-3xl">{emoji}</span>{title}</h3>
                <div className="space-y-4 text-slate-700">{children}</div>
            </div>
        </div>
    );
};

type ActivityStyle = {
    emoji: string;
    color: 'blue' | 'teal' | 'purple' | 'amber' | 'rose' | 'indigo';
};

const activityStyles: Record<string, ActivityStyle> = {
    'sopa de letras': { emoji: '🔎', color: 'indigo' },
    'verdadero o falso': { emoji: '✅', color: 'teal' },
    'completar la frase': { emoji: '✏️', color: 'blue' },
    'ordena la frase': { emoji: '🔄', color: 'purple' },
    'default': { emoji: '🧩', color: 'amber' },
};

const getActivityStyle = (title: string): ActivityStyle => {
    const lowerCaseTitle = title.toLowerCase();
    for (const key in activityStyles) {
        if (key !== 'default' && lowerCaseTitle.includes(key)) {
            return activityStyles[key];
        }
    }
    return activityStyles.default;
};


const GeneratedContentDisplay: React.FC<GeneratedContentProps> = ({ content, studentName, onReset }) => {
    const [downloadingPdf, setDownloadingPdf] = useState<'student' | 'teacher' | null>(null);

    // Divide el texto por los placeholders de las viñetas y renderiza el texto e imágenes.
    const renderNarrativeWithVignettes = () => {
        const parts = content.narrative.text.split(/(\[VIGNETTE_\d+\])/g);
        let vignetteIndex = 0;
        
        return parts.map((part, index) => {
            if (part.match(/\[VIGNETTE_\d+\]/)) {
                if (vignetteIndex < content.narrative.vignetteImages.length) {
                    const imageUrl = `data:image/png;base64,${content.narrative.vignetteImages[vignetteIndex]}`;
                    vignetteIndex++;
                    return (
                        <div key={index} className="my-6 flex justify-center">
                            <img src={imageUrl} alt={`Viñeta de la historia ${vignetteIndex}`} className="rounded-lg border-4 border-white shadow-lg max-w-full md:max-w-md" />
                        </div>
                    );
                }
                return null;
            }
            return <MarkdownRenderer key={index} text={part} />;
        });
    };

    const renderExtraActivity = (activity: ExtraActivity) => {
        const title = activity.title.toLowerCase();

        // Prioritize rendering based on title and available data to prevent content mismatch
        if (title.includes('sopa de letras') && activity.sopaDeLetras) {
            return <SopaDeLetrasActivity content={activity.sopaDeLetras} />;
        }
        if (title.includes('verdadero o falso') && activity.verdaderoFalso) {
            return <VerdaderoFalsoActivity content={activity.verdaderoFalso} />;
        }
        if (title.includes('completar la frase') && activity.completarFrase) {
            return <CompletarFraseActivity content={activity.completarFrase} />;
        }
        if (title.includes('ordena la frase') && activity.ordenaFrase) {
            return <OrdenaFraseActivity content={activity.ordenaFrase} />;
        }
        
        // Fallback for generic content or if model doesn't match title with content field
        if (activity.content) {
            return <MarkdownRenderer text={activity.content} />;
        }
        if (activity.sopaDeLetras) { return <SopaDeLetrasActivity content={activity.sopaDeLetras} />; }
        if (activity.verdaderoFalso) { return <VerdaderoFalsoActivity content={activity.verdaderoFalso} />; }
        if (activity.completarFrase) { return <CompletarFraseActivity content={activity.completarFrase} />; }
        if (activity.ordenaFrase) { return <OrdenaFraseActivity content={activity.ordenaFrase} />; }
        
        return null;
    };
    
    const handleDownloadPDF = async (isForTeacher: boolean) => {
        setDownloadingPdf(isForTeacher ? 'teacher' : 'student');
        try {
            const { jsPDF } = (window as any).jspdf;
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

            // --- PDF STYLING CONSTANTS ---
            const MARGIN = 15;
            const PAGE_WIDTH = doc.internal.pageSize.getWidth();
            const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
            const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;
            
            const FONT_FAMILY = 'helvetica';
            const COLOR_PRIMARY = '#6d28d9'; // purple-700
            const COLOR_SECONDARY = '#db2777'; // pink-600
            const COLOR_TEXT = '#334155'; // slate-700
            const COLOR_MUTED = '#64748b'; // slate-500
            const COLOR_BORDER = '#cbd5e1'; // slate-300

            let y = MARGIN;

            // --- PDF HELPERS ---
            const addPageNumbers = () => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                doc.setFont(FONT_FAMILY, 'italic');
                doc.setTextColor(COLOR_MUTED);
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
                }
            };

            const checkPageBreak = (heightNeeded: number) => {
                if (y + heightNeeded > PAGE_HEIGHT - MARGIN) {
                    doc.addPage();
                    y = MARGIN;
                }
            };
            
            const addText = (text: string, options: any = {}) => {
                const {
                    size = 12, font = 'normal', color = COLOR_TEXT, x = MARGIN,
                    align = 'left', spacing = 5, postSpacing = 2
                } = options;
                doc.setFontSize(size);
                doc.setFont(FONT_FAMILY, font);
                doc.setTextColor(color);
                const lines = doc.splitTextToSize(text, USABLE_WIDTH);
                const textHeight = lines.length * spacing;
                checkPageBreak(textHeight);
                doc.text(lines, x, y, { align });
                y += textHeight + postSpacing;
            };

            const stripMarkdown = (text: string) => {
                if (!text) return '';
                return text.replace(/\*\*|\*|_/g, '');
            };

            const stripAnswersFromMarkdown = (markdownContent: string): string => {
                return markdownContent.split('**Respuestas:**')[0].trim();
            };

            // --- PDF CONTENT GENERATION ---
            // 1. Title Page
            addText(content.narrative.title, { size: 24, font: 'bold', color: COLOR_PRIMARY, x: PAGE_WIDTH / 2, align: 'center', spacing: 10 });
            y += 5;
            addText(`Una aventura de aprendizaje para ${studentName}`, { size: 16, font: 'italic', color: COLOR_SECONDARY, x: PAGE_WIDTH / 2, align: 'center' });
            y += 15;

            // 2. Cover Image
            const coverImg = `data:image/png;base64,${content.narrative.coverImage}`;
            const coverImgProps = doc.getImageProperties(coverImg);
            const coverAspectRatio = coverImgProps.width / coverImgProps.height;
            const coverImgWidth = 120;
            const coverImgHeight = coverImgWidth / coverAspectRatio;
            checkPageBreak(coverImgHeight + 5);
            doc.addImage(coverImg, 'PNG', (PAGE_WIDTH - coverImgWidth) / 2, y, coverImgWidth, coverImgHeight);
            y += coverImgHeight + 10;

            // 3. Narrative with Vignettes
            const parts = content.narrative.text.split(/(\[VIGNETTE_\d+\])/g);
            let vignetteIndex = 0;
            for (const part of parts) {
                if (part.match(/\[VIGNETTE_\d+\]/)) {
                    if (vignetteIndex < content.narrative.vignetteImages.length) {
                        const vignetteImg = `data:image/png;base64,${content.narrative.vignetteImages[vignetteIndex]}`;
                        const vImgProps = doc.getImageProperties(vignetteImg);
                        const vAspectRatio = vImgProps.width / vImgProps.height;
                        const vImgWidth = 100;
                        const vImgHeight = vImgWidth / vAspectRatio;
                        checkPageBreak(vImgHeight + 5);
                        doc.addImage(vignetteImg, 'PNG', (PAGE_WIDTH - vImgWidth) / 2, y, vImgWidth, vImgHeight);
                        y += vImgHeight + 5;
                        vignetteIndex++;
                    }
                } else if (part.trim()) {
                    addText(stripMarkdown(part), { spacing: 6 });
                }
            }

            // 4. Workshop
            doc.addPage();
            y = MARGIN;
            addText('Taller de Comprensión', { size: 22, font: 'bold', color: COLOR_PRIMARY, x: PAGE_WIDTH / 2, align: 'center', postSpacing: 10 });

            const addSection = (title: string, contentFn: () => void) => {
                checkPageBreak(20); y += 5;
                doc.setFontSize(18); doc.setFont(FONT_FAMILY, 'bold'); doc.setTextColor(COLOR_SECONDARY);
                doc.text(title, MARGIN, y); y += 8;
                doc.setDrawColor(COLOR_BORDER); doc.line(MARGIN, y - 2, MARGIN + 60, y - 2);
                doc.setFontSize(12); doc.setFont(FONT_FAMILY, 'normal'); doc.setTextColor(COLOR_TEXT);
                contentFn(); y += 10;
            };
            
            // SABER Questions
            addSection('Preguntas tipo SABER', () => {
                content.workshop.saberQuestions.forEach((q, i) => {
                    checkPageBreak(25);
                    if (isForTeacher) {
                        addText(q.context, { font: 'italic', color: COLOR_MUTED, postSpacing: 4});
                    }
                    addText(`${i + 1}. ${q.question}`, {font: 'bold'});
                    q.options.forEach((opt, j) => {
                        const prefix = isForTeacher && opt === q.correctAnswer ? ' (Respuesta Correcta)' : '';
                        addText(`${String.fromCharCode(97 + j)}) ${opt}${prefix}`);
                    }); y += 5;
                });
            });

            // Matching Exercise, Open Questions, etc.
            if (content.workshop.matchingExercise) { /* ... similar logic ... */ }
            if (content.workshop.openQuestions && content.workshop.openQuestions.length > 0) { /* ... */ }
            if (content.workshop.creativeActivity) { /* ... */ }
            if (content.workshop.conceptMapFacts && content.workshop.conceptMapFacts.length > 0) { /* ... */ }

            // Extra Activities
            if (content.workshop.extraActivities && content.workshop.extraActivities.length > 0) {
                content.workshop.extraActivities.forEach(activity => {
                    addSection(activity.title, () => {
                        addText(activity.description, { size: 11, font: 'italic', color: COLOR_MUTED });
                        y += 3;

                        if (activity.sopaDeLetras) {
                            const { grid, words, solution } = activity.sopaDeLetras;
                            if (grid && grid.length > 0 && grid[0].length > 0) {
                                const numCols = grid[0].length;
                                const cellSize = Math.min(USABLE_WIDTH / numCols, 8);
                                const tableHeight = grid.length * cellSize;
                                checkPageBreak(tableHeight + 20); // Add buffer for words list
                                const startX = (PAGE_WIDTH - (numCols * cellSize)) / 2; // Center grid
                                let startY = y;

                                // --- Teacher's PDF Solution Highlighting ---
                                if (isForTeacher && solution) {
                                    const highlightColors = [
                                        [255, 228, 196], [173, 216, 230], [144, 238, 144], 
                                        [255, 182, 193], [221, 160, 221], [240, 230, 140], 
                                        [176, 224, 230] 
                                    ];
                                    solution.forEach((sol, index) => {
                                        const color = highlightColors[index % highlightColors.length];
                                        doc.setFillColor(color[0], color[1], color[2]);

                                        const { word, startRow, startCol, endRow, endCol } = sol;
                                        const dRow = Math.sign(endRow - startRow);
                                        const dCol = Math.sign(endCol - startCol);
                                        let currentRow = startRow;
                                        let currentCol = startCol;

                                        for (let i = 0; i < word.length; i++) {
                                            if (currentRow >= 0 && currentRow < grid.length && currentCol >= 0 && currentCol < numCols) {
                                                const cellX = startX + currentCol * cellSize;
                                                const cellY = startY + currentRow * cellSize;
                                                doc.rect(cellX, cellY, cellSize, cellSize, 'F');
                                            }
                                            currentRow += dRow;
                                            currentCol += dCol;
                                        }
                                    });
                                }

                                // --- Draw Grid and Letters ---
                                doc.setFontSize(cellSize * 0.7);
                                doc.setFont(FONT_FAMILY, 'normal');
                                doc.setTextColor(COLOR_TEXT);
                                doc.setDrawColor(COLOR_BORDER);
                                for (let r = 0; r < grid.length; r++) {
                                    for (let c = 0; c < numCols; c++) {
                                        const cellX = startX + c * cellSize;
                                        const cellY = startY + r * cellSize;
                                        doc.rect(cellX, cellY, cellSize, cellSize);
                                        doc.text(grid[r][c], cellX + cellSize / 2, cellY + cellSize / 2, { align: 'center', baseline: 'middle' });
                                    }
                                }
                                y += tableHeight + 5;

                                // --- Words to Find ---
                                addText("Palabras a encontrar:", {font: 'bold'});
                                addText(words.join(', '));

                            }
                        }
                        // ... rest of PDF generation for other activities
                    });
                });
            }
            
            // ... Finalize and Save PDF ...
            addPageNumbers();
            doc.save(`Taller_Creativo_${studentName.replace(/ /g, '_')}_${isForTeacher ? 'Docente' : 'Estudiante'}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Hubo un error al generar el PDF. Revisa la consola para más detalles.");
        } finally {
            setDownloadingPdf(null);
        }
    };
    
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
            {/* Header */}
            <div className="text-center p-6 sm:p-8 bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/30">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2">
                    {content.narrative.title}
                </h1>
                <p className="text-slate-600 text-lg">Una aventura de aprendizaje creada para {studentName}</p>
            </div>

            {/* Narrative Section */}
            <SectionCard title="La Historia" emoji="📖" color="rose">
                <div className="flex justify-center mb-6">
                    <img src={`data:image/png;base64,${content.narrative.coverImage}`} alt="Portada del cuento" className="rounded-xl border-4 border-white shadow-lg max-w-full md:max-w-lg" />
                </div>
                <div className="prose prose-lg max-w-none">
                    {renderNarrativeWithVignettes()}
                </div>
            </SectionCard>

            {/* Workshop Title */}
            <div className="text-center pt-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-600 mb-2">
                    Taller de Comprensión
                </h2>
                <p className="text-slate-600 text-md">¡Pongamos a prueba lo que aprendimos!</p>
            </div>
            
            <div className="space-y-6">
                 {/* Saber Questions */}
                {content.workshop.saberQuestions && content.workshop.saberQuestions.length > 0 && (
                    <SectionCard title="Preguntas tipo SABER" emoji="🎓" color="blue">
                        <div className="space-y-6">
                            {content.workshop.saberQuestions.map((q, i) => (
                                <div key={i} className="p-4 border-l-4 border-blue-200 bg-blue-50/50 rounded-r-lg">
                                    <p className="italic text-slate-600 text-sm mb-2">{q.context}</p>
                                    <p className="font-semibold text-slate-800 mb-3">{i + 1}. {q.question}</p>
                                    <ul className="space-y-2">
                                        {q.options.map((opt, j) => (
                                            <li key={j} className="text-slate-700 ml-4">{String.fromCharCode(97 + j)}. {opt}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Matching Exercise */}
                {content.workshop.matchingExercise && content.workshop.matchingExercise.columnA.length > 0 && (
                    <SectionCard title="Unir Columnas" emoji="🔗" color="amber">
                        <p>Une los conceptos de la Columna A con su descripción correcta en la Columna B.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <h4 className="font-bold text-center mb-2">Columna A</h4>
                                <ul className="space-y-2 list-decimal list-inside bg-amber-50 p-3 rounded-lg">
                                    {content.workshop.matchingExercise.columnA.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-center mb-2">Columna B</h4>
                                <ul className="space-y-2 list-disc list-inside bg-amber-50 p-3 rounded-lg">
                                    {content.workshop.matchingExercise.columnB.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* Open Questions */}
                {content.workshop.openQuestions && content.workshop.openQuestions.length > 0 && (
                    <SectionCard title="Preguntas Abiertas" emoji="🤔" color="purple">
                        <ul className="space-y-3 list-decimal list-inside">
                            {content.workshop.openQuestions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </SectionCard>
                )}

                {/* Creative Activity */}
                {content.workshop.creativeActivity && content.workshop.creativeActivity.title && (
                    <SectionCard title={content.workshop.creativeActivity.title} emoji="🎨" color="rose">
                         <MarkdownRenderer text={content.workshop.creativeActivity.description} />
                    </SectionCard>
                )}

                {/* Concept Map */}
                {content.workshop.conceptMapFacts && content.workshop.conceptMapFacts.length > 0 && (
                    <SectionCard title="Mapa Conceptual" emoji="🗺️" color="teal">
                        <p>Utiliza los siguientes hechos clave de la historia para crear un mapa conceptual o una línea de tiempo.</p>
                        <ul className="space-y-2 list-disc list-inside mt-4">
                           {content.workshop.conceptMapFacts.map((fact, i) => <li key={i}>{fact}</li>)}
                        </ul>
                    </SectionCard>
                )}
                
                {/* Extra Activities */}
                {content.workshop.extraActivities && content.workshop.extraActivities.map((activity, index) => {
                    const style = getActivityStyle(activity.title);
                    return (
                        <SectionCard key={index} title={activity.title} emoji={style.emoji} color={style.color}>
                            <p className="italic text-slate-600 mb-4">{activity.description}</p>
                            {renderExtraActivity(activity)}
                        </SectionCard>
                    );
                })}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-10 text-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                    onClick={onReset} 
                    className="w-full sm:w-auto bg-slate-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-700 transition-all duration-300 shadow-md"
                >
                    Crear Otro Taller
                </button>
                <button 
                    onClick={() => handleDownloadPDF(false)} 
                    disabled={!!downloadingPdf}
                    className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-all duration-300 shadow-md disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {downloadingPdf === 'student' ? 'Generando PDF...' : '⬇️ Descargar (Estudiante)'}
                </button>
                <button 
                    onClick={() => handleDownloadPDF(true)} 
                    disabled={!!downloadingPdf}
                    className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-all duration-300 shadow-md disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {downloadingPdf === 'teacher' ? 'Generando PDF...' : '⬇️ Descargar (Docente)'}
                </button>
            </div>
        </div>
    );
};

export default GeneratedContentDisplay;
