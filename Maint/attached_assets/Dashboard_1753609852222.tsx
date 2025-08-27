
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Page, WidgetKey, DateRangeKey, PlatformKey } from './types';
import { translations } from './translations';
import StatCardsWidget from './components/dashboard/StatCardsWidget';
import TrafficChartWidget from './components/dashboard/TrafficChartWidget';
import AlertsWidget from './components/dashboard/AlertsWidget';
import ConversionChartWidget from './components/dashboard/ConversionChartWidget';
import AudienceProfitabilityWidget from './components/dashboard/AudienceProfitabilityWidget';
import AddWidgetModal from './components/AddWidgetModal';
import { WrenchScrewdriverIcon, PlusIcon, CheckBadgeIcon, GoogleIcon, MetaIcon, TikTokIcon } from './components/icons';

const ALL_WIDGETS: WidgetKey[] = ['statCards', 'trafficChart', 'alerts', 'conversionChart', 'audienceProfitability'];

const widgetComponentMap: { [key in WidgetKey]: React.FC<any> } = {
    statCards: StatCardsWidget,
    trafficChart: TrafficChartWidget,
    alerts: AlertsWidget,
    conversionChart: ConversionChartWidget,
    audienceProfitability: AudienceProfitabilityWidget,
};

interface DashboardProps {
    setActivePage: (page: Page) => void;
    language: 'tr' | 'en';
}

const Dashboard: React.FC<DashboardProps> = ({ setActivePage, language }) => {
    const t = translations[language].pageContent.dashboard;

    const [isCustomizing, setIsCustomizing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dragItem = React.useRef<number | null>(null);
    const dragOverItem = React.useRef<number | null>(null);

    const [layout, setLayout] = useState<WidgetKey[]>(() => {
        try {
            const savedLayout = localStorage.getItem('dashboardLayout');
            return savedLayout ? JSON.parse(savedLayout) : ALL_WIDGETS;
        } catch (error) {
            return ALL_WIDGETS;
        }
    });

    const [dateRange, setDateRange] = useState<DateRangeKey>(() => {
        return (localStorage.getItem('dashboardDateRange') as DateRangeKey) || '30d';
    });

    const [platform, setPlatform] = useState<PlatformKey>(() => {
        return (localStorage.getItem('dashboardPlatform') as PlatformKey) || 'all';
    });

    useEffect(() => {
        localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    }, [layout]);

    useEffect(() => {
        localStorage.setItem('dashboardDateRange', dateRange);
    }, [dateRange]);

    useEffect(() => {
        localStorage.setItem('dashboardPlatform', platform);
    }, [platform]);

    const handleRemoveWidget = useCallback((keyToRemove: WidgetKey) => {
        setLayout(prev => prev.filter(key => key !== keyToRemove));
    }, []);

    const handleAddWidget = useCallback((keyToAdd: WidgetKey) => {
        setLayout(prev => [...prev, keyToAdd]);
        setIsModalOpen(false);
    }, []);

    const availableWidgetsToAdd = useMemo(() => {
        return ALL_WIDGETS.filter(key => !layout.includes(key));
    }, [layout]);

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newLayout = [...layout];
        const [reorderedItem] = newLayout.splice(dragItem.current, 1);
        newLayout.splice(dragOverItem.current, 0, reorderedItem);
        dragItem.current = null;
        dragOverItem.current = null;
        setLayout(newLayout);
    };

    const platformIcons: Record<PlatformKey, React.ReactNode> = {
        all: <div className="w-5 h-5 bg-slate-500 rounded-sm" />,
        google: <GoogleIcon className="w-5 h-5" />,
        meta: <MetaIcon className="w-5 h-5" />,
        tiktok: <TikTokIcon className="w-5 h-5 bg-white rounded-sm p-0.5" />,
    }

    const FilterButton: React.FC<{
        onClick: () => void;
        isActive: boolean;
        children: React.ReactNode;
        icon?: React.ReactNode;
    }> = ({ onClick, isActive, children, icon }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                isActive ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
            {icon}
            {children}
        </button>
    );

    return (
        <div className="space-y-6">
            <AddWidgetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                availableWidgets={availableWidgetsToAdd}
                onAddWidget={handleAddWidget}
                language={language}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        {Object.keys(t.date_filters).map(key => (
                           <FilterButton key={key} onClick={() => setDateRange(key as DateRangeKey)} isActive={dateRange === key}>
                                {t.date_filters[key]}
                            </FilterButton>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
                         {Object.keys(t.platform_filters).map(key => (
                           <FilterButton key={key} onClick={() => setPlatform(key as PlatformKey)} isActive={platform === key} icon={platformIcons[key as PlatformKey]}>
                                {t.platform_filters[key]}
                            </FilterButton>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isCustomizing && (
                         <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-500 transition-colors">
                            <PlusIcon className="w-5 h-5"/>
                            {t.add_widget}
                        </button>
                    )}
                    <button onClick={() => setIsCustomizing(!isCustomizing)} className={`flex items-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors ${isCustomizing ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                        {isCustomizing ? <CheckBadgeIcon className="w-5 h-5"/> : <WrenchScrewdriverIcon className="w-5 h-5"/>}
                        {isCustomizing ? t.save_layout : t.customize_dashboard}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {layout.map((widgetKey, index) => {
                    const WidgetComponent = widgetComponentMap[widgetKey];
                    const props = {
                        key: widgetKey,
                        language,
                        dateRange,
                        platform,
                        setActivePage,
                        isCustomizing,
                        onRemove: () => handleRemoveWidget(widgetKey),
                        dragHandleProps: {
                            draggable: isCustomizing,
                            onDragStart: () => (dragItem.current = index),
                            onDragEnter: () => (dragOverItem.current = index),
                            onDragEnd: handleDragSort,
                            onDragOver: (e: React.DragEvent) => e.preventDefault(),
                        }
                    };
                    return <WidgetComponent {...props} />;
                })}
            </div>
        </div>
    );
};

export default Dashboard;
