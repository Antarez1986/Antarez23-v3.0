
import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, GeneratedContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Esquema para la respuesta JSON del modelo de texto
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        narrative: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING, description: "El texto narrativo completo. Usa markdown para formato: **negrita**, *cursiva*, _subrayado_. Incluye exactamente 3 placeholders en el texto donde las viñetas visuales deberían ir: [VIGNETTE_1], [VIGNETTE_2], y [VIGNETTE_3]." },
                imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactamente 3 prompts descriptivos, uno para cada viñeta ([VIGNETTE_1], etc.), basados en la acción de esa parte de la historia." }
            },
        },
        workshop: {
            type: Type.OBJECT,
            properties: {
                saberQuestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            context: { type: Type.STRING, description: "Un párrafo introductorio de mínimo 100 caracteres." },
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactamente 4 opciones de respuesta." },
                            correctAnswer: { type: Type.STRING, description: "El texto exacto de la respuesta correcta de las opciones." },
                        },
                    },
                },
                matchingExercise: {
                    type: Type.OBJECT,
                    properties: {
                        columnA: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactamente 4 conceptos/eventos clave del texto." },
                        columnB: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactamente 5 descripciones/datos (1 es un distractor), desordenados." },
                        answers: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    itemA: { type: Type.STRING, description: "Un ítem de la columna A." },
                                    itemB: { type: Type.STRING, description: "Su correspondiente ítem de la columna B." },
                                }
                            },
                            description: "Las 4 parejas correctas entre la columna A y la B."
                        }
                    }
                },
                openQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Un array de preguntas abiertas para reflexión."
                },
                creativeActivity: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    }
                },
                conceptMapFacts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Proporciona exactamente 5 hechos reales y verificables de la historia, en orden aleatorio."
                },
                extraActivities: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "El título de la actividad." },
                            description: { type: Type.STRING, description: "Instrucciones para el estudiante." },
                            content: { type: Type.STRING, description: "Contenido para actividades simples en formato markdown. USA ESTE CAMPO SÓLO SI NINGÚN OTRO CAMPO DE CONTENIDO ESTRUCTURADO APLICA." },
                            sopaDeLetras: {
                                type: Type.OBJECT,
                                properties: {
                                    grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING, description: "Una letra mayúscula." } }, description: "Una cuadrícula del tamaño especificado." },
                                    words: { type: Type.ARRAY, items: { type: Type.STRING }, description: "La lista de palabras a buscar." },
                                    solution: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                word: { type: Type.STRING },
                                                startRow: { type: Type.INTEGER, description: "Fila inicial (basado en 0)." },
                                                startCol: { type: Type.INTEGER, description: "Columna inicial (basado en 0)." },
                                                endRow: { type: Type.INTEGER, description: "Fila final (basado en 0)." },
                                                endCol: { type: Type.INTEGER, description: "Columna final (basado en 0)." },
                                            }
                                        },
                                        description: "La solución, con coordenadas de inicio y fin para cada palabra."
                                    }
                                },
                                description: "Contenido estructurado para Sopa de Letras. USA ESTE CAMPO SÓLO PARA ESA ACTIVIDAD."
                            },
                            verdaderoFalso: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        statement: { type: Type.STRING },
                                        answer: { type: Type.BOOLEAN },
                                    }
                                },
                                description: "Contenido estructurado para Verdadero o Falso. USA ESTE CAMPO SÓLO PARA ESA ACTIVIDAD."
                            },
                            completarFrase: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        phrase: { type: Type.STRING, description: "La frase con un placeholder '_______________'." },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactamente 3 opciones." },
                                        answer: { type: Type.STRING, description: "La palabra o frase correcta." },
                                    }
                                },
                                description: "Contenido estructurado para Completar la Frase. USA ESTE CAMPO SÓLO PARA ESA ACTIVIDAD."
                            },
                            ordenaFrase: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        scrambledWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        correctSentence: { type: Type.STRING },
                                    }
                                },
                                description: "Contenido estructurado para Ordena la Frase. USA ESTE CAMPO SÓLO PARA ESA ACTIVIDAD."
                            },
                            categorizeWords: {
                                type: Type.OBJECT,
                                properties: {
                                    categories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Un array de 2 a 4 strings que son las categorías." },
                                    items: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                word: { type: Type.STRING, description: "La palabra o concepto a clasificar." },
                                                category: { type: Type.STRING, description: "La categoría a la que pertenece la palabra." },
                                            }
                                        },
                                        description: "Un array de 8 a 12 objetos, cada uno con una palabra y su categoría correcta."
                                    }
                                },
                                description: "Contenido estructurado para Clasificar Palabras. USA ESTE CAMPO SÓLO PARA ESA ACTIVIDAD."
                            },
                            sequenceSteps: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "El título del proceso a ordenar. Ej: 'Ciclo del Agua'."},
                                    steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Un array de 4 a 6 strings que describen los pasos en el orden cronológico CORRECTO." },
                                },
                                description: "Contenido estructurado para Ordenar Pasos de un Proceso. USA ESTE CAMPO SÓLO PARA ESA ACTIVIDAD."
                            },
                            identifyImage: {
                                type: Type.OBJECT,
                                properties: {
                                    imagePrompt: { type: Type.STRING, description: "Un prompt detallado para generar una imagen para colorear relevante a la pregunta. Debe ser descriptivo y claro." },
                                    question: { type: Type.STRING, description: "La pregunta de opción múltiple sobre la imagen." },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactamente 3 opciones de respuesta." },
                                    correctAnswer: { type: Type.STRING, description: "La respuesta correcta de las opciones." },
                                },
                                description: "Contenido para Identificar la Imagen. NO generes la imagen, solo el prompt. USA ESTE CAMPO SÓLO PARA ESA ACTIVIDAD."
                            },
                        }
                    }
                }
            },
        },
    },
};

