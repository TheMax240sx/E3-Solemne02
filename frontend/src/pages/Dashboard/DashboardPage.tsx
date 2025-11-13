import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import '../../assets/styles/dashboard/DashboardPage.css';
import { getProyectosApi, getTareasApi } from '../../services/apiService';
import type { Proyecto, Tarea } from '../../services/apiService';

// --- Importaciones para Gráficos e Iconos ---
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Briefcase, 
  ListTodo, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

// Registra todos los componentes necesarios de ChartJS
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend
);

// --- Funciones Helper ---
const displayMap: Record<string, string> = {
  in_progress: 'En Progreso',
  inprogress: 'En Progreso',
  doing: 'En Progreso',
  todo: 'Pendiente',
  to_do: 'Pendiente',
  done: 'Completada',
  completed: 'Completada',
  'sin estado': 'Sin Estado',
};

function prettyLabel(raw: string) {
  const lowerRaw = String(raw || 'Sin estado').toLowerCase();
  if (displayMap[lowerRaw]) return displayMap[lowerRaw];
  const s = lowerRaw.replace(/_/g, ' ');
  return s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// --- Componente de Gráfico Donut ---
type DonutProps = {
  entries: [string, number][];
  colors: string[];
  total: number;
  size?: number;
  strokeWidth?: number;
};

const DonutChart: React.FC<DonutProps> = ({ entries, colors, total, size = 200, strokeWidth = 32 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;
  
  return (
    <div className="donut-chart" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
        <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
          <circle r={radius} fill="none" stroke="#ecf0f1" strokeWidth={strokeWidth} />
          {entries.map(([label, count], idx) => {
            const portion = (total > 0) ? (count / total) : 0;
            const dash = portion * circumference;
            const dashArray = `${dash} ${circumference - dash}`;
            const dashOffset = -offsetAcc;
            offsetAcc += dash;
            const color = colors[idx % colors.length];
            return (
              <circle
                key={label} r={radius} fill="none" stroke={color}
                strokeWidth={strokeWidth} strokeDasharray={dashArray}
                strokeDashoffset={dashOffset} strokeLinecap="butt"
              />
            );
          })}
        </g>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="donut-center-text">
          {total}
          <tspan x="50%" dy="1.3em" className="donut-center-sub">tareas</tspan>
        </text>
      </svg>
    </div>
  );
};

// --- Componente de Gráfico de Líneas ---
type LineChartProps = {
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
};

const LineChart: React.FC<LineChartProps> = ({ chartData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };
  return <Line options={options} data={chartData} />;
};


// --- Componente Principal del Dashboard ---
const DashboardPage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lógica de carga de datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [proj, tas] = await Promise.all([getProyectosApi(), getTareasApi()]);
      setProyectos(Array.isArray(proj) ? proj : []);
      setTareas(Array.isArray(tas) ? tas : []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Lógica de Cálculo ---
  
  const tareasPorProyecto = (proyectoId: number | null | undefined) =>
    tareas.filter((t) => (t.proyecto ?? null) === (proyectoId ?? null));

  // --- 1. KPIs ---
  const totalProyectos = proyectos.length;
  const totalTareas = tareas.length;

  const normalizeStatus = (t: Tarea) => {
    // Prioriza 'status' (del form) sobre 'estado' (default del modelo)
    let raw = (t.status ?? t.estado ?? 'Sin estado').trim().toLowerCase();
    if (raw === "") raw = "Sin estado";
    return raw;
  }
  
  const tareasCompletadas = tareas.filter(t => normalizeStatus(t) === 'done').length;
  const tareasPendientes = totalTareas - tareasCompletadas;

  // --- 2. Gráfico Donut ---
  const statusCounts: Record<string, number> = tareas.reduce((acc, t) => {
    const raw = normalizeStatus(t); // Usa la función normalizada
    acc[raw] = (acc[raw] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusEntries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);
  const donutColors = ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6'];

  // --- 3. Gráfico de Líneas (Actividad Reciente) ---
  
  // Helper para agrupar datos por fecha
  const groupDataByDate = (items: { created_at: string }[]) => {
    return items.reduce((acc, item) => {
      const date = item.created_at.split('T')[0]; // Obtiene solo 'YYYY-MM-DD'
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const projectActivity = groupDataByDate(proyectos);
  const taskActivity = groupDataByDate(tareas);

  // Genera etiquetas para los últimos 7 días
  const last7DaysLabels = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse(); // Ordena de más antiguo a más nuevo

  const lineChartData = {
    labels: last7DaysLabels.map(d => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })),
    datasets: [
      {
        label: 'Proyectos Creados',
        data: last7DaysLabels.map(date => projectActivity[date] || 0),
        borderColor: 'rgb(52, 152, 219)',
        backgroundColor: 'rgba(52, 152, 219, 0.5)',
      },
      {
        label: 'Tareas Creadas',
        data: last7DaysLabels.map(date => taskActivity[date] || 0),
        borderColor: 'rgb(26, 188, 156)',
        backgroundColor: 'rgba(26, 188, 156, 0.5)',
      },
    ],
  };

  // --- Renderizado del Contenido ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="dashboard-state dashboard-loading">
          <Loader2 size={30} style={{ marginRight: '1rem', animation: 'spin 1.5s linear infinite' }} />
          Cargando proyectos y tareas...
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="dashboard-state dashboard-error">
          Error: {error}
        </div>
      );
    }

    return (
      <>
        {/* --- 1. Contenedor de KPIs Globales --- */}
        <div className="kpi-container">
          <div className="kpi-card">
            <div className="kpi-content">
              <h3 className="kpi-title">Total Proyectos</h3>
              <p className="kpi-value">{totalProyectos}</p>
            </div>
            <Briefcase className="kpi-icon" />
          </div>
          <div className="kpi-card">
            <div className="kpi-content">
              <h3 className="kpi-title">Total Tareas</h3>
              <p className="kpi-value">{totalTareas}</p>
            </div>
            <ListTodo className="kpi-icon" />
          </div>
          <div className="kpi-card">
            <div className="kpi-content">
              <h3 className="kpi-title">Tareas Completadas</h3>
              <p className="kpi-value">{tareasCompletadas}</p>
            </div>
            <CheckCircle2 className="kpi-icon" style={{color: 'var(--color-success)'}} />
          </div>
          <div className="kpi-card">
            <div className="kpi-content">
              <h3 className="kpi-title">Tareas Pendientes</h3>
              <p className="kpi-value">{tareasPendientes}</p>
            </div>
            <AlertCircle className="kpi-icon" style={{color: 'var(--color-danger)'}} />
          </div>
        </div>

        {/* --- 2. Layout de Gráficos (Donut y Líneas) --- */}
        <div className="dashboard-grid" style={{marginTop: '2rem'}}>
          {/* --- Columna 1: Gráfico Donut --- */}
          <section className="chart-container">
            <h3 className="chart-title">Tareas por estado</h3>
            {totalTareas === 0 ? (
              <p>No hay tareas para mostrar.</p>
            ) : (
              <div className="donut-wrap">
                <DonutChart
                  entries={statusEntries}
                  colors={donutColors}
                  total={totalTareas}
                  size={220}
                  strokeWidth={36}
                />
                <div className="donut-legend">
                  {statusEntries.map(([raw, count], i) => {
                    const percent = totalTareas > 0 ? Math.round((count / totalTareas) * 100) : 0;
                    const color = donutColors[i % donutColors.length];
                    return (
                      <div className="legend-item" key={raw}>
                        <span className="legend-color" style={{ backgroundColor: color }} />
                        <span className="legend-text">{prettyLabel(raw)}</span>
                        <span className="legend-count"> {count} ({percent}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* --- Columna 2: Gráfico de Líneas --- */}
          <section className="chart-container">
            <h3 className="chart-title">Actividad Reciente (Últimos 7 días)</h3>
            <div style={{ height: '300px' }}> {/* Contenedor con alto fijo */}
              <LineChart chartData={lineChartData} />
            </div>
          </section>
        </div>
        
        {/* --- Tareas sin Proyecto --- */}
        {tareasPorProyecto(null).length > 0 && (
          <section className="orphan-tasks">
            <h3>Tareas sin proyecto</h3>
            <ul>
              {tareasPorProyecto(null).map((t) => (
                <li key={t.id}>{t.title} {`(${prettyLabel(normalizeStatus(t))})`}</li>
              ))}
            </ul>
          </section>
        )}
      </>
    );
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="title">Gestor de Proyectos</h1>
        <div className="user-info">
          <span>Hola, <strong>{user?.username}</strong></span>
          <button
            className="logout-button"
            onClick={logout}
            disabled={authLoading}
          >
            {authLoading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2 className="welcome-title">Dashboard Principal</h2>
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardPage;