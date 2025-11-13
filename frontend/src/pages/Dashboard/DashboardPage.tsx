import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/styles/dashboard/DashboardPage.css';
import { getProyectosApi, getTareasApi } from '../../services/apiService';
import type { Proyecto, Tarea } from '../../services/apiService';

const displayMap: Record<string, string> = {
  in_progress: 'In Progress',
  inprogress: 'In Progress',
  doing: 'In Progress',
  todo: 'To Do',
  to_do: 'To Do',
  done: 'Done',
  completed: 'Done',
  'Sin estado': 'Sin estado',
};

function prettyLabel(raw: string) {
  if (displayMap[raw]) return displayMap[raw];
  // fallback: snake_case or camelCase -> Title Case
  const s = raw.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return s
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const DashboardPage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getProyectosApi(), getTareasApi()])
      .then(([proj, tas]) => {
        if (!mounted) return;
        setProyectos(Array.isArray(proj) ? proj : []);
        setTareas(Array.isArray(tas) ? tas : []);
      })
      .catch((err: any) => {
        if (!mounted) return;
        console.error(err);
        setError(err?.message ?? 'Error cargando datos');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const tareasPorProyecto = (proyectoId: number | null | undefined) =>
    tareas.filter((t) => (t.proyecto ?? null) === (proyectoId ?? null));

  const totalTareas = tareas.length;

  // contar por clave CRUDA (no transformar a etiquetas)
  const statusCounts: Record<string, number> = tareas.reduce((acc, t) => {
    const raw = (t.estado ?? t.status ?? 'Sin estado') as string;
    acc[raw] = (acc[raw] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // convertir a array y ordenar por cantidad
  const statusEntries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);

  const colors = ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#1abc9c', '#7f8c8d'];

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

        {loading ? (
          <p>Cargando proyectos y tareas...</p>
        ) : error ? (
          <p className="error">Error: {error}</p>
        ) : (
          <>
            <section className="projects-indicators">
              <h3>Proyectos</h3>
              {proyectos.length === 0 ? (
                <p>No hay proyectos disponibles.</p>
              ) : (
                <div className="indicator-container">
                  {proyectos.map((p) => {
                    const count = tareasPorProyecto(p.id).length;
                    return (
                      <div className="indicator-card project-indicator" key={p.id}>
                        <div className="indicator-title">{p.name}</div>
                        <div className="indicator-value">{count}</div>
                        <div className="indicator-sub">Tareas</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="tasks-chart">
              <h3>Tareas por estado</h3>
              {totalTareas === 0 ? (
                <p>No hay tareas para mostrar.</p>
              ) : (
                <div className="donut-wrap">
                  <DonutChart
                    entries={statusEntries}
                    colors={colors}
                    total={totalTareas}
                    size={220}
                    strokeWidth={36}
                  />
                  <div className="donut-legend">
                    {statusEntries.map(([raw, count], i) => {
                      const percent = Math.round((count / totalTareas) * 100);
                      const color = colors[i % colors.length];
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

            {tareasPorProyecto(null).length > 0 && (
              <section className="orphan-tasks">
                <h3>Tareas sin proyecto</h3>
                <ul>
                  {tareasPorProyecto(null).map((t) => (
                    <li key={t.id}>{t.title} {(t.estado ?? t.status) ? `(${prettyLabel(t.estado ?? t.status)})` : ''}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

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
            const portion = count / total;
            const dash = portion * circumference;
            const dashArray = `${dash} ${circumference - dash}`;
            const dashOffset = -offsetAcc;
            offsetAcc += dash;
            const color = colors[idx % colors.length];
            return (
              <circle
                key={label}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
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

export default DashboardPage;