// app/components/dashboard/Dashboard.tsx

'use client';

import { useEffect, useState } from 'react';
import Loader from '../ui/Loader';
import MealCard from './MealCard';
import ActionButtons from './ActionButtons';

const Dashboard = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_API_URL) {
        setError("La URL de la API no está configurada en el frontend.");
        setLoading(false);
        return;
      }

      try {
        const userProfile = {
          age: 32,
          height: 180,
          weight: 75.0,
          body_fat: 12,
          stress_level: 6,
          sleep_hours: 6.5,
          training_days: 5,
          goal: "Ganar W/kg"
        };

        // La URL es la raíz del dominio del backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userProfile),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        setPlan(data);

      } catch (err: any) {
        console.error("Error al obtener el plan:", err);
        setError(`No se pudo cargar el plan. ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center font-bold">{error}</p>;
  if (!plan) return <p className="text-center">No se ha podido generar un plan.</p>;

  const todayPlan = plan.DetailedMealPlan && plan.DetailedMealPlan[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#282828] p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-2">Resumen del Análisis</h2>
          <p className="text-gray-300">{plan.AnalysisSummary}</p>
        </div>
        {todayPlan ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">{todayPlan.day}</h2>
            <div className="space-y-4">
              {todayPlan.meals.breakfast && <MealCard title="Desayuno" meal={todayPlan.meals.breakfast} />}
              {todayPlan.meals.lunch && <MealCard title="Almuerzo" meal={todayPlan.meals.lunch} />}
              {todayPlan.meals.dinner && <MealCard title="Cena" meal={todayPlan.meals.dinner} />}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No hay un plan detallado disponible.</p>
        )}
      </div>
      <div className="space-y-6">
         <div className="bg-[#282828] p-6 rounded-lg">
           <h3 className="text-lg font-bold text-white mb-2">Estrategia Actual</h3>
           <p className="text-red-400 font-semibold">{plan.CurrentStrategy}</p>
         </div>
         <ActionButtons />
      </div>
    </div>
  );
};

export default Dashboard;
