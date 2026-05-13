import React, { useState } from 'react';
import { useConfig, FAQ } from '@/context/ConfigContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function FAQManager() {
    const { faqs, updateFaqs } = useConfig();
    const [isAdding, setIsAdding] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [newQuestionEn, setNewQuestionEn] = useState('');
    const [newAnswerEn, setNewAnswerEn] = useState('');

    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    const handleDelete = (id: string) => {
        if (confirm('¿Borrar esta pregunta?')) {
            updateFaqs(faqs.filter(f => f.id !== id));
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newQuestion && newAnswer) {
            updateFaqs([...faqs, {
                id: Date.now().toString(),
                question: newQuestion,
                answer: newAnswer,
                question_en: newQuestionEn,
                answer_en: newAnswerEn
            }]);
            setNewQuestion('');
            setNewAnswer('');
            setNewQuestionEn('');
            setNewAnswerEn('');
            setIsAdding(false);
        }
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFaq) {
            updateFaqs(faqs.map(f => f.id === editingFaq.id ? editingFaq : f));
            setEditingFaq(null);
        }
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-stone-800">
                    Preguntas Frecuentes
                </h2>
                <Button
                    variant="goldOutline"
                    onClick={() => { setIsAdding(!isAdding); setEditingFaq(null); }}
                >
                    {isAdding ? 'CERRAR' : '+ NUEVA PREGUNTA'}
                </Button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6 space-y-4 animate-in slide-in-from-top-2">
                    <input
                        placeholder="Pregunta"
                        className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Respuesta"
                        className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                        rows={3}
                        value={newAnswer}
                        onChange={e => setNewAnswer(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Question (English)"
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                            value={newQuestionEn}
                            onChange={e => setNewQuestionEn(e.target.value)}
                        />
                        <textarea
                            placeholder="Answer (English)"
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                            rows={1}
                            value={newAnswerEn}
                            onChange={e => setNewAnswerEn(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Publicar</Button>
                    </div>
                </form>
            )}

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {faqs.map(faq => (
                    <div key={faq.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100 group hover:bg-stone-100 transition-all">
                        {editingFaq?.id === faq.id ? (
                            <form onSubmit={handleEdit} className="space-y-4">
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 outline-none focus:border-gold-300"
                                    value={editingFaq.question}
                                    onChange={e => setEditingFaq({ ...editingFaq, question: e.target.value })}
                                />
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 outline-none focus:border-gold-300"
                                    rows={2}
                                    value={editingFaq.answer}
                                    onChange={e => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        placeholder="Question (EN)"
                                        className="w-full px-3 py-1 text-sm rounded border border-stone-200"
                                        value={editingFaq.question_en || ''}
                                        onChange={e => setEditingFaq({ ...editingFaq, question_en: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Answer (EN)"
                                        className="w-full px-3 py-1 text-sm rounded border border-stone-200"
                                        value={editingFaq.answer_en || ''}
                                        onChange={e => setEditingFaq({ ...editingFaq, answer_en: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingFaq(null)} className="text-xs text-stone-400">Cancelar</button>
                                    <Button type="submit">Guardar</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-stone-700 mb-1">{faq.question}</h4>
                                    <p className="text-stone-400 text-sm">{faq.answer}</p>
                                </div>
                                <div className="flex gap-4 transition-opacity">
                                    <button onClick={() => setEditingFaq(faq)} className="text-xs font-bold text-[#8B7023] hover:text-[#C5A02E]">Editar</button>
                                    <button onClick={() => handleDelete(faq.id)} className="text-xs font-bold text-red-600 hover:text-red-800">Borrar</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {faqs.length === 0 && (
                    <p className="text-center text-stone-400 italic py-10">No hay preguntas registradas.</p>
                )}
            </div>
        </Card>
    );
}