// Construye el prompt principal
const buildPrompt = (data: FormData): string => {
    const optionalActivitiesInstructions = () => {
        let instructions = '';

        if (data.extraActivities.length > 0) {
            instructions += `
Instrucciones para las actividades opcionales solicitadas. Para cada actividad, genera un objeto en el array 'workshop.extraActivities'. Cada objeto DEBE tener 'title', 'description' y SÓLO UNO de los siguientes campos de contenido: 'content' (para markdown simple), 'sopaDeLetras', 'verdaderoFalso', 'completarFrase', 'ordenaFrase', 'categorizeWords', 'sequenceSteps', o 'identifyImage'.`;
        }

        if (data.extraActivities.includes('Unir Columnas')) {
            instructions += `
- **Unir Columnas**: Genera un ejercicio en 'workshop.matchingExercise'. Columna A con 4 conceptos, Columna B con 5 descripciones (1 distractor, desordenadas). En 'answers', proporciona las 4 parejas correctas.`;
        }
        if (data.extraActivities.includes('Preguntas Abiertas')) {
            instructions += `
- **Preguntas Abiertas**: Genera exactamente ${data.openQuestionCount} preguntas abiertas para reflexión en 'workshop.openQuestions'.`;
        }
        if (data.extraActivities.includes('Actividad Creativa')) {
            instructions += `
- **Actividad Creativa**: Genera 1 actividad para que el estudiante cree algo nuevo en 'workshop.creativeActivity'.`;
        }
        if (data.extraActivities.includes('Mapa Conceptual o Línea de Tiempo')) {
            instructions += `
- **Mapa Conceptual**: Proporciona 5 hechos reales y verificables de la historia (en orden aleatorio) en 'workshop.conceptMapFacts'.`;
        }
        if (data.extraActivities.includes('Sopa de Letras')) {
            instructions += `
- **Sopa de Letras**: Rellena el campo 'sopaDeLetras'. La 'grid' debe ser de ${data.sopaDeLetrasRows}x${data.sopaDeLetrasCols}. 'words' debe tener ${data.sopaDeLetrasWordCount} palabras clave. El objetivo es crear una sopa de letras de alta calidad, visualmente densa y desafiante.
  **Reglas de Colocación de Palabras (OBLIGATORIO):**
  1.  **Todas las Direcciones:** Utiliza TODAS las 8 direcciones posibles: horizontal (derecha e izquierda), vertical (arriba y abajo) y diagonal (las 4 direcciones).
  2.  **Palabras que se Cruzan:** Prioriza el cruce de palabras. Intenta que al menos un 30% de las palabras compartan una letra con otra palabra. Esto crea una cuadrícula más compacta y profesional.
  3.  **Distribución Aleatoria:** La posición inicial de cada palabra debe ser completamente aleatoria para evitar patrones predecibles (ej. no agrupar palabras en una esquina).
  4.  **Palabras Largas:** Si una palabra es más larga que las filas o columnas, DEBE ser colocada en diagonal.
  **Reglas de Relleno (OBLIGATORIO):**
  1.  **Relleno Inteligente:** Las letras de relleno no deben ser puramente aleatorias. Analiza las letras de las palabras ya colocadas y usa esas letras con más frecuencia en el relleno. Esto crea "pistas falsas" y aumenta la dificultad de forma significativa.
  **Reglas de la Solución (OBLIGATORIO):**
  1.  En el campo 'solution', proporciona un array con objetos para CADA palabra, especificando la palabra y sus coordenadas de inicio y fin (startRow, startCol, endRow, endCol), basadas en 0.
  2.  **VALIDACIÓN CRÍTICA:** Antes de generar la respuesta, verifica que cada palabra en 'solution' se puede reconstruir perfectamente a partir de la 'grid' utilizando sus coordenadas. La palabra puede estar al derecho o al revés. Si las coordenadas no son correctas, corrígelas. La precisión es obligatoria.
  Asegúrate de que los otros campos de contenido estructurado estén ausentes o nulos en este objeto.`;
        }
        if (data.extraActivities.includes('Completar la Frase')) {
            instructions += `
- **Completar la Frase**: Rellena el campo 'completarFrase'. Genera 5 objetos, cada uno con 'phrase' (usando '_______________'), 3 'options', y la 'answer' correcta. ASEGÚRATE de que los otros campos de contenido estructurado estén ausentes o nulos en este objeto.`;
        }
        if (data.extraActivities.includes('Verdadero o Falso')) {
            instructions += `
- **Verdadero o Falso**: Rellena el campo 'verdaderoFalso'. Genera 5 objetos, cada uno con 'statement' y 'answer' (booleano). ASEGÚRATE de que los otros campos de contenido estructurado estén ausentes o nulos en este objeto.`;
        }
        if (data.extraActivities.includes('Ordena la Frase')) {
            instructions += `
- **Ordena la Frase**: Rellena el campo 'ordenaFrase'. Genera 3 objetos, cada uno con 'scrambledWords' y 'correctSentence'. ASEGÚRATE de que los otros campos de contenido estructurado estén ausentes o nulos en este objeto.`;
        }
        if (data.extraActivities.includes('Clasificar Palabras')) {
            instructions += `
- **Clasificar Palabras**: Rellena el campo 'categorizeWords'. Genera 2-4 'categories' y 8-12 'items' (con 'word' y 'category'). Las palabras y categorías deben estar directamente relacionadas con la historia.`;
        }
        if (data.extraActivities.includes('Ordenar Pasos de un Proceso')) {
            instructions += `
- **Ordenar Pasos de un Proceso**: Rellena el campo 'sequenceSteps'. Describe un proceso clave de la historia en 4-6 'steps', listados en el orden cronológico correcto.`;
        }
        if (data.extraActivities.includes('Identificar la Imagen')) {
            instructions += `
- **Identificar la Imagen**: Rellena el campo 'identifyImage'. Crea un 'imagePrompt' para una imagen para colorear relacionada con la historia. Luego, crea una 'question' sobre esa imagen, con 3 'options' y la 'correctAnswer'.`;
        }
        // Fallback for any other activity
        instructions += `
- Para CUALQUIER OTRA actividad solicitada que no esté en la lista anterior, usa el campo 'content' con el contenido en formato markdown.`;


        return instructions || "Ninguna actividad opcional fue solicitada.";
    };


    return `
    Eres un experto escritor creativo y pedagogo. Tu tarea es generar un texto narrativo, prompts para imágenes, y un taller educativo completo basado en los datos del estudiante.

    Datos del Estudiante y Taller:
    - Nombre: ${data.studentName}
    - Grado Escolar: ${data.grade}
    - Tema Escolar: ${data.topic}
    - Desempeños a Evaluar: ${data.desempenos || 'No especificados.'}
    - Tipo de Texto: ${data.textType}
    - Nivel de Dificultad del texto: ${data.difficulty}
    - Detalles Adicionales: ${data.additionalDetails}
    - Preferencias Personales: ${data.preferences.join(', ')}
    - Longitud del Texto: Aproximadamente ${data.characterCount} caracteres
    - Actividades Solicitadas: ${data.extraActivities.join(', ') || 'Ninguna'}

    Debes seguir TODAS las siguientes reglas rigurosamente:

    REGLAS PARA EL TEXTO NARRATIVO:
    1.  **Imágenes Integradas**: En el cuerpo del texto, inserta exactamente tres placeholders: **[VIGNETTE_1]**, **[VIGNETTE_2]**, y **[VIGNETTE_3]**. En 'narrative.imagePrompts', provee 3 prompts de texto correspondientes.
    2.  **Extensión y Formato**: El texto debe tener alrededor de ${data.characterCount} caracteres. Usa markdown.
    3.  **Título y Personaje**: Crea un título creativo e incluye a '${data.studentName}' como personaje.
    4.  **Tema y Desempeños**: El tema '${data.topic}' debe ser central. El contenido del texto y las actividades del taller deben estar directamente relacionados y diseñados para evaluar los 'Desempeños a Evaluar'.
    5.  **Adaptación de Lenguaje**: Ajusta la complejidad del texto al nivel de dificultad '${data.difficulty}' y al grado escolar '${data.grade}'.
    6.  **Personalización**: Integra las preferencias (${data.preferences.join(', ')}) en la trama.

    REGLAS PARA EL TALLER:
    1.  **Preguntas tipo SABER (Obligatorio)**: Genera SIEMPRE exactamente **${data.saberQuestionCount}** preguntas en 'workshop.saberQuestions'. La complejidad DEBE adaptarse al grado escolar ('${data.grade}'). Cada una con su contexto y 4 opciones de respuesta.
    2.  **Actividades Opcionales**: Tu respuesta JSON DEBE incluir SIEMPRE las claves 'matchingExercise', 'openQuestions', 'creativeActivity', 'conceptMapFacts', y 'extraActivities'.
        - Si una actividad opcional **fue solicitada**, genera el contenido según las instrucciones.
        - Si una actividad opcional **NO fue solicitada**, debes generar un valor "vacío" que se ajuste al esquema:
            - 'matchingExercise': Debe ser un objeto con 'columnA': [], 'columnB': [], y 'answers': [].
            - 'openQuestions': Debe ser un array vacío [].
            - 'creativeActivity': Debe ser un objeto con 'title': "" y 'description': "".
            - 'conceptMapFacts': Debe ser un array vacío [].
            - 'extraActivities': Debe ser un array vacío [].
        ${optionalActivitiesInstructions()}

    Tu respuesta DEBE ser únicamente un objeto JSON válido que se ajuste al esquema proporcionado. No incluyas texto, explicaciones o \`\`\`json\`\`\` en tu respuesta.
    `;
};

