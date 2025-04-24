import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer 
} from 'recharts';
import './estadisticas.css';

// Determinar si estamos en desarrollo o producción
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isDevelopment ? 'http://localhost:5000' : '';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Componente para el gráfico circular de devoluciones con etiquetas mejoradas
const ReturnReasonsSection = ({ data, title, totals }) => {
  // Determinar si es un gráfico específico por especie
  const isSpeciesSpecific = title.includes('Caninos') || title.includes('Felinos');
  
  // Obtener el total correcto basado en si es específico por especie
  const getCorrectTotal = () => {
    if (title.includes('General')) {
      return totals?.total || 0;
    }
    if (title.includes('Caninos')) {
      return totals?.porEspecie?.Canina || 0;
    }
    if (title.includes('Felinos')) {
      return totals?.porEspecie?.Felina || 0;
    }
    return 0;
  };

  const total = getCorrectTotal();

  // Procesar datos para mejorar la visualización
  const processedData = data?.filter(item => item.cantidad > 0).map(item => ({
    name: item.motivo,
    value: Number(item.cantidad),
    percentage: Number(item.porcentaje)
  })) || [];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percentage < 5) return null; // No mostrar etiquetas para segmentos pequeños

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="middle"
        fontSize="12"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>Cantidad: {data.value}</p>
          <p>Porcentaje: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="chart-card return-reasons-section">
        <h2 className="chart-title">{title}</h2>
        <p className="no-data">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="chart-card return-reasons-section">
      <h2 className="chart-title">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="totals-section">
        <div className="total-card">
          <h3>Total</h3>
          <p className="total-value">{total}</p>
        </div>
      </div>
    </div>
  );
};

// Componente para tiempo de adopción con formato mejorado
const AdoptionTimeSection = ({ data, totales }) => {
  const formattedData = data?.map(item => ({
    ...item,
    rango: item.rango.replace(' o menos', ''),
    cantidad: Number(item.cantidad),
    Canina: Number(item.Canina || 0),
    Felina: Number(item.Felina || 0)
  })) || [];
  
  console.log('Raw adoption time data:', data);
  console.log('Formatted adoption time data:', formattedData);
  console.log('Adoption totals:', totales);

  const calculatedTotals = formattedData.reduce((acc, item) => ({
    Canina: acc.Canina + (item.Canina || 0),
    Felina: acc.Felina + (item.Felina || 0),
    total: acc.total + item.cantidad
  }), { Canina: 0, Felina: 0, total: 0 });

  console.log('Calculated totals:', calculatedTotals);
  
  return (
    <div className="chart-card adoption-time-section">
      <h2 className="chart-title">Tiempo hasta Adopción</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="rango" 
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis 
            tickFormatter={(value) => Math.round(value)} 
            allowDecimals={false}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === "Canina" || name === "Felina") {
                return [value, `Adoptados ${name}`];
              }
              return [value, "Total Adoptados"];
            }}
          />
          <Legend />
          <Bar 
            dataKey="Canina" 
            name="Canina" 
            stackId="a"
            fill="#82ca9d" 
          />
          <Bar 
            dataKey="Felina" 
            name="Felina" 
            stackId="a"
            fill="#8884d8" 
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="totals-section">
        <div className="total-card">
          <h3>Total Adopciones</h3>
          <p className="total-value">{totales?.total || calculatedTotals.total || 0}</p>
        </div>
        <div className="total-card">
          <h3>Caninos Adoptados</h3>
          <p className="total-value">{totales?.porEspecie?.Canina || calculatedTotals.Canina || 0}</p>
        </div>
        <div className="total-card">
          <h3>Felinos Adoptados</h3>
          <p className="total-value">{totales?.porEspecie?.Felina || calculatedTotals.Felina || 0}</p>
        </div>
      </div>
    </div>
  );
};

const NewPetsSection = ({ data, totales }) => {
  const formattedData = data?.map(item => ({
    ...item,
    especie: item.especie === 'No especificada' ? 'Sin especificar' : item.especie
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">Cantidad: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pets-card">
      <div className="pets-container">
        <h2 className="pets-title">Nuevas Patitas (Último Mes)</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="especie" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="cantidad" name="Cantidad" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-label">Total General</h3>
            <p className="stat-value">{totales?.total || 0}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-label">Total Caninos</h3>
            <p className="stat-value">{totales?.porEspecie?.Canina || 0}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-label">Total Felinos</h3>
            <p className="stat-value">{totales?.porEspecie?.Felina || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const Estadisticas = () => {
  const navigate = useNavigate();
  const [newPetsData, setNewPetsData] = useState({ data: [], totales: { total: 0, porEspecie: {} } });
  const [adoptionTimeData, setAdoptionTimeData] = useState({ data: [], totales: { total: 0, porEspecie: {} } });
  const [returnReasonsData, setReturnReasonsData] = useState([]);
  const [returnReasonsBySpecies, setReturnReasonsBySpecies] = useState({
    canina: [],
    felina: [],
    totales: { total: 0, Canina: 0, Felina: 0 }
  });
  const [refugios, setRefugios] = useState([]);
  const [filtroRefugio, setFiltroRefugio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch de datos con mejor manejo de errores
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams(
          filtroRefugio ? { refugio: filtroRefugio } : {}
        );

        const endpoints = {
          refugios: `${baseURL}/api/refugios/codigos`,
          newPets: `${baseURL}/api/new-pets?${queryParams}`,
          adoptionTime: `${baseURL}/api/adoption-time?${queryParams}`,
          returnReasons: {
            general: `${baseURL}/api/return-reasons?${queryParams}`,
            canina: `${baseURL}/api/return-reasons?${queryParams}&especie=Canina`,
            felina: `${baseURL}/api/return-reasons?${queryParams}&especie=Felina`
          }
        };

        console.log('Fetcheando datos desde:', endpoints.newPets);

        const [
          refugiosResponse,
          newPetsResponse, 
          adoptionTimeResponse,
          returnReasonsGeneralResponse,
          returnReasonsCanineResponse,
          returnReasonsFelineResponse
        ] = await Promise.all([
          axios.get(endpoints.refugios),
          axios.get(endpoints.newPets),
          axios.get(endpoints.adoptionTime),
          axios.get(endpoints.returnReasons.general),
          axios.get(endpoints.returnReasons.canina),
          axios.get(endpoints.returnReasons.felina)
        ]);

        setRefugios(refugiosResponse.data);
        setNewPetsData(newPetsResponse.data);
        setAdoptionTimeData(adoptionTimeResponse.data);
        setReturnReasonsData(returnReasonsGeneralResponse.data.data);
        setReturnReasonsBySpecies({
          canina: returnReasonsCanineResponse.data.data,
          felina: returnReasonsFelineResponse.data.data,
          totales: returnReasonsGeneralResponse.data.totales
        });

      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setError(error.response?.data?.error || 'Error al cargar las estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filtroRefugio]);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <div className="header-section">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Volver atrás
        </button>
        <h1 className="statistics-title">Estadísticas</h1>
      </div>
      
      <div className="filters-section">
        <select 
          value={filtroRefugio} 
          onChange={(e) => setFiltroRefugio(e.target.value)}
          className="filter-select"
        >
          <option value="">General</option>
          {refugios.map((codigo) => (
            <option key={codigo} value={codigo}> {codigo}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="charts-grid">
          <NewPetsSection 
            data={newPetsData.data} 
            totales={newPetsData.totales} 
          />
          
          <AdoptionTimeSection 
            data={adoptionTimeData.data} 
            totales={adoptionTimeData.totales} 
          />
          
          <ReturnReasonsSection 
            data={returnReasonsData}
            title="Motivos de Devolución - General"
            totals={returnReasonsBySpecies.totales}
          />
          
          <ReturnReasonsSection 
            data={returnReasonsBySpecies.canina}
            title="Motivos de Devolución - Caninos"
            totals={returnReasonsBySpecies.totales}
          />
          
          <ReturnReasonsSection 
            data={returnReasonsBySpecies.felina}
            title="Motivos de Devolución - Felinos"
            totals={returnReasonsBySpecies.totales}
          />
        </div>
      )}
    </div>
  );
};

export default Estadisticas;