
import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  const formatText = (inputText: string): string => {
    if (!inputText) return '';
    let formattedText = inputText;
    
    // Escape HTML to prevent XSS
    formattedText = formattedText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Bold: **text**
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Underline: _text_
    formattedText = formattedText.replace(/_(.*?)_/g, '<u>$1</u>');

    // Newlines to <br>
    formattedText = formattedText.replace(/\n/g, '<br />');

    return formattedText;
  };

  // Usamos un <span> para que pueda ser usado en diferentes contextos (párrafos, divs, etc)
  return <span className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(text) }} />;
};

export default MarkdownRenderer;
