import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ProcessTimelineGroup from './components/ProcessTimelineGroup';
import SummaryMetrics from './components/SummaryMetrics';
import Notification from './components/Notification';
import Controls from './components/Controls';
import AIInsights from './components/AIInsights';
import ProcessAnalysis from './components/ProcessAnalysis';
import GmailSyncControls from './components/GmailSyncControls';
import UserAIInsightModal from './components/UserAIInsightModal';
import CalculationBreakdownModal from './components/CalculationBreakdownModal';
import UserDailyVariationModal from './components/WeeklyVariations';
import ProductivityModel from './components/ProductivityModel';
import RackOptimizerModal from './components/RackOptimizerModal';
import GitHubRepoCreator from './components/GitHubRepoCreator';
import { processLogData } from './services/dataProcessor';
import { RAW_OCR_DATA } from './constants';
import { UserData, ProcessResult, SortOption } from './types';

type View = 'gto' | 'productivity' | 'github';

const App: React.FC = () => {
  const [rawLogData, setRawLogData] = useState(RAW_OCR_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<View>('gto');
  
  const [processedResult, setProcessedResult] = useState<ProcessResult>(() => processLogData(rawLogData));
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const initialAreas = useMemo(() => Array.from(new Set(Array.from(processedResult.data.values()).map((d: UserData) => d.area).filter(Boolean))).sort(), [processedResult.data]);
  const initialProcesos = useMemo(() => Array.from(new Set(Array.from(processedResult.data.values()).map((d: UserData) => d.proceso).filter(Boolean))).sort(), [processedResult.data]);
  const initialNombres = useMemo(() => Array.from(new Set(Array.from(processedResult.data.values()).map((d: UserData) => d.nombre).filter(Boolean))).sort(), [processedResult.data]);

  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(() => new Set(initialAreas));
  const [selectedProcesos, setSelectedProcesos] = useState<Set<string>>(() => new Set(initialProcesos));
  const [selectedNombres, setSelectedNombres] = useState<Set<string>>(() => new Set(initialNombres));
  const [sortOption, setSortOption] = useState<SortOption>('alphabetical');
  const [analyzingUser, setAnalyzingUser] = useState<[string, UserData] | null>(null);
  const [breakdownUser, setBreakdownUser] = useState<[string, UserData] | null>(null);
  const [comparingUser, setComparingUser] = useState<[string, UserData] | null>(null);
  const [rackOptimizerUser, setRackOptimizerUser] = useState<[string, UserData] | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 8000);
  };

  const handleDataProcessing = useCallback((data: string, range?: { start: Date; end: Date }) => {
    const result = processLogData(data, range);
    setProcessedResult(result);
    
    const allAreas = Array.from(new Set(Array.from(result.data.values()).map((d: UserData) => d.area).filter(Boolean))).sort();
    setSelectedAreas(new Set(allAreas));
    
    const allProcesos = Array.from(new Set(Array.from(result.data.values()).map((d: UserData) => d.proceso).filter(Boolean))).sort();
    setSelectedProcesos(new Set(allProcesos));

    const allNombres = Array.from(new Set(Array.from(result.data.values()).map((d: UserData) => d.nombre).filter(Boolean))).sort();
    setSelectedNombres(new Set(allNombres));


    if (result.error === 'NO_HEADER') {
      showNotification("Error: No se encontró la fila de encabezado requerida. El archivo debe contener las columnas 'OPCION', 'FECHA_CREACION', 'USUARIO', 'PROCESO', 'AREA' y 'NOMBRE'.", 'error');
    } else if (result.error === 'NO_DATA') {
      let message = "Error: Encabezado encontrado, pero no se pudieron analizar registros en el rango de fechas proporcionado. Verifique el formato del archivo o ajuste el filtro de fecha.";
      if (result.firstFailedLine) {
        message += `\n\nEjemplo de una línea que falló:\n"${result.firstFailedLine}"`;
      }
      showNotification(message, 'error');
    } else {
      showNotification(`¡Éxito! Se cargaron ${result.stats.parsedLines} de ${result.stats.totalLines} registros.`, 'success');
    }
    
    setIsLoading(false);
  }, []);

  const handleFileUploaded = useCallback((fileContent: string) => {
    setNotification(null);
    setIsLoading(true);

    setTimeout(() => {
        if (!fileContent.trim()) {
            showNotification('El archivo cargado está vacío.', 'error');
            setIsLoading(false);
            return;
        }
        setRawLogData(fileContent);
        setDateRange({ start: null, end: null });
        handleDataProcessing(fileContent);
    }, 50);
  }, [handleDataProcessing]);
  
  const handleGmailSynced = useCallback((fileContent: string) => {
    setNotification(null);
    setIsLoading(true);
    setRawLogData(fileContent);
    setDateRange({ start: null, end: null });
    handleDataProcessing(fileContent);
  }, [handleDataProcessing]);
  
  const handleDateFilterApply = useCallback((range: { start: Date; end: Date }) => {
      setIsLoading(true);
      setDateRange(range);
      setTimeout(() => handleDataProcessing(rawLogData, range), 50);
  }, [rawLogData, handleDataProcessing]);

  const handleDateFilterClear = useCallback(() => {
    setIsLoading(true);
    setDateRange({ start: null, end: null });
    setTimeout(() => handleDataProcessing(rawLogData), 50);
  }, [rawLogData, handleDataProcessing]);


  const sortedAndFilteredUsers = useMemo(() => {
    const userArray = Array.from(processedResult.data.entries())
      .filter(([, userData]) => 
        selectedAreas.has(userData.area) && 
        selectedProcesos.has(userData.proceso) &&
        selectedNombres.has(userData.nombre)
      );

    switch (sortOption) {
      case 'operativeTime':
        return userArray.sort(([, a], [, b]) => b.operativeTime - a.operativeTime);
      case 'idleTime':
        return userArray.sort(([, a], [, b]) => b.idleTime - a.idleTime);
      case 'transactions':
        return userArray.sort(([, a], [, b]) => b.totalTransactions - a.totalTransactions);
      case 'connectionTime':
         return userArray.sort(([, a], [, b]) => b.connectionTime - a.connectionTime);
      case 'alphabetical':
      default:
        return userArray.sort(([a], [b]) => a.localeCompare(b));
    }
  }, [processedResult.data, selectedAreas, selectedProcesos, selectedNombres, sortOption]);

  const allAreas = useMemo(() => Array.from(new Set(Array.from(processedResult.data.values()).map((d: UserData) => d.area).filter(Boolean))).sort(), [processedResult.data]);
  const allProcesos = useMemo(() => Array.from(new Set(Array.from(processedResult.data.values()).map((d: UserData) => d.proceso).filter(Boolean))).sort(), [processedResult.data]);
  const allNombres = useMemo(() => Array.from(new Set(Array.from(processedResult.data.values()).map((d: UserData) => d.nombre).filter(Boolean))).sort(), [processedResult.data]);


  const { globalMinDate, globalMaxDate } = useMemo(() => {
    let min: Date | null = null;
    let max: Date | null = null;
    for (const [, userData] of sortedAndFilteredUsers) {
        if (userData.firstLog && (!min || userData.firstLog < min)) {
            min = userData.firstLog;
        }
        if (userData.lastLog && (!max || userData.lastLog > max)) {
            max = userData.lastLog;
        }
    }
    return { globalMinDate: min, globalMaxDate: max };
  }, [sortedAndFilteredUsers]);

  const { dayStart, dayEnd } = useMemo(() => {
    if (dateRange.start && dateRange.end) {
        return { dayStart: new Date(dateRange.start), dayEnd: new Date(dateRange.end) };
    }
    
    if (!globalMinDate || !globalMaxDate) {
        const start = new Date();
        start.setHours(1, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return { dayStart: start, dayEnd: end };
    }

    const start = new Date(globalMinDate);
    start.setMinutes(0,0,0); // Round down to the hour

    const end = new Date(globalMaxDate);
    end.setHours(end.getHours() + 1); // Round up to the next hour
    end.setMinutes(0,0,0);
    
    // Ensure timeline is at least 8 hours wide for visibility
    if(end.getTime() - start.getTime() < 8 * 3600 * 1000) {
        end.setTime(start.getTime() + 8 * 3600 * 1000);
    }

    return { dayStart: start, dayEnd: end };
  }, [dateRange, globalMinDate, globalMaxDate]);

  const groupedUsersByProcess = useMemo(() => {
    const groups: Record<string, [string, UserData][]> = {};
    sortedAndFilteredUsers.forEach(([userName, userData]) => {
      const proceso = userData.proceso || 'Sin Proceso';
      if (!groups[proceso]) {
        groups[proceso] = [];
      }
      groups[proceso].push([userName, userData]);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sortedAndFilteredUsers]);

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col font-sans">
      <Header 
        onFileUploaded={handleFileUploaded} 
        isLoading={isLoading || false} 
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {activeView === 'gto' && (
          <>
            <GmailSyncControls onDataSynced={handleGmailSynced} />
            <Controls
              allNombres={allNombres}
              selectedNombres={selectedNombres}
              onSelectedNombresChange={setSelectedNombres}
              allAreas={allAreas}
              selectedAreas={selectedAreas}
              onSelectedAreasChange={setSelectedAreas}
              allProcesos={allProcesos}
              selectedProcesos={selectedProcesos}
              onSelectedProcesosChange={setSelectedProcesos}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              onDateFilterApply={handleDateFilterApply}
              onDateFilterClear={handleDateFilterClear}
              isLoading={isLoading}
            />
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex items-center text-slate-500">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando datos...</span>
                </div>
              </div>
            ) : (
              <>
                <Notification notification={notification} onDismiss={() => setNotification(null)} />
                {processedResult.data.size > 0 ? (
                  <>
                    <SummaryMetrics filteredUsers={sortedAndFilteredUsers} />
                    <AIInsights
                        filteredData={sortedAndFilteredUsers}
                    />
                    <ProcessAnalysis 
                        filteredUsers={sortedAndFilteredUsers} 
                        selectedProcesos={selectedProcesos} 
                    />
                    
                    <div className="mt-8">
                      <div className="space-y-4">
                        {groupedUsersByProcess.map(([proceso, users]) => (
                          <ProcessTimelineGroup
                            key={proceso}
                            proceso={proceso}
                            users={users}
                            dayStart={dayStart}
                            dayEnd={dayEnd}
                            onAnalyzeUser={(userName, userData) => setAnalyzingUser([userName, userData])}
                            onShowBreakdown={(userName, userData) => setBreakdownUser([userName, userData])}
                            onCompareUser={(userName, userData) => setComparingUser([userName, userData])}
                            onOptimizeRack={(userName, userData) => setRackOptimizerUser([userName, userData])}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-white rounded-lg shadow-md">
                      <h3 className="text-xl font-semibold text-slate-700">No hay datos para mostrar</h3>
                      <p className="text-slate-500 mt-2">Cargue un archivo de registro para comenzar o ajuste sus filtros.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeView === 'productivity' && (
           <ProductivityModel processedData={processedResult.data} />
        )}

        {activeView === 'github' && (
           <GitHubRepoCreator />
        )}

        {analyzingUser && (
            <UserAIInsightModal 
              user={analyzingUser} 
              onClose={() => setAnalyzingUser(null)}
            />
        )}

        {breakdownUser && (
            <CalculationBreakdownModal
              user={breakdownUser}
              allData={processedResult.data}
              onClose={() => setBreakdownUser(null)}
            />
        )}

        {comparingUser && (
            <UserDailyVariationModal
                user={comparingUser}
                onClose={() => setComparingUser(null)}
            />
        )}

        {rackOptimizerUser && (
            <RackOptimizerModal
                user={rackOptimizerUser}
                onClose={() => setRackOptimizerUser(null)}
            />
        )}

      </main>
    </div>
  );
};

export default App;