const getStyleForGrade = (grade: string): string => {
    const gradeNumber = parseInt(grade.replace('°', ''));
    if (grade === 'Preescolar' || (gradeNumber >= 1 && gradeNumber <= 3)) {
        return 'estilo de dibujos animados simple para niños pequeños, contornos gruesos y claros';
    }
    if (gradeNumber >= 4 && gradeNumber <= 7) {
        return 'estilo de libro de cómics o novela gráfica, arte lineal dinámico';
    }
    if (gradeNumber >= 8 && gradeNumber <= 11) {
        return 'estilo de arte de fantasía semi-realista, ilustración detallada, arte lineal elegante, adecuado para adolescentes';
    }
    return 'arte lineal simple, contornos gruesos'; // Default
};

// Función para generar una única imagen para colorear
const generateSingleColoringImage = async (prompt: string, grade: string): Promise<string> => {
    const imageStyle = getStyleForGrade(grade);
    const fullPrompt = `Página para colorear en blanco y negro, ${imageStyle}, sin sombreado. Escena: ${prompt}`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '4:3',
        },
    });
    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    throw new Error(`No se pudo generar una imagen para el prompt: "${prompt}"`);
};

export const generateStoryAndWorkshop = async (formData: FormData): Promise<GeneratedContent> => {
    try {
        // 1. Generar el contenido de texto y los prompts para las imágenes
        const textPrompt = buildPrompt(formData);
        const textResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: textPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });
        
        let parsedContent;
        try {
            const jsonText = textResponse.text.trim();
            parsedContent = JSON.parse(jsonText);
        } catch (e) {
            console.error("Error parsing JSON response from model. Raw response:", textResponse.text, "Error:", e);
            throw new Error("La respuesta del modelo no era un JSON válido. Revisa la consola para más detalles.");
        }

        const { narrative, workshop } = parsedContent;

        if (!narrative || typeof narrative !== 'object' || !Array.isArray(narrative.imagePrompts)) {
            console.error("Invalid narrative structure in parsed content:", parsedContent);
            throw new Error("La estructura de la narrativa en la respuesta del modelo es inválida.");
        }

        // 2. Preparar todos los prompts para la generación de imágenes
        const coverPrompt = `Portada del cuento titulado "${narrative.title}" con el personaje principal, ${formData.studentName}, relacionado al tema de ${formData.topic}.`;
        let allImagePrompts = [coverPrompt, ...narrative.imagePrompts];
        
        const activityImagePrompts: { prompt: string; activityIndex: number }[] = [];
        if (workshop.extraActivities) {
            workshop.extraActivities.forEach((activity: any, index: number) => {
                if (activity.identifyImage && activity.identifyImage.imagePrompt) {
                    activityImagePrompts.push({
                        prompt: activity.identifyImage.imagePrompt,
                        activityIndex: index,
                    });
                }
            });
        }
        
        allImagePrompts.push(...activityImagePrompts.map(p => p.prompt));
        
        // 3. Generar todas las imágenes secuencialmente para evitar errores de cuota (rate limiting).
        const imagesBase64: string[] = [];
        for (const prompt of allImagePrompts) {
            // Se procesan una por una en lugar de en paralelo para no exceder la cuota de la API.
            const image = await generateSingleColoringImage(prompt, formData.grade);
            imagesBase64.push(image);
        }

        const [coverImage, ...vignetteImages] = imagesBase64.slice(0, 4);
        const activityImages = imagesBase64.slice(4);

        // 4. Inyectar las imágenes generadas de las actividades de vuelta en el objeto del taller
        activityImagePrompts.forEach((promptInfo, i) => {
            if (workshop.extraActivities[promptInfo.activityIndex]?.identifyImage) {
                workshop.extraActivities[promptInfo.activityIndex].identifyImage.generatedImage = activityImages[i];
            }
        });


        // 5. Ensamblar el resultado final
        const finalContent: GeneratedContent = {
            narrative: {
                ...narrative,
                coverImage,
                vignetteImages,
            },
            workshop: workshop,
        };
        
        return finalContent;

    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("No se pudo generar el contenido. Revisa la consola para más detalles.");
    }
};
