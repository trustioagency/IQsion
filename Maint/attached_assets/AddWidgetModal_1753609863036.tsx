
import React from 'react';
import { translations } from '../translations';
import { WidgetKey } from '../types';
import { XMarkIcon, PlusIcon } from './icons';

interface AddWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableWidgets: WidgetKey[];
    onAddWidget: (widgetKey: WidgetKey) => void;
    language: 'tr' | 'en';
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, availableWidgets, onAddWidget, language }) => {
    if (!isOpen) return null;

    const t = translations[language].pageContent.dashboard;

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 sm:p-6 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{t.add_widget_modal_title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </header>
                <main className="p-4 sm:p-6">
                    {availableWidgets.length > 0 ? (
                        <ul className="space-y-3">
                            {availableWidgets.map(widgetKey => (
                                <li key={widgetKey}>
                                    <button
                                        onClick={() => onAddWidget(widgetKey)}
                                        className="w-full flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:bg-slate-700 hover:border-sky-500 transition-all"
                                    >
                                        <span className="font-semibold text-slate-200">{t.widget_titles[widgetKey]}</span>
                                        <PlusIcon className="w-6 h-6 text-sky-400" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400 text-center py-8">{t.all_widgets_on_dashboard}</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AddWidgetModal;
