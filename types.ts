export interface LogEntry {
  timestamp: Date;
  fechaModificacion?: Date;
  user: string;
  area: string;
  nombre: string;
  opcion: string;
  proceso: string;
  ubicacion?: string;
  desde?: string;
  hasta?: string;
  transactionId?: string;
  unidades?: number;
}

export enum SessionType {
  Active = 'active',
  Idle = 'idle',
}

export interface Session {
  start: Date;
  end: Date;
  type: SessionType;
  duration: number; // in milliseconds
}

export interface UserData {
  sessions: Session[];
  operativeTime: number; // in milliseconds
  idleTime: number; // in milliseconds
  totalTransactions: number;
  connectionTime: number; // milliseconds from first to last log
  firstLog: Date | null;
  lastLog: Date | null;
  area: string;
  nombre: string;
  proceso: string;
  logs: LogEntry[];
  hourlyTransactions: Map<string, number>;
}

export interface ProcessStats {
  totalLines: number;
  parsedLines: number;
}

export interface ProcessResult {
  data: Map<string, UserData>;
  stats: ProcessStats;
  error?: 'NO_HEADER' | 'NO_DATA';
  firstFailedLine?: string;
}

export type SortOption = 'alphabetical' | 'operativeTime' | 'idleTime' | 'transactions' | 'connectionTime';

export interface AIInsightObservation {
  tipo: 'positivo' | 'negativo';
  texto: string;
}

export interface TopUser {
    usuario: string;
    tiempoMs: number;
    tiempoFormateado: string;
}

export interface AIInsights {
  focoDelDia: {
    titulo: string;
    descripcion: string;
  };
  topUsuariosOperativos: TopUser[];
  topUsuariosInactivos: TopUser[];
  observaciones: AIInsightObservation[];
}


// --- New Individual User AI Insight Dashboard Structure ---

export interface KPI {
  titulo: string;
  valor: string;
  descripcion?: string;
}

export interface DistribucionTiempoItem {
  etiqueta: string;
  tiempoMs: number;
  porcentaje: number;
  color: string; // e.g., 'emerald' or 'amber'
}

export interface ProductividadHoraria {
    hora: string; // e.g., "09:00"
    transacciones: number;
}

export interface UserAIInsight {
  kpis: KPI[];
  distribucionTiempo: DistribucionTiempoItem[];
  productividadHoraria: ProductividadHoraria[];
  resumenAnalisis: string;
  sugerenciaAccionable: string;
}

// --- Historical Daily Variation Analysis ---
export interface UserDailyData {
    date: string; // YYYY-MM-DD
    operativeTime: number;
    idleTime: number;
    transactions: number;
    effectiveProductivity: number;
    variation: number; // Percentage vs previous day
}

export interface AIUserDailyData {
    date: string;
    operativeTimeFormatted: string;
    transactions: number;
    variation: number; // Can be Infinity for the first day
}

export interface AIDailyFeedbackResponse {
    feedback: string;
}

// --- Productivity Model Types ---
export interface HourlyMetric {
    planned: number;
    actual: number;
    deviation: number;
}

export type PlanningData = Record<string, number>; // { "07": 16, "08": 16, ... }

export interface ProcessMetrics {
    hours: Record<string, HourlyMetric>;
    productivity: Record<string, HourlyMetric>;
    transactions: Record<string, HourlyMetric>;
}

export type UnitsData = Map<string, number>; // Map<TransactionID, UnitCount>